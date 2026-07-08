import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

export default function TeacherMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout title="Messages">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          Chargement de vos messages...
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="Messages" subtitle={`${messages.length} message(s)`}>
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '13px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>Aucun message</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>
                  {msg.senderName || msg.sender || 'Expéditeur'}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {new Date(msg.createdAt || msg.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                {msg.content || msg.message || '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </TeacherLayout>
  );
}
