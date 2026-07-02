import React, { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, CreditCard, MessageSquare, FileText, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { getMessagesAPI, getPaiementsAPI, getRapportsElevesAPI } from '../services/api';
import Messages from './Messages';
import Paiements from './Paiements';

const getClassesAPI = async () => {
  try {
    const api = await import('../services/api');
    return await api.getClassesAPI();
  } catch (e) { return { data: [] }; }
};

export default function DashboardParent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date();
  const heure = now.getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ average: '—', absences: 0, paiements: 0, messages: 0, paiementsEnAttente: 0 });
  const [alerts, setAlerts] = useState([]);
  const [classes, setClasses] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState('overview');

  const child = {
    prenom: user.elevePrenom || '—',
    nom: user.eleveNom || '',
    classe: user.eleveClasse || 'Non définie',
    matricule: user.matricule || '—',
  };

  const childMatricule = String(user.matricule || '').trim();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [messagesRes, paiementsRes, rapportsRes] = await Promise.allSettled([
        getMessagesAPI(),
        getPaiementsAPI(),
        getRapportsElevesAPI(),
      ]);

      const messages = messagesRes.status === 'fulfilled' && Array.isArray(messagesRes.value.data) ? messagesRes.value.data : [];
      const paiements = paiementsRes.status === 'fulfilled' && Array.isArray(paiementsRes.value.data) ? paiementsRes.value.data : [];
      const rapports = rapportsRes.status === 'fulfilled' && Array.isArray(rapportsRes.value.data) ? rapportsRes.value.data : [];

      const childPaiements = childMatricule ? paiements.filter((p) => String(p.matricule) === childMatricule) : paiements;
      const childReports = childMatricule ? rapports.filter((r) => String(r.matricule) === childMatricule) : rapports;
      const avgPoints = childReports.length ? (childReports.reduce((sum, r) => sum + (Number(r.points) || 0), 0) / childReports.length) : null;

      const parentMessages = messages.filter((m) => {
        const senderMatch = m.senderRole === 'parent' && String(m.senderId || '') === String(user.id || '');
        const receiverMatch = m.receiverRole === 'parent' && String(m.receiverId || '') === String(user.id || '');
        return senderMatch || receiverMatch;
      });

      setMetrics({
        average: avgPoints !== null ? `${avgPoints.toFixed(1)}/20` : '—',
        absences: 0,
        paiements: childPaiements.length,
        messages: parentMessages.length,
        paiementsEnAttente: childPaiements.filter((p) => Number(p.montant) > 0).length,
      });
      setAlerts([
        childReports.length ? `${childReports.length} rapport(s) consulté(s)` : 'Aucun rapport scolaire trouvé',
        childPaiements.length ? `${childPaiements.length} paiement(s) lié(s) à l’enfant` : 'Aucun paiement lié à l’enfant',
        parentMessages.length ? 'Messages récents disponibles' : 'Aucun message récent',
      ]);
      try {
        const classesRes = await getClassesAPI();
        setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      } catch { setClasses([]); }
    } catch (e) {
      // ignore, handled by fallbacks
    } finally {
      setLoading(false);
    }
  }, [childMatricule, user.id]);

  useEffect(() => {
    let mounted = true;
    const fallbackTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1800);
    loadData();
    const seg = (location.pathname || '').replace(/\/+$/, '').split('/')[2] || '';
    setView(seg === '' ? 'overview' : seg);
    return () => { mounted = false; clearTimeout(fallbackTimer); };
  }, [loadData]);

  useEffect(() => {
    const seg = (location.pathname || '').replace(/\/+$/, '').split('/')[2] || '';
    setView(seg === '' ? 'overview' : seg);
  }, [location.pathname]);

  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;
      // join student room
      if (childMatricule) socket.emit('join:group', `student-${childMatricule}`);

      const handler = () => { loadData().catch(() => {}); };
      socket.on('evaluation:created', handler);
      socket.on('rapport:created', handler);
      socket.on('paiement:created', handler);
      socket.on('emploi:created', handler);
      socket.on('emploi:updated', handler);
      socket.on('emploi:deleted', handler);

      return () => {
        try {
          socket.off('evaluation:created', handler);
          socket.off('rapport:created', handler);
          socket.off('paiement:created', handler);
          socket.off('emploi:created', handler);
          socket.off('emploi:updated', handler);
          socket.off('emploi:deleted', handler);
        } catch (e) {}
      };
    } catch (e) {}
  }, [childMatricule, loadData]);

  const stats = [
    { label: 'Moyenne générale', value: metrics.average, icon: BookOpen, color: '#8b5cf6', note: 'Ce trimestre' },
    { label: 'Absences', value: String(metrics.absences), icon: AlertCircle, color: '#ef4444', note: 'Ce mois' },
    { label: 'Paiements', value: String(metrics.paiements), icon: CreditCard, color: '#10b981', note: 'En attente' },
    { label: 'Messages', value: String(metrics.messages), icon: MessageSquare, color: '#f59e0b', note: 'Non lus' },
  ];

  const quickLinks = [
    { label: 'Voir les notes', icon: FileText, color: '#8b5cf6', path: '/parent/bulletins' },
    { label: 'Emploi du temps', icon: Calendar, color: '#3b82f6', path: '/parent/emploi-du-temps' },
    { label: 'Paiements', icon: CreditCard, color: '#10b981', path: '/parent/paiements' },
    { label: 'Messages', icon: MessageSquare, color: '#f59e0b', path: '/parent/messages' },
  ];

  const reminders = alerts.length ? alerts : [
    'Vérifier les notes du trimestre',
    'Consulter le prochain conseil de classe',
    'Suivre les paiements en attente',
  ];

  return (
    <Layout title="Tableau de bord" subtitle={now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
      {view === 'messages' && (
        <div style={{ paddingTop: 8 }}>
          <Messages />
        </div>
      )}
      {view === 'paiements' && (
        <div style={{ paddingTop: 8 }}>
          <Paiements />
        </div>
      )}
      {view === 'enfant' && (
        <div style={{ paddingTop: 8 }}>
          <div style={{ background: 'white', borderRadius: '18px', boxShadow: '0 12px 48px rgba(15,23,42,0.08)', padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>Page « Mon enfant »</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Cette section est en cours de préparation. Les informations détaillées sur l’enfant seront affichées ici prochainement.</div>
          </div>
        </div>
      )}
      {view === 'bulletins' && (
        <div style={{ paddingTop: 8 }}>
          <div style={{ background: 'white', borderRadius: '18px', boxShadow: '0 12px 48px rgba(15,23,42,0.08)', padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>Page « Notes & Bulletins »</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Les bulletins scolaires seront bientôt disponibles ici, avec le suivi des notes de l’enfant.</div>
          </div>
        </div>
      )}
      {view !== 'overview' && view !== 'messages' && view !== 'paiements' && view !== 'enfant' && view !== 'bulletins' && (
        <div style={{ paddingTop: 8 }}>
          <div style={{ background: 'white', borderRadius: '18px', boxShadow: '0 12px 48px rgba(15,23,42,0.08)', padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', marginBottom: '12px' }}>Section à venir</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Cette page est encore en développement. Revenez bientôt pour plus de fonctionnalités.</div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ marginBottom: '24px', animation: 'fadeUp 0.35s ease both' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e1b4b', marginBottom: '4px' }}>{salutation}, {user.prenom} {user.nom} 👋</h2>
        <p style={{ fontSize: '14px', color: '#7c3aed' }}>Suivez la scolarité de votre enfant en temps réel.</p>
        {loading && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: 6 }}>Chargement des données API…</p>}
      </div>

      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white', animation: 'fadeUp 0.35s ease 0.1s both', boxShadow: '0 8px 32px rgba(124,58,237,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
            {child.prenom[0]}{child.nom[0]}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800' }}>{child.prenom} {child.nom}</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Classe : {child.classe}</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>Matricule : {child.matricule}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ede9fe', animation: `fadeUp 0.35s ease ${0.15 + i * 0.06}s both` }}>
              <div style={{ width: 40, height: 40, background: `${s.color}14`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div style={{ fontSize: 24, fontWeight: '800', color: '#1e1b4b' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#7c3aed', fontWeight: '600' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#a78bfa' }}>{s.note}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        <div style={{ background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ede9fe' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b', marginBottom: '14px' }}>Accès rapide</h3>
          {quickLinks.map((a) => (
            <Link key={a.label} to={a.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', marginBottom: '8px', background: `${a.color}10`, textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: `${a.color}20`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <a.icon size={15} color={a.color} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e1b4b' }}>{a.label}</span>
              <ChevronRight size={14} color="#c4b5fd" style={{ marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ede9fe' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b', marginBottom: '14px' }}>Rappels</h3>
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {reminders.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }} />
                <span style={{ fontSize: 13, color: '#0f172a' }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Clock size={16} color="#7c3aed" />
            <span style={{ fontSize: 13, color: '#1e1b4b' }}>Dernière connexion aujourd’hui</span>
            <CheckCircle size={16} color="#10b981" style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      </div>
    </Layout>
  );
}