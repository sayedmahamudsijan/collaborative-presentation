import React, { useState, Component } from 'react';
import PresentationList from './components/PresentationList';
import Presentation from './components/Presentation';
import './index.css';

class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-red-600 font-semibold text-center">
                    Something went wrong. Please refresh the page or try again.
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    const [nickname, setNickname] = useState('');
    const [selectedPresentation, setSelectedPresentation] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleJoin = (e) => {
        e.preventDefault();
        if (nickname.trim().length < 3) {
            setError('Nickname must be at least 3 characters');
            return;
        }
        setError(null);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
            {!isSubmitted ? (
                <form
                    onSubmit={handleJoin}
                    className="p-8 bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all hover:scale-105"
                    aria-labelledby="join-presentation-title"
                >
                    <h1
                        id="join-presentation-title"
                        className="text-3xl font-bold text-gray-800 mb-6 text-center"
                    >
                        Join Presentation
                    </h1>
                    {error && (
                        <p
                            className="text-red-500 mb-4 text-center"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                    <div className="mb-4">
                        <label
                            htmlFor="nickname"
                            className="block text-sm font-medium text-gray-600 mb-2"
                        >
                            Enter Your Nickname
                        </label>
                        <input
                            id="nickname"
                            type="text"
                            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Your nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') e.preventDefault();
                            }}
                            autoFocus
                            aria-required="true"
                            aria-describedby="nickname-error"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        disabled={nickname.trim().length < 3}
                        aria-disabled={nickname.trim().length < 3}
                    >
                        Join
                    </button>
                </form>
            ) : !selectedPresentation ? (
                <PresentationList
                    nickname={nickname}
                    setSelectedPresentation={setSelectedPresentation}
                />
            ) : (
                <ErrorBoundary>
                    <Presentation
                        nickname={nickname}
                        presentation={selectedPresentation}
                        setSelectedPresentation={setSelectedPresentation}
                    />
                </ErrorBoundary>
            )}
        </div>
    );
}

export default App;