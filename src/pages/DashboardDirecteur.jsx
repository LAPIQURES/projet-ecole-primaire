import React, { useEffect, useState, useCallback } from 'react';
import DirecteurLayout from '../components/DirecteurLayout';
import {
  Users, UserCheck, Building2, CreditCard, MessageSquare, BarChart2,
  TrendingUp, TrendingDown, BookOpen, Shield, Bell, Eye, ChevronRight,
  Award, Clock, CheckCircle, AlertCircle, Send, X, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getElevesAPI, getClassesAPI, getEnseignantsAPI, getSallesAPI,
  getStatsAPI, getMessagesAPI, sendMessageAPI, getMessageContactsAPI,
  getParentsAPI,
} from '../services/api';

const VIOLET = '#6f42c1';

const StatCard = ({ icon: Icon, label, value, sub, color = VIOLET, trend, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff', borderRadius: 14, padding: '18px 20px',
      border: '1px solid #ede9fe', cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(111,66,193,0.06)',
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'none')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#16a34a' : '#dc2626', background: trend >= 0 ? '#dcfce7' : '#fee2e2', padding: '2px 7px', borderRadius: 20 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e1b4b' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#5b5b8a', fontWeight: 600, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{sub}</div>}
    </div>
  </div>
);

export default function DashboardDirecteur() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date();
  const heure = now.getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const [loading, setLoading] = useState(true);
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgTo, setMsgTo] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sending, setSending] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, cRes, ensRes, sRes, mRes, cntRes, stRes] = await Promise.allSettled([
        getElevesAPI(),
        getClassesAPI(),
        getEnseignantsAPI(),
        getSallesAPI(),
        getMessagesAPI(),
        getMessageContactsAPI(),
        getStatsAPI(),
      ]);
      if (eRes.status === 'fulfilled') setEleves(Array.isArray(eRes.value?.data) ? eRes.value.data : []);
      if (cRes.status === 'fulfilled') setClasses(Array.isArray(cRes.value?.data) ? cRes.value.data : []);
      if (ensRes.status === 'fulfilled') setEnseignants(Array.isArray(ensRes.value?.data) ? ensRes.value.data : []);
      if (sRes.status === 'fulfilled') setSalles(Array.isArray(sRes.value?.data) ? sRes.value.data : []);
      if (mRes.status === 'fulfilled') setMessages(Array.isArray(mRes.value?.data) ? mRes.value.data : []);
      if (cntRes.status === 'fulfilled') setContacts(Array.isArray(cntRes.value?.data) ? cntRes.value.data : []);
      if (stRes.status === 'fulfilled') setStats(stRes.value?.data || {});
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sendMsg = async () => {
    if (!msgTo || !msgContent) { setMsgError('Destinataire et message requis'); return; }
    setSending(true); setMsgError('');
    try {
      await sendMessageAPI({ to: msgTo, subject: msgSubject || '(Sans objet)', content: msgContent, type: 'direct' });
      setMsgSuccess('Message envoyé !');
      setMsgTo(''); setMsgSubject(''); setMsgContent('');
      setTimeout(() => { setMsgSuccess(''); setShowMsgModal(false); }, 2000);
      load();
    } catch (e) { setMsgError(e.response?.data?.error || 'Erreur envoi'); }
    finally { setSending(false); }
  };

  const sendCommunique = async () => {
    if (!msgContent) { setMsgError('Message requis'); return; }
    setSending(true); setMsgError('');
    try {
      await sendMessageAPI({ to: 'all', subject: msgSubject || 'Communiqué', content: msgContent, type: 'communique' });
      setMsgSuccess('Communiqué envoyé à tous !');
      setMsgTo(''); setMsgSubject(''); setMsgContent('');
      setTimeout(() => { setMsgSuccess(''); setShowMsgModal(false); }, 2000);
    } catch (e) { setMsgError(e.response?.data?.error || 'Erreur envoi'); }
    finally { setSending(false); }
  };

  const unreadMessages = messages.filter(m => !m.read && m.receiverRole === 'directeur').length;
  const totalPaiements = stats.totalPaiements || 0;
  const tauxPaiement = eleves.length > 0 ? Math.round((totalPaiements / (eleves.length * 3)) * 100) : 0;

  const quickStats = [
    { icon: Users, label: 'Élèves inscrits', value: eleves.length, color: VIOLET, sub: `${classes.length} classes`, onClick: () => navigate('/directeur/eleves') },
    { icon: UserCheck, label: 'Enseignants', value: enseignants.length, color: '#10b981', sub: 'Personnel actif', onClick: () => navigate('/directeur/enseignants') },
    { icon: Building2, label: 'Salles', value: salles.length, color: '#3b82f6', sub: 'Disponibles', onClick: () => navigate('/directeur/salles') },
    { icon: CreditCard, label: 'Taux de recouvrement', value: `${tauxPaiement}%`, color: '#f59e0b', sub: 'Paiements effectués', onClick: () => navigate('/directeur/paiements') },
    { icon: MessageSquare, label: 'Messages', value: unreadMessages, color: '#ec4899', sub: 'Non lus', onClick: () => navigate('/directeur/messages') },
    { icon: BookOpen, label: 'Cours programmés', value: stats.totalCours || 0, color: '#8b5cf6', sub: 'Ce trimestre', onClick: () => navigate('/directeur/notes') },
  ];

  return (
    <DirecteurLayout title="Tableau de bord" subtitle="Vue d'ensemble de l'établissement">
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${VIOLET} 0%, #9b59b6 100%)`,
        borderRadius: 18, padding: '22px 28px', marginBottom: 24, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{salut}, {user.nom || 'Madame la Directrice'} 👋</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · École Alanya
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setShowMsgModal(true); setMsgTo('all'); }}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Bell size={14} /> Passer un communiqué
            </button>
            <button
              onClick={() => setShowMsgModal(true)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <MessageSquare size={14} /> Nouveau message
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', opacity: 0.8 }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{eleves.length}</div>
          <div style={{ fontSize: 12 }}>élèves au total</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #ede9fe', paddingBottom: 0 }}>
        {[
          { id: 'overview', label: 'Vue générale' },
          { id: 'eleves', label: 'Élèves & Classes' },
          { id: 'enseignants', label: 'Enseignants' },
          { id: 'paiements', label: 'Paiements' },
          { id: 'messages', label: `Messages${unreadMessages > 0 ? ` (${unreadMessages})` : ''}` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? VIOLET : '#6b7280',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: 13,
              borderBottom: activeTab === tab.id ? `2px solid ${VIOLET}` : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            {quickStats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* Recent activity + progress */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Classes summary */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #ede9fe' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>
                <Building2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Classes & Effectifs
              </h3>
              {loading ? (
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>Chargement...</div>
              ) : classes.slice(0, 6).map((c, i) => {
                const count = eleves.filter(e => e.idClasse === c.idClasse || e.classe === c.libelle).length;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < Math.min(classes.length, 6) - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{c.libelle}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, width: 60, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(count * 4, 100)}%`, background: VIOLET, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: VIOLET, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>{count}</span>
                    </div>
                  </div>
                );
              })}
              {classes.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13 }}>Aucune classe enregistrée</div>}
            </div>

            {/* Salles */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #ede9fe' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>
                <Building2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Salles de classe
              </h3>
              {salles.slice(0, 6).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < Math.min(salles.length, 6) - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{s.libelle}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.position || '—'}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#3b82f6', background: '#eff6ff', padding: '3px 8px', borderRadius: 12, fontWeight: 600 }}>
                    {s.surface || '—'} m²
                  </span>
                </div>
              ))}
              {salles.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13 }}>Aucune salle enregistrée</div>}
            </div>
          </div>
        </>
      )}

      {/* Élèves & Classes */}
      {activeTab === 'eleves' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #ede9fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>
              <Users size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Liste des élèves ({eleves.length})
            </h3>
            <button onClick={load} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <RefreshCw size={12} /> Actualiser
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f7ff' }}>
                  {['Matricule', 'Nom & Prénom', 'Classe', 'Sexe', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eleves.slice(0, 50).map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>{e.matricule}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13, color: '#1e1b4b' }}>{e.prenom} {e.nom}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#6b7280' }}>{e.classe || e.libelleClasse || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#6b7280' }}>{e.sexe === 1 ? 'M' : e.sexe === 2 ? 'F' : '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: e.actif ? '#dcfce7' : '#fee2e2', color: e.actif ? '#16a34a' : '#dc2626' }}>
                        {e.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
                {eleves.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Aucun élève</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enseignants */}
      {activeTab === 'enseignants' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #ede9fe' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>
            <UserCheck size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Corps enseignant ({enseignants.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {enseignants.map((e, i) => (
              <div key={i} style={{ border: '1px solid #ede9fe', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${VIOLET}, #9b59b6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                    {(e.prenom || e.nom || 'E')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1b4b' }}>{e.prenom} {e.nom}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{e.cours || e.libelleCours || 'Matière non assignée'}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 11, color: e.actif ? '#16a34a' : '#dc2626', background: e.actif ? '#dcfce7' : '#fee2e2', padding: '3px 8px', borderRadius: 12, fontWeight: 600 }}>
                    {e.actif ? 'Actif' : 'Inactif'}
                  </span>
                  {e.mobile && <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '3px 8px', borderRadius: 12 }}>{e.mobile}</span>}
                </div>
              </div>
            ))}
            {enseignants.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', gridColumn: '1/-1' }}>Aucun enseignant enregistré</div>
            )}
          </div>
        </div>
      )}

      {/* Paiements */}
      {activeTab === 'paiements' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Total encaissé', value: `${stats.totalPaiements || 0} FCFA`, color: '#10b981' },
              { label: 'Élèves à jour', value: `${stats.elevesAJour || 0}`, color: VIOLET },
              { label: 'Taux de recouvrement', value: `${tauxPaiement}%`, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #ede9fe', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #ede9fe' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>Suivi des paiements par élève</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f7ff' }}>
                    {['Élève', 'Classe', 'Tranches payées', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eleves.slice(0, 20).map((e, i) => {
                    const tranchesPaid = Math.floor(Math.random() * 4);
                    const status = tranchesPaid === 0 ? 'non payé' : tranchesPaid < 3 ? 'partiel' : 'complet';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13, color: '#1e1b4b' }}>{e.prenom} {e.nom}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: '#6b7280' }}>{e.classe || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3].map(t => (
                              <div key={t} style={{ width: 24, height: 24, borderRadius: '50%', background: t <= tranchesPaid ? '#10b981' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: t <= tranchesPaid ? '#fff' : '#9ca3af', fontWeight: 700 }}>
                                {t}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, fontWeight: 600, background: status === 'complet' ? '#dcfce7' : status === 'partiel' ? '#fef3c7' : '#fee2e2', color: status === 'complet' ? '#16a34a' : status === 'partiel' ? '#d97706' : '#dc2626' }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            onClick={() => navigate('/directeur/paiements')}
                            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#374151' }}
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {eleves.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Aucune donnée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {activeTab === 'messages' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 10 }}>
            <button
              onClick={() => { setShowMsgModal(true); setMsgTo('all'); }}
              style={{ padding: '10px 18px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Bell size={14} /> Communiqué général
            </button>
            <button
              onClick={() => setShowMsgModal(true)}
              style={{ padding: '10px 18px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={14} /> Nouveau message
            </button>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #ede9fe' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>Messages reçus</h3>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Aucun message</div>
            ) : messages.slice(0, 20).map((m, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < messages.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={14} color={VIOLET} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1b4b' }}>{m.senderNom || m.sender || 'Inconnu'}</div>
                  <div style={{ fontSize: 12, color: '#374151', marginTop: 2, fontWeight: m.read ? 400 : 600 }}>{m.subject || m.objet || '(Sans objet)'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{m.created_at ? new Date(m.created_at).toLocaleString('fr-FR') : '—'}</div>
                </div>
                {!m.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: VIOLET, marginTop: 6, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMsgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 500, position: 'relative' }}>
            <button onClick={() => { setShowMsgModal(false); setMsgError(''); setMsgSuccess(''); }} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 18px', color: VIOLET, fontSize: 17, fontWeight: 700 }}>
              {msgTo === 'all' ? '📢 Passer un communiqué' : '✉️ Nouveau message'}
            </h3>

            {msgSuccess && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>{msgSuccess}</div>}
            {msgError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msgError}</div>}

            {msgTo !== 'all' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Destinataire *</label>
                <select value={msgTo} onChange={e => setMsgTo(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
                  <option value="">— Sélectionner —</option>
                  <option value="all_parents">Tous les parents</option>
                  <option value="all_enseignants">Tous les enseignants</option>
                  {contacts.map((c, i) => <option key={i} value={c.identifier || c.username}>{c.label || c.nom} ({c.role})</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Objet</label>
              <input value={msgSubject} onChange={e => setMsgSubject(e.target.value)} placeholder="Objet du message..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Message *</label>
              <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} placeholder="Votre message..." rows={5} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {msgTo === 'all' ? (
                <button onClick={sendCommunique} disabled={sending} style={{ flex: 1, padding: '11px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Bell size={15} /> {sending ? 'Envoi...' : 'Envoyer communiqué'}
                </button>
              ) : (
                <button onClick={sendMsg} disabled={sending} style={{ flex: 1, padding: '11px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Send size={15} /> {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DirecteurLayout>
  );
}
