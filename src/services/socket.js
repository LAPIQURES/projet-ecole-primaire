import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  try {
    const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    socket = io(backend, { transports: ['websocket'], auth: { token } });
    socket.on('connect', () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const identifier = String(user.username || user.id || '');
        socket.emit('identify', { identifier });
      } catch (e) {}
    });
  } catch (e) {
    // ignore
  }
  return socket;
}

export function disconnectSocket() {
  try { if (socket) socket.disconnect(); } catch (e) {}
  socket = null;
}
