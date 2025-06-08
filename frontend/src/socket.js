import { io } from 'socket.io-client';

const socket = io('https://collaborative-presentation.onrender.com', {
    transports: ['websocket'],
    withCredentials: true
});

socket.on('connect', () => {
    console.log('Socket connected:', socket.id); // Debug log
});

socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message, err.stack); // Debug log
});

export default socket;
