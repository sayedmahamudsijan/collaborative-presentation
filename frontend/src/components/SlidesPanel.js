import React from 'react';

function SlidesPanel({ slides, currentSlide, setCurrentSlide, addSlide, isCreator }) {
    return (
        <div className="w-64 bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Slides</h3>
            {isCreator && (
                <button
                    className="w-full bg-blue-600 text-white p-2 rounded-lg mb-4 hover:bg-blue-700 transition-colors"
                    onClick={addSlide}
                >
                    Add Slide
                </button>
            )}
            <ul className="space-y-2">
                {slides.length > 0 ? (
                    slides.map((slide) => (
                        <li
                            key={slide.id}
                            className={`p-3 rounded-lg cursor-pointer ${
                                slide.id === currentSlide?.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                            } transition-colors`}
                            onClick={() => setCurrentSlide(slide)}
                        >
                            Slide {slide.slide_index + 1}
                        </li>
                    ))
                ) : (
                    <li className="p-3 text-gray-500">No slides available</li>
                )}
            </ul>
        </div>
    );
}

export default SlidesPanel;