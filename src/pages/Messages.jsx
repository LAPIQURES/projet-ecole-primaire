import React, { useEffect, useMemo, useState, useRef } from 'react';
import Layout from '../components/Layout';
import { getMessageContactsAPI, getMessagesAPI, sendMessageAPI, markConversationReadAPI, getGroupsAPI, getGroupMessagesAPI, sendGroupMessageAPI, createGroupAPI } from '../services/api';
import { io } from 'socket.io-client';
import { MessageSquare, Send, Search, Mail, CheckCheck, Users, GraduationCap } from 'lucide-react';

const roleLabel = {
  admin: 'Administration',
  superadmin: 'Administration',
  directeur: 'Directeur',
  intendant: 'Intendant',
  enseignant: 'Enseignant',
  parent: 'Parent',
};

const roleIcon = {
  admin: GraduationCap,
  superadmin: GraduationCap,
  directeur: GraduationCap,
  intendant: Users,
  enseignant: Users,
  parent: Mail,
};

const normalizeRoleForThread = (role) => {
  if (!role) return '';
  if (role === 'superadmin') return 'admin';
  return role;
};

const getUserIdentity = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      role: user.role === 'superadmin' ? 'admin' : (user.role || 'admin'),
      identifier: String(user.login || user.username || user.id || ''),
      label: user.nom || user.login || user.username || 'Utilisateur',
    };
  } catch {
    return { role: 'admin', identifier: '', label: 'Utilisateur' };
  }
};

