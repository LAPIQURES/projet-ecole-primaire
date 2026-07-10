import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMessagesAPI } from '../services/api';
import { io } from 'socket.io-client';
import { Bell, X, MessageSquare } from 'lucide-react';

const getUserIdentity = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      role: user.role === 'superadmin' ? 'admin' : (user.role || 'admin'),
      identifier: String(user.login || user.username || user.id || ''),
    };
  } catch {
    return null;
  }
};

export default function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const fetchedRef = useRef(false);

  const addNotification = (notif) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const me = getUserIdentity();
    if (!me || !me.identifier) return;

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      getMessagesAPI().then(res => {
        const msgs = Array.isArray(res.data) ? res.data : [];
        const unreadCount = msgs.filter(m => !m.isRead && m.receiverRole === me.role && String(m.receiverId) === String(me.identifier)).length;
        if (unreadCount > 0 && !location.pathname.includes('messages')) {
          addNotification({
            title: 'Messages non lus',
            message: `Vous avez ${unreadCount} message(s) non lu(s).`,
            onClick: () => navigate(me.role === 'enseignant' ? '/enseignant/messages' : me.role === 'parent' ? '/parent/messages' : '/messages')
          });
        }
      }).catch(() => {});
    }

    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const socket = io(backend, { transports: ['websocket'], auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('identify', { identifier: me.identifier });
      });

      socket.on('message:new', (payload) => {
        if (!location.pathname.includes('messages')) {
          addNotification({
            title: `Nouveau message de ${payload.senderLabel || 'un utilisateur'}`,
            message: payload.content || payload.subject,
            onClick: () => navigate(me.role === 'enseignant' ? '/enseignant/messages' : me.role === 'parent' ? '/parent/messages' : '/messages')
          });
        }
      });

      return () => { try { socket.disconnect(); } catch (e) {} };
    } catch (e) {}
  }, [location.pathname, navigate]);

  if (notifications.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          background: '#fff', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0', width: 320, padding: 16, display: 'flex', gap: 16, cursor: 'pointer',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }} onClick={() => { if (n.onClick) n.onClick(); removeNotification(n.id); }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageSquare size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
            <div style={{ fontSize: 13, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, height: 'fit-content' }}>
            <X size={16} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%) scale(0.95); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
