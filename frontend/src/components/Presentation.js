import React, { useState, useEffect } from 'react';
import SlideEditor from './SlideEditor';
import UserPanel from './UserPanel';
import SlidesPanel from './SlidesPanel';
import socket from '../socket';

function Presentation({ nickname, presentation, setSelectedPresentation }) {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(null);
    const [users, setUsers] = useState([]);
    const [isPresenting, setIsPresenting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        socket.emit('join_presentation', { presentationId: presentation.id, nickname });
        socket.on('update_users', (updatedUsers) => setUsers(updatedUsers));

        fetch(`http://localhost:5000/api/slides/${presentation.id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch slides');
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setSlides(data);
                    if (data.length > 0) setCurrentSlide(data[0]);
                } else {
                    setSlides([]);
                }
            })
            .catch((err) => {
                console.error('Error fetching slides:', err);
                setError('Failed to load slides');
                setSlides([]);
            });

        return () => {
            socket.off('update_users');
        };
    }, [presentation.id, nickname]);

    const addSlide = () => {
        if (nickname !== presentation.creator_nickname) return;
        fetch('http://localhost:5000/api/slides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ presentationId: presentation.id, slideIndex: slides.length })
        })
            .then((res) => res.json())
            .then((slide) => {
                setSlides([...slides, slide]);
                setCurrentSlide(slide);
            })
            .catch((err) => console.error('Error adding slide:', err));
    };

    if (error) {
        return <div className="p-6 text-red-600 font-semibold">{error}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <SlidesPanel
                slides={slides}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide} // Fixed prop name
                addSlide={addSlide}
                isCreator={nickname === presentation.creator_nickname}
            />
            <div className="flex-1">
                <div className="p-5 bg-white shadow-md flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">{presentation.title}</h2>
                    <div className="flex gap-2">
                        <button
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={() => setIsPresenting(!isPresenting)}
                        >
                            {isPresenting ? 'Edit Mode' : 'Presentation Mode'}
                        </button>
                        <button
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                            onClick={() => setSelectedPresentation(null)}
                        >
                            Leave
                        </button>
                    </div>
                </div>
                {currentSlide && (
                    <SlideEditor
                        slide={currentSlide}
                        presentationId={presentation.id}
                        nickname={nickname}
                        isCreator={nickname === presentation.creator_nickname}
                        isPresenting={isPresenting}
                        role={users.find((u) => u.nickname === nickname)?.role || 'viewer'}
                    />
                )}
            </div>
            <UserPanel
                users={users}
                isCreator={nickname === presentation.creator_nickname}
                presentationId={presentation.id}
            />
        </div>
    );
}

export default Presentation;