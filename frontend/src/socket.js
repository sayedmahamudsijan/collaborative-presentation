import io from 'socket.io-client';

// Automatically use the deployed backend in production, and localhost during development
const socket = io(
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://collaborative-presentation.onrender.com',
  {
    transports: ['websocket'], // Optional: force WebSocket (avoid polling issues)
    withCredentials: true,
  }
);

export default socket;
