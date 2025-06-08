import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import socket from '../socket';

function SlideEditor({ slide, presentationId, nickname, isCreator, isPresenting, role }) {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [tool, setTool] = useState('text');
    const [color, setColor] = useState('#000000');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const c = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth - 300,
            height: window.innerHeight - 100,
            selection: !isPresenting && (role === 'editor' || isCreator)
        });
        setCanvas(c);

        // Load elements from backend
        fetch(`https://collaborative-presentation.onrender.com/api/elements/${slide.id}`)
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to fetch elements: ${res.status}`);
                return res.json();
            })
            .then((elements) => {
                elements.forEach((el) => {
                    if (el.type === 'text') {
                        const text = new fabric.Textbox(el.data.text, {
                            left: el.data.left,
                            top: el.data.top,
                            fontSize: el.data.fontSize,
                            fill: el.data.fill,
                            id: el.id
                        });
                        c.add(text);
                    } else {
                        const shape = new fabric[el.type === 'line' ? 'Line' : el.type](el.data);
                        shape.id = el.id;
                        c.add(shape);
                    }
                });
                c.renderAll();
            })
            .catch((err) => {
                console.error('Error fetching elements:', err.message, err.stack);
                setError('Failed to load elements');
            });

        // Save changes on modification
        c.on('object:modified', (e) => {
            const obj = e.target;
            if (obj && obj.id && (role === 'editor' || isCreator) && !isPresenting) {
                const elementData = { data: obj.toJSON(['id']) };
                console.log('Updating element:', { id: obj.id, data: elementData }); // Debug log
                fetch(`https://collaborative-presentation.onrender.com/api/elements/${obj.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(elementData)
                })
                    .then((res) => {
                        if (!res.ok) throw new Error(`Failed to update element: ${res.status}`);
                        return res.json();
                    })
                    .then((data) => {
                        console.log('Element updated:', data); // Debug log
                        socket.emit('update_element', { elementId: obj.id, data: obj.toJSON(['id']), presentationId });
                    })
                    .catch((err) => {
                        console.error('Error updating element:', err.message, err.stack);
                        setError('Failed to update element');
                    });
            }
        });

        // Socket event handlers
        socket.on('element_added', (element) => {
            if (element.slide_id === slide.id) {
                if (element.type === 'text') {
                    const text = new fabric.Textbox(element.data.text, {
                        left: element.data.left,
                        top: element.data.top,
                        fontSize: element.data.fontSize,
                        fill: element.data.fill,
                        id: element.id
                    });
                    c.add(text);
                } else {
                    const shape = new fabric[element.type === 'line' ? 'Line' : element.type](element.data);
                    shape.id = element.id;
                    c.add(shape);
                }
                c.renderAll();
            }
        });

        socket.on('element_updated', ({ id, data }) => {
            const obj = c.getObjects().find((o) => o.id === id);
            if (obj) {
                obj.set(data);
                c.renderAll();
            }
        });

        socket.on('element_deleted', (id) => {
            const obj = c.getObjects().find((o) => o.id === id);
            if (obj) {
                c.remove(obj);
                c.renderAll();
            }
        });

        return () => {
            c.off('object:modified');
            socket.off('element_added');
            socket.off('element_updated');
            socket.off('element_deleted');
            c.dispose();
        };
    }, [slide.id, isPresenting, role, isCreator]);

    const addElement = () => {
        if ((role !== 'editor' && !isCreator) || isPresenting) return;
        let element;
        let type = tool.toLowerCase();
        if (tool === 'text') {
            element = new fabric.Textbox('Type here', {
                left: 100,
                top: 100,
                fontSize: 20,
                fill: color,
                id: Date.now()
            });
        } else {
            const options = { left: 100, top: 100, fill: color, id: Date.now() };
            if (tool === 'Rect') {
                element = new fabric.Rect({ ...options, width: 100, height: 100 });
            } else if (tool === 'Circle') {
                element = new fabric.Circle({ ...options, radius: 50 });
            } else if (tool === 'Arrow') {
                type = 'line'; // Match backend schema
                element = new fabric.Line([100, 100, 200, 100], {
                    ...options,
                    stroke: color,
                    strokeWidth: 5,
                    id: Date.now()
                });
            }
        }
        if (element && canvas) {
            canvas.add(element);
            canvas.renderAll(); // Ensure element is added before API call
            const elementData = {
                slideId: slide.id,
                type,
                data: element.toJSON(['id']),
                presentationId
            };
            console.log('Sending element data:', elementData); // Debug log
            fetch('https://collaborative-presentation.onrender.com/api/elements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(elementData)
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`Failed to save element: ${res.status} ${res.statusText}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    console.log('Element saved:', data); // Debug log
                    element.id = data.id; // Update with server-assigned ID
                    canvas.renderAll();
                    socket.emit('add_element', { slideId: slide.id, element: data });
                })
                .catch((err) => {
                    console.error('Error adding element:', err.message, err.stack);
                    setError('Failed to add element');
                    // Safe removal
                    if (element && canvas.getObjects().includes(element)) {
                        canvas.remove(element);
                        canvas.renderAll();
                    }
                });
        }
    };

    const deleteElement = () => {
        if ((role !== 'editor' && !isCreator) || isPresenting) return;
        const active = canvas.getActiveObject();
        if (active && canvas) {
            canvas.remove(active);
            canvas.renderAll();
            fetch(`https://collaborative-presentation.onrender.com/api/elements/${active.id}`, {
                method: 'DELETE'
            })
                .then(() => {
                    socket.emit('delete_element', { elementId: active.id, presentationId });
                })
                .catch((err) => {
                    console.error('Error deleting element:', err.message, err.stack);
                    setError('Failed to delete element');
                });
        }
    };

    const exportPDF = () => {
        if (canvas) {
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10, 190, 100);
            pdf.save(`${presentationId}-slide-${slide.slide_index}.pdf`);
        }
    };

    const zoom = (factor) => {
        if (canvas) {
            canvas.setZoom(canvas.getZoom() * factor);
            canvas.setWidth(canvas.getWidth() * factor);
            canvas.setHeight(canvas.getHeight() * factor);
            canvas.renderAll();
        }
    };

    if (error) {
        return <div className="p-6 text-red-600 font-semibold">{error}</div>;
    }

    return (
        <div>
            {!isPresenting && (role === 'editor' || isCreator) && (
                <div className="p-2 bg-gray-200 flex">
                    <select onChange={(e) => setTool(e.target.value)} className="mr-2 p-1">
                        <option value="text">Text</option>
                        <option value="Rect">Rectangle</option>
                        <option value="Circle">Circle</option>
                        <option value="Arrow">Arrow</option>
                    </select>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mr-2" />
                    <button className="bg-blue-500 text-white p-2 rounded mr-2" onClick={addElement}>
                        Add
                    </button>
                    <button className="bg-red-500 text-white p-2 rounded mr-2" onClick={deleteElement}>
                        Delete
                    </button>
                    <button className="bg-green-500 text-white p-2 rounded mr-2" onClick={exportPDF}>
                        Export PDF
                    </button>
                    <button className="bg-gray-500 text-white p-2 rounded mr-2" onClick={() => zoom(1.1)}>
                        Zoom In
                    </button>
                    <button className="bg-gray-500 text-white p-2 rounded" onClick={() => zoom(0.9)}>
                        Zoom Out
                    </button>
                </div>
            )}
            <canvas ref={canvasRef} className="border" />
        </div>
    );
}

export default SlideEditor;
