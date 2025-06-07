import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PresentationList({ nickname, setSelectedPresentation }) {
    const [presentations, setPresentations] = useState([]);
    const [title, setTitle] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get('http://localhost:5000/api/presentations')
            .then((res) => setPresentations(res.data))
            .catch((err) => {
                console.error('Error fetching presentations:', err);
                setError('Failed to load presentations');
            });
    }, []);

    const createPresentation = () => {
        axios
            .post('http://localhost:5000/api/presentations', { title, nickname })
            .then((res) => {
                setSelectedPresentation(res.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error creating presentation:', err);
                setError('Failed to create presentation');
            });
    };

    const joinPresentation = (presentation) => {
        axios
            .post('http://localhost:5000/api/presentations/join', {
                presentationId: presentation.id,
                nickname
            })
            .then(() => {
                setSelectedPresentation(presentation);
                setError(null);
            })
            .catch((err) => {
                console.error('Error joining presentation:', err);
                setError('Failed to join presentation');
            });
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Presentations</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-6 flex gap-2">
                <input
                    type="text"
                    className="flex-1 border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Presentation Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button
                    className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    onClick={createPresentation}
                    disabled={!title.trim()}
                >
                    Create
                </button>
            </div>
            <ul className="space-y-2">
                {presentations.map((p) => (
                    <li
                        key={p.id}
                        className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-gray-700">
                            {p.title} <span className="text-sm text-gray-500">(Creator: {p.creator_nickname})</span>
                        </span>
                        <button
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                            onClick={() => joinPresentation(p)}
                        >
                            Join
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PresentationList;