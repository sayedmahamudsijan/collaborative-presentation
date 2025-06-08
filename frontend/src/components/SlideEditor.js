import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import jsPDF from 'jspdf';

function SlideEditor({ slide, presentationId, nickname, isCreator, isPresenting, role }) {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState(null);

    useEffect(() => {
        const c = new fabric.Canvas(canvasRef.current);
        setCanvas(c);

        fetch(`https://collaborative-presentation.onrender.com/api/elements/${slide.id}`)
            .then((res) => res.json())
            .then((elements) => {
                elements.forEach((el) => {
                    if (el.type === 'text') {
                        c.add(new fabric.Textbox(el.data.text, el.data));
                    } else if (el.type === 'rect') {
                        c.add(new fabric.Rect(el.data));
                    }
                });
                c.renderAll();
            })
            .catch((err) => {
                console.error('Error fetching elements:', err);
                setError('Failed to load elements');
            });

        return () => c.dispose();
    }, [slide.id]);

    const addText = () => {
        if (role !== 'editor' && !isCreator) return;
        const text = new fabric.Textbox('Edit me', {
            left: 100,
            top: 100,
            width: 200,
            fontSize: 20
        });
        canvas.add(text);
        fetch('https://collaborative-presentation.onrender.com/api/elements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slideId: slide.id, type: 'text', data: text.toJSON() })
        })
            .catch((err) => console.error('Error adding text:', err));
    };

    const exportPDF = () => {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 100);
        pdf.save('slide.pdf');
    };

    if (error) {
        return <div className="p-6 text-red-600 font-semibold">{error}</div>;
    }

    return (
        <div className="p-6 bg-white shadow-md">
            <div className="flex gap-2 mb-4">
                {(isCreator || role === 'editor') && !isPresenting && (
                    <button
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                        onClick={addText}
                    >
                        Add Text
                    </button>
                )}
                <button
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                    onClick={exportPDF}
                >
                    Export PDF
                </button>
                <button
                    className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
                    onClick={() => setZoom(zoom + 0.1)}
                >
                    Zoom In
                </button>
                <button
                    className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
                    onClick={() => setZoom(zoom - 0.1)}
                >
                    Zoom Out
                </button>
            </div>
            <canvas ref={canvasRef} width={800} height={600} className="border border-gray-300" />
        </div>
    );
}

export default SlideEditor;
