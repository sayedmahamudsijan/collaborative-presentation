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

       useEffect(() => {
           const c = new fabric.Canvas(canvasRef.current, {
               width: window.innerWidth - 300,
               height: window.innerHeight - 100,
               selection: !isPresenting && role === 'editor'
           });
           setCanvas(c);

           fetch(`https://collaborative-presentation.onrender.com/api/elements/${slide.id}`)
               .then((res) => res.json())
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
                           const shape = new fabric[el.type](el.data);
                           shape.id = el.id;
                           c.add(shape);
                       }
                   });
                   c.renderAll();
               });

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
                       const shape = new fabric[el.type](el.data);
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
               c.dispose();
               socket.off('element_added');
               socket.off('element_updated');
               socket.off('element_deleted');
           };
       }, [slide.id, isPresenting, role]);

       const addElement = () => {
           if (role !== 'editor' || isPresenting) return;
           let element;
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
               if (tool === 'Rect') element = new fabric.Rect({ ...options, width: 100, height: 100 });
               if (tool === 'Circle') element = new fabric.Circle({ ...options, radius: 50 });
               if (tool === 'Arrow') {
                   element = new fabric.Line([100, 100, 200, 100], {
                       ...options,
                       stroke: color,
                       strokeWidth: 5,
                       id: Date.now()
                   });
               }
           }
           canvas.add(element);
           fetch('https://collaborative-presentation.onrender.com/api/elements', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ slideId: slide.id, type: tool, data: element.toJSON(['id']) })
           }).then((res) => res.json()).then((data) => {
               socket.emit('add_element', { slideId: slide.id, element: data });
           });
       };

       const deleteElement = () => {
           if (role !== 'editor' || isPresenting) return;
           const active = canvas.getActiveObject();
           if (active) {
               canvas.remove(active);
               fetch(`https://collaborative-presentation.onrender.com/api/elements/${active.id}`, { method: 'DELETE' }).then(() => {
                   socket.emit('delete_element', { elementId: active.id, presentationId });
               });
           }
       };

       const exportPDF = () => {
           const pdf = new jsPDF();
           const imgData = canvas.toDataURL('image/png');
           pdf.addImage(imgData, 'PNG', 10, 10, 190, 100);
           pdf.save(`${presentationId}-slide-${slide.slide_index}.pdf`);
       };

       const zoom = (factor) => {
           canvas.setZoom(canvas.getZoom() * factor);
           canvas.setWidth(canvas.getWidth() * factor);
           canvas.setHeight(canvas.getHeight() * factor);
       };

       return (
           <div>
               {!isPresenting && role === 'editor' && (
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