export default function Messages({ noLayout = false }) {
  const me = useMemo(() => getUserIdentity(), []);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const socketRef = useRef(null);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const socket = io(backend, { transports: ['websocket'], auth: { token } });
      socketRef.current = socket;
      socket.on('connect', () => {
        socket.emit('identify', { identifier: me.identifier });
      });

      socket.on('message:new', (payload) => {
        setMessages((prev) => [payload, ...prev]);
      });

      socket.on('group:message:new', (payload) => {
        const gid = `group-${payload.groupId}`;
        if (selectedContact && selectedContact.identifier === gid && selectedContact.role === 'group') {
          setGroupMessages((prev) => [...prev, payload]);
        }
      });

      socket.on('group:created', (group) => {
        loadAll().catch(() => {});
      });

      return () => {
        try { socket.disconnect(); } catch (e) {}
      };
    } catch (e) {
      // ignore
    }
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [contactsRes, messagesRes, groupsRes] = await Promise.all([getMessageContactsAPI(), getMessagesAPI(), getGroupsAPI()]);
      const normalizedContacts = Array.isArray(contactsRes.data)
        ? contactsRes.data.map((item) => ({
            ...item,
            id: item.id || item.identifier,
            label: item.displayLabel || item.label || item.identifier,
          }))
        : [];
      const groups = Array.isArray(groupsRes.data) ? groupsRes.data.map(g => ({ id: `group-${g.id}`, identifier: `group-${g.id}`, role: 'group', label: g.name, displayLabel: g.name })) : [];
      const allContacts = [...normalizedContacts, ...groups];
      setContacts(allContacts);
      setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);

      if (!selectedContact && allContacts.length > 0) {
        setSelectedContact(allContacts[0]);
      }
      try {
        const socket = socketRef.current;
        if (socket && Array.isArray(groupsRes.data)) {
          groupsRes.data.forEach((g) => {
            socket.emit('join:group', g.id);
          });
        }
      } catch (e) {}
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadGroupHistory = async () => {
      if (!selectedContact || selectedContact.role !== 'group') {
        setGroupMessages([]);
        return;
      }

      try {
        const gid = String(selectedContact.identifier).replace('group-', '');
        const res = await getGroupMessagesAPI(gid);
        setGroupMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Erreur de chargement du groupe');
      }
    };

    loadGroupHistory();
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact && selectedContact.role !== 'group') {
      const unreadIds = messages
        .filter(m => !m.isRead && m.receiverRole === me.role && String(m.receiverId) === String(me.identifier) && m.senderRole === selectedContact.role && String(m.senderId) === String(selectedContact.identifier))
        .map(m => m.idMessage || m.idMessages);

      if (unreadIds.length > 0) {
        markConversationReadAPI({ messageIds: unreadIds })
          .then(() => {
            setMessages(prev => prev.map(m => unreadIds.includes(m.idMessage || m.idMessages) ? { ...m, isRead: 1 } : m));
          })
          .catch(console.error);
      }
    }
  }, [messages, selectedContact, me]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    try {
      await createGroupAPI({ name: groupName.trim(), description: groupDescription.trim() });
      setGroupName('');
      setGroupDescription('');
      setShowCreateGroup(false);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur création groupe');
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const haystack = `${contact.label} ${contact.role} ${contact.identifier}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const threadMessages = useMemo(() => {
    if (!selectedContact) return [];
    if (selectedContact.role === 'group') return groupMessages;
    const normalizedSelectedRole = normalizeRoleForThread(selectedContact.role);
    const normalizedMeRole = normalizeRoleForThread(me.role);
    return messages
      .filter((message) => {
        const senderRole = normalizeRoleForThread(message.senderRole);
        const receiverRole = normalizeRoleForThread(message.receiverRole);
        const senderMatch = senderRole === normalizedSelectedRole && String(message.senderId) === String(selectedContact.identifier);
        const receiverMatch = receiverRole === normalizedSelectedRole && String(message.receiverId) === String(selectedContact.identifier);
        const meSender = senderRole === normalizedMeRole && String(message.senderId) === String(me.identifier);
        const meReceiver = receiverRole === normalizedMeRole && String(message.receiverId) === String(me.identifier);
        return (senderMatch && meReceiver) || (receiverMatch && meSender);
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [messages, selectedContact, me]);

  useEffect(() => {
    if (!selectedContact || !threadMessages.length) return;
    const unread = threadMessages.filter((m) => m.receiverRole === me.role && String(m.receiverId) === String(me.identifier) && !m.isRead);
    if (!unread.length) return;
    markConversationReadAPI({ peerRole: selectedContact.role, peerId: selectedContact.identifier }).catch(() => {});
  }, [selectedContact, threadMessages, me]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedContact) {
      setError('Sélectionnez un destinataire');
      return;
    }
    if (!content.trim()) {
      setError('Écrivez votre message');
      return;
    }

    setSending(true);
    setError('');
    try {
      if (selectedContact.role === 'group') {
        const gid = String(selectedContact.identifier).replace('group-', '');
        const response = await sendGroupMessageAPI(gid, { content });
        if (response?.data) setGroupMessages((prev) => [...prev, response.data]);
      } else {
        await sendMessageAPI({
          receiverRole: selectedContact.role,
          receiverId: selectedContact.identifier,
          receiverLabel: selectedContact.label,
          subject,
          content,
        });
      }
      setContent('');
      setSubject('');
      setSuccess('Message envoyé');
      if (selectedContact.role === 'group') {
        const gid = String(selectedContact.identifier).replace('group-', '');
        const newMessage = {
          id: Date.now(),
          groupId: gid,
          senderRole: me.role,
          senderId: me.identifier,
          senderLabel: me.label,
          content: content.trim(),
          created_at: new Date().toISOString(),
        };
        setGroupMessages((prev) => [...prev, newMessage]);
      } else {
        const newMessage = {
          idMessage: Date.now(),
          senderRole: me.role,
          senderId: me.identifier,
          senderLabel: me.label,
          receiverRole: selectedContact.role,
          receiverId: selectedContact.identifier,
          receiverLabel: selectedContact.label,
          subject: subject.trim(),
          content: content.trim(),
          isRead: 0,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [newMessage, ...prev]);
      }
      await loadAll();
      setTimeout(() => setSuccess(''), 1800);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Impossible d’envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const renderMessagesContent = () => (
    <>
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, minHeight: noLayout ? 'auto' : 'calc(100vh - 120px)' }}>
        <aside style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #eef2f7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Chat interne</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{contacts.length} contacts disponibles</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={() => setShowCreateGroup(true)} style={{ background: '#e6f0ff', border: '1px solid #dbeafe', color: '#2563eb', padding: '8px 10px', borderRadius: 10, cursor: 'pointer' }}>Créer un groupe</button>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un contact"
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12, border: '1px solid #dbe3ee', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, color: '#64748b' }}>Chargement...</div>
            ) : filteredContacts.length === 0 ? (
              <div style={{ padding: 20, color: '#94a3b8' }}>Aucun contact trouvé</div>
            ) : (
              filteredContacts.map((contact) => {
                const Icon = roleIcon[contact.role] || Users;
                const active = selectedContact?.identifier === contact.identifier && selectedContact?.role === contact.role;
                const unreadCount = messages.filter(m => !m.isRead && m.receiverRole === me.role && String(m.receiverId) === String(me.identifier) && m.senderRole === contact.role && String(m.senderId) === String(contact.identifier)).length;
                return (
                  <button
                    key={`${contact.role}-${contact.identifier}`}
                    onClick={() => setSelectedContact(contact)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      background: active ? '#eff6ff' : '#fff',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: active ? '#2563eb' : '#e2e8f0', color: active ? '#fff' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.label}</div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{roleLabel[contact.role] || contact.role}</div>
                    </div>
                    {unreadCount > 0 && (
                      <div style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
                        {unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {selectedContact ? selectedContact.label : 'Sélectionnez un destinataire'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {selectedContact ? `Conversation avec ${roleLabel[selectedContact.role] || selectedContact.role}` : 'Choisissez un contact à gauche'}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Connecté en tant que {me.label}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 18, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 420 }}>
            {error && (
              <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>{error}</div>
            )}
            {success && (
              <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>{success}</div>
            )}

            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 6 }}>
              {threadMessages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
                  Aucun message dans cette conversation.
                </div>
              ) : (
                threadMessages.map((message) => {
                  const mine = message.senderRole === me.role && String(message.senderId) === String(me.identifier);
                  return (
                    <div key={message.idMessage} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '78%', padding: '12px 14px', borderRadius: 16, background: mine ? '#2563eb' : '#f8fafc', color: mine ? '#fff' : '#0f172a', border: mine ? 'none' : '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, opacity: 0.9 }}>
                          {message.subject || 'Sans objet'}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{message.content}</div>
                        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.72, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span>{mine ? `À ${message.receiverLabel}` : `De ${message.senderLabel}`}</span>
                          <span>{new Date(message.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                        {!mine && message.isRead ? (
                          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.8 }}>
                            <CheckCheck size={12} />
                            Lu
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} style={{ marginTop: 18, borderTop: '1px solid #eef2f7', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet"
                  style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe3ee', outline: 'none' }}
                />
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrire un message..."
                  style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe3ee', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={sending || !selectedContact}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background: '#2563eb',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: sending || !selectedContact ? 'not-allowed' : 'pointer',
                    opacity: sending || !selectedContact ? 0.7 : 1,
                  }}
                >
                  <Send size={15} />
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
      {showCreateGroup && (
        <div onClick={() => setShowCreateGroup(false)} style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.5)', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 8px 24px rgba(2,6,23,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Créer un groupe</h3>
              <button type="button" onClick={() => setShowCreateGroup(false)} style={{ padding: '8px 10px', borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#475569', cursor: 'pointer' }}>Fermer</button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Nom du groupe" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e6edf3' }} />
                <textarea value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} placeholder="Description (optionnelle)" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e6edf3', minHeight: 80 }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => setShowCreateGroup(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6edf3', background: '#fff' }}>Annuler</button>
                  <button type="submit" style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff' }}>Créer</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  if (noLayout) {
    return renderMessagesContent();
  }

  return (
    <Layout title="Messages" subtitle="Messagerie interne">
      {renderMessagesContent()}
    </Layout>
  );
}
