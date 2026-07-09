import React, { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, CreditCard, MessageSquare, FileText,
  ChevronRight, CheckCircle, AlertCircle, Clock, User,
  TrendingUp, Shield, Star, Bell,
} from 'lucide-react';
import ParentLayout from '../components/ParentLayout';
import API, {
  getMessagesAPI, getPaiementsAPI, getRapportsElevesAPI,
  getEleveByIdAPI, getParentByIdAPI, getBulletinsByEleveAPI,
  getBulletinDetailAPI, getEvaluationsAPI, getEmploiAPI,
} from '../services/api';
import Messages from './Messages';
import Paiements from './Paiements';

const getClassesAPI = async () => {
  try { const api = await import('../services/api'); return await api.getClassesAPI(); }
  catch (e) { return { data: [] }; }
};

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));
const fmtMoney = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(n || 0));

const DAY_LABELS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function DashboardParent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date();
  const heure = now.getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ average: '—', absences: 0, paiements: 0, messages: 0 });
  const [alerts, setAlerts] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedMatricule, setSelectedMatricule] = useState(String(user.matricule || '').trim());
  const [childInfo, setChildInfo] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [bulletinDetail, setBulletinDetail] = useState(null);
  const [notes, setNotes] = useState([]);
  const [disciplineLogs, setDisciplineLogs] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState('overview');

  const parentId = user.idParent || user.id;
  const childMatricule = String(user.matricule || '').trim();

  const child = {
    prenom: user.elevePrenom || '—',
    nom: user.eleveNom || '',
    classe: user.eleveClasse || 'Non définie',
    matricule: user.matricule || '—',
  };

  const childDisplay = {
    prenom: childInfo?.prenom || child.prenom,
    nom: childInfo?.nom || child.nom,
    classe: childInfo?.classe || child.classe,
    cycle: childInfo?.cycle || '—',
    salle: childInfo?.salle || '—',
    dateNaissance: childInfo?.dateNaissance ? new Date(childInfo.dateNaissance).toLocaleDateString('fr-FR') : '—',
    matricule: childInfo?.matricule || child.matricule,
  };

  const getViewFromPath = useCallback((pathname) => {
    const pathParts = (pathname || '').replace(/\/+$/, '').split('/').filter(Boolean);
    const seg = pathParts[1] || '';
    if (!seg || seg === 'dashboard') return 'overview';
    return seg;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [messagesRes, paiementsRes, rapportsRes, parentRes] = await Promise.allSettled([
        getMessagesAPI(),
        getPaiementsAPI(),
        getRapportsElevesAPI(),
        parentId ? getParentByIdAPI(parentId) : Promise.resolve({ data: null }),
      ]);

      const messages = messagesRes.status === 'fulfilled' && Array.isArray(messagesRes.value.data) ? messagesRes.value.data : [];
      const paiements = paiementsRes.status === 'fulfilled' && Array.isArray(paiementsRes.value.data) ? paiementsRes.value.data : [];
      const rapports = rapportsRes.status === 'fulfilled' && Array.isArray(rapportsRes.value.data) ? rapportsRes.value.data : [];
      const parentData = parentRes.status === 'fulfilled' && parentRes.value?.data ? parentRes.value.data : null;
      const parentChildren = Array.isArray(parentData?.children) ? parentData.children : [];

      setChildren(parentChildren);

      const currentSelection = String(selectedMatricule || '').trim();
      const hasSelection = !!parentChildren.find((c) => String(c.matricule) === currentSelection);
      if (!hasSelection && parentChildren.length) {
        setSelectedMatricule(String(parentChildren[0].matricule));
      }

      const activeMatricule = currentSelection || childMatricule || (parentChildren[0] && String(parentChildren[0].matricule)) || '';
      const childPaiements = activeMatricule ? paiements.filter((p) => String(p.matricule) === activeMatricule) : paiements;
      const childReports = activeMatricule ? rapports.filter((r) => String(r.matricule) === activeMatricule) : rapports;

      const parentMessages = messages.filter((m) => {
        const senderMatch = m.senderRole === 'parent' && String(m.senderId || '') === String(user.id || '');
        const receiverMatch = m.receiverRole === 'parent' && String(m.receiverId || '') === String(user.id || '');
        return senderMatch || receiverMatch;
      });

      setMetrics({
        average: '—',
        absences: 0,
        paiements: childPaiements.length,
        messages: parentMessages.length,
      });

      const alertsList = [];
      if (childReports.length) alertsList.push(`${childReports.length} rapport(s) scolaire(s) disponible(s)`);
      if (childPaiements.length) alertsList.push(`${childPaiements.length} paiement(s) lié(s) à l'enfant`);
      if (parentMessages.length) alertsList.push('Nouveaux messages disponibles');
      setAlerts(alertsList);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [childMatricule, parentId, selectedMatricule, user.id]);

  useEffect(() => {
    if (!selectedMatricule) return;
    let mounted = true;
    const loadChildInfo = async () => {
      try {
        const [childRes, bulletinsRes, evaluationsRes, disciplineRes, emploiRes] = await Promise.allSettled([
          getEleveByIdAPI(selectedMatricule),
          getBulletinsByEleveAPI(selectedMatricule),
          getEvaluationsAPI(),
          API.get('/discipline/absences/list', { params: { matricule: selectedMatricule } }),
          getEmploiAPI(),
        ]);

        if (mounted) {
          const childPayload = childRes.status === 'fulfilled' && childRes.value?.data ? childRes.value.data : null;
          const bulletinsPayload = bulletinsRes.status === 'fulfilled' && Array.isArray(bulletinsRes.value.data) ? bulletinsRes.value.data : [];
          const evaluationsPayload = evaluationsRes.status === 'fulfilled' && Array.isArray(evaluationsRes.value?.data) ? evaluationsRes.value.data : [];
          const disciplinePayload = disciplineRes.status === 'fulfilled' && Array.isArray(disciplineRes.value?.data) ? disciplineRes.value.data : [];
          const emploiPayload = emploiRes.status === 'fulfilled' && Array.isArray(emploiRes.value?.data) ? emploiRes.value.data : [];

          setChildInfo(childPayload);
          setBulletins(bulletinsPayload);

          const myNotes = evaluationsPayload.filter((item) => String(item.matricule) === String(selectedMatricule));
          setNotes(myNotes);
          setDisciplineLogs(disciplinePayload);
          setScheduleItems(emploiPayload);

          const avgNote = myNotes.reduce((sum, item) => sum + Number(item.note || 0), 0) / Math.max(1, myNotes.length);
          const absences = disciplinePayload.filter((item) => /absent/i.test(String(item.status || item.commentaire || ''))).length;

          setMetrics((prev) => ({
            ...prev,
            average: myNotes.length > 0 && Number.isFinite(avgNote) ? `${avgNote.toFixed(1)}/20` : '—',
            absences,
          }));
        }
      } catch {
        if (mounted) { setChildInfo(null); setBulletins([]); setNotes([]); setDisciplineLogs([]); setScheduleItems([]); }
      }
    };
    loadChildInfo();
    return () => { mounted = false; };
  }, [selectedMatricule]);

  useEffect(() => {
    let mounted = true;
    const fallback = setTimeout(() => { if (mounted) setLoading(false); }, 2500);
    loadData();
    setView(getViewFromPath(location.pathname));
    return () => { mounted = false; clearTimeout(fallback); };
  }, [getViewFromPath, loadData, location.pathname]);

  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;
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
          socket.off('evaluation:created', handler); socket.off('rapport:created', handler);
          socket.off('paiement:created', handler); socket.off('emploi:created', handler);
          socket.off('emploi:updated', handler); socket.off('emploi:deleted', handler);
        } catch (e) {}
      };
    } catch (e) {}
  }, [childMatricule, loadData]);

  const activeClassSchedule = (scheduleItems || [])
    .filter((item) => {
      const targetClassId = childInfo?.idClasse || '';
      return !targetClassId || String(item.idClasse || '') === String(targetClassId);
    })
    .sort((a, b) => {
      const dayA = Number(a.dayOfWeek ?? a.jour ?? 0);
      const dayB = Number(b.dayOfWeek ?? b.jour ?? 0);
      const timeA = Number(String(a.startTime || '00:00').split(':')[0]) * 60 + Number(String(a.startTime || '00:00').split(':')[1] || 0);
      const timeB = Number(String(b.startTime || '00:00').split(':')[0]) * 60 + Number(String(b.startTime || '00:00').split(':')[1] || 0);
      return dayA - dayB || timeA - timeB;
    });

  const kpis = [
    { label: 'Moyenne générale', value: metrics.average, icon: Star, color: '#8b5cf6', bg: '#f5f3ff', sub: 'Ce trimestre' },
    { label: 'Absences', value: String(metrics.absences), icon: AlertCircle, color: '#ef4444', bg: '#fef2f2', sub: 'Ce mois' },
    { label: 'Paiements', value: String(metrics.paiements), icon: CreditCard, color: '#10b981', bg: '#f0fdf4', sub: 'Enregistrés' },
    { label: 'Messages', value: String(metrics.messages), icon: MessageSquare, color: '#f59e0b', bg: '#fffbeb', sub: 'Échangés' },
  ];

  const quickLinks = [
    { label: 'Bulletins & Notes', icon: FileText, color: '#8b5cf6', path: '/parent/bulletins', desc: 'Consulter les bulletins' },
    { label: 'Emploi du temps', icon: Calendar, color: '#3b82f6', path: '/parent/emploi-du-temps', desc: 'Planning de la semaine' },
    { label: 'Paiements', icon: CreditCard, color: '#10b981', path: '/parent/paiements', desc: 'Historique des paiements' },
    { label: 'Messages', icon: MessageSquare, color: '#f59e0b', path: '/parent/messages', desc: 'Contacter l\'école' },
  ];

  // ─── Vues secondaires ───
  if (view === 'messages') return <ParentLayout title="Messages" subtitle="Communication avec l'école"><Messages noLayout /></ParentLayout>;
  if (view === 'paiements') return <ParentLayout title="Paiements" subtitle="Historique financier"><Paiements noLayout /></ParentLayout>;

  return (
    <ParentLayout title="Tableau de bord" subtitle={now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .ql-link:hover { background: #ede9fe !important; transform: translateX(2px); }
        .child-btn:hover { border-color: #7c3aed !important; background: #f5f3ff !important; }
      `}</style>

      {/* ─── Header salutation ─── */}
      <div style={{ marginBottom: 24, animation: 'fadeUp 0.35s ease both' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b', marginBottom: 4, margin: 0 }}>
          {salutation}, {user.prenom || user.nom || 'Parent'} 👋
        </h2>
        <p style={{ fontSize: 14, color: '#7c3aed', margin: '4px 0 0', fontWeight: 500 }}>
          Suivez la scolarité de votre enfant en temps réel.
        </p>
        {loading && <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0', animation: 'pulse 1.5s ease infinite' }}>Chargement des données…</p>}
      </div>

      {/* ─── Bannière enfant actif ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
        borderRadius: 20, padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        boxShadow: '0 10px 40px rgba(124,58,237,0.28)', animation: 'fadeUp 0.4s ease 0.05s both',
      }}>
        <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0, backdropFilter: 'blur(10px)' }}>
          {childDisplay.prenom[0]}{childDisplay.nom?.[0] || ''}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{childDisplay.prenom} {childDisplay.nom}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
            Classe : {childDisplay.classe} · Matricule : {childDisplay.matricule}
          </div>
          {childDisplay.salle !== '—' && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Salle : {childDisplay.salle} · Cycle : {childDisplay.cycle}</div>}
        </div>
        {children.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {children.map((c) => {
              const active = String(c.matricule) === String(selectedMatricule);
              return (
                <button key={c.matricule} className="child-btn" onClick={() => setSelectedMatricule(String(c.matricule))}
                  style={{
                    padding: '8px 14px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    border: active ? '2px solid white' : '1px solid rgba(255,255,255,0.4)',
                    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    color: 'white', backdropFilter: 'blur(10px)', transition: 'all 0.2s',
                  }}>
                  {c.prenom} {c.nom}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Sélecteur enfant (si plusieurs) ─── */}
      {children.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: '18px 22px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #ede9fe', animation: 'fadeUp 0.35s ease 0.1s both' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', marginBottom: 10 }}>
            <User size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#7c3aed' }} />
            {children.length} enfant(s) rattaché(s) à votre compte
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {children.map((c) => {
              const active = String(c.matricule) === String(selectedMatricule);
              return (
                <button key={c.matricule} className="child-btn" onClick={() => setSelectedMatricule(String(c.matricule))}
                  style={{
                    padding: '9px 14px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
                    border: active ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                    background: active ? '#f5f3ff' : 'white', color: active ? '#7c3aed' : '#374151',
                    transition: 'all 0.18s', textAlign: 'left',
                  }}>
                  <div>{c.prenom} {c.nom}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.classe || 'Classe non définie'}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Vue Bulletins ─── */}
      {view === 'bulletins' && (
        <div style={{ display: 'grid', gap: 18, animation: 'fadeUp 0.35s ease both' }}>
          <div style={{ background: 'white', borderRadius: 18, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #ede9fe' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 6 }}>Notes & Bulletins</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>Bulletins trimestriels de {childDisplay.prenom}</div>
            {selectedMatricule ? (
              bulletins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>Aucun bulletin disponible pour cet enfant.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {bulletins.map((b) => (
                    <div key={b.idBulletin} style={{ padding: '16px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>{b.annee} · {b.trimestre}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{b.nombreCours || 0} matière(s) · Moyenne : <strong>{b.moyenneGenerale ?? '—'}</strong></div>
                      </div>
                      <button
                        onClick={async () => { try { const { data } = await getBulletinDetailAPI(b.idBulletin); setBulletinDetail(data); } catch { setBulletinDetail(null); } }}
                        style={{ padding: '9px 16px', borderRadius: 12, border: 'none', background: '#7c3aed', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        Voir le bulletin
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : <div style={{ fontSize: 13, color: '#94a3b8' }}>Sélectionnez un enfant.</div>}
          </div>
          {bulletinDetail && (
            <div style={{ background: 'white', borderRadius: 18, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #ede9fe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b' }}>Détails du bulletin</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{bulletinDetail.elevePrenom} {bulletinDetail.eleveNom} · {bulletinDetail.annee} · {bulletinDetail.trimestre}</div>
                </div>
                <button onClick={() => setBulletinDetail(null)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, color: '#374151' }}>Fermer</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ padding: 14, borderRadius: 12, background: '#f5f3ff' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>MOYENNE GÉNÉRALE</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b' }}>{bulletinDetail.moyenneGenerale ?? '—'}</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>STATUT</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b' }}>{bulletinDetail.statut || '—'}</div>
                </div>
              </div>
              {bulletinDetail.appreciation && (
                <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', marginBottom: 14, fontSize: 13, color: '#1e1b4b' }}>
                  <strong style={{ color: '#7c3aed' }}>Appréciation : </strong>{bulletinDetail.appreciation}
                </div>
              )}
              <div style={{ display: 'grid', gap: 8 }}>
                {Array.isArray(bulletinDetail.details) && bulletinDetail.details.map((d) => (
                  <div key={d.idDetail} style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>{d.libelleCours}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Note : <strong>{d.note ?? '—'}</strong> · Coef. {d.coefficient ?? '—'}</div>
                    {d.appreciation && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{d.appreciation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Vue Enfant ─── */}
      {view === 'enfant' && (
        <div style={{ display: 'grid', gap: 18, animation: 'fadeUp 0.35s ease both' }}>
          <div style={{ background: 'white', borderRadius: 18, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #ede9fe' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1e1b4b', marginBottom: 16 }}>Informations de l'enfant</div>
            {[
              ['Nom complet', `${childDisplay.prenom} ${childDisplay.nom}`],
              ['Matricule', childDisplay.matricule],
              ['Classe', childDisplay.classe],
              ['Cycle', childDisplay.cycle],
              ['Salle', childDisplay.salle],
              ['Date de naissance', childDisplay.dateNaissance],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{label}</span>
                <span style={{ color: '#64748b' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Vue principale (overview) ─── */}
      {view === 'overview' && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22, animation: 'fadeUp 0.4s ease 0.12s both' }}>
            {kpis.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: `1px solid ${s.bg}` }}>
                  <div style={{ width: 40, height: 40, background: s.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={20} color={s.color} />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#1e1b4b' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#a78bfa' }}>{s.sub}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22, animation: 'fadeUp 0.4s ease 0.16s both' }}>
            {/* Notes récentes */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #ede9fe' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={16} color="#8b5cf6" />Notes récentes
              </div>
              {notes.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {notes.slice(0, 5).map((note, i) => (
                    <div key={note.idEval || i} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b' }}>{note.cours || 'Cours'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{note.appreciation || ''}</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: Number(note.note) >= 10 ? '#10b981' : '#ef4444', marginLeft: 12 }}>
                        {note.note ?? '—'}<span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>/20</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucune note enregistrée.</div>
              )}
            </div>

            {/* Discipline */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #ede9fe' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} color="#ef4444" />Discipline
              </div>
              {disciplineLogs.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {disciplineLogs.slice(0, 4).map((log, i) => {
                    const isAbsence = /absent/i.test(String(log.status || log.commentaire || ''));
                    return (
                      <div key={log.idFrequente || i} style={{ padding: '10px 12px', borderRadius: 10, background: isAbsence ? '#fef2f2' : '#f8fafc', border: `1px solid ${isAbsence ? '#fecaca' : '#e2e8f0'}` }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isAbsence ? '#dc2626' : '#1e1b4b' }}>{log.status || 'Présence'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{log.commentaire || 'Aucune remarque'}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>
                  <CheckCircle size={24} color="#10b981" style={{ display: 'block', margin: '0 auto 8px' }} />
                  Aucun incident enregistré
                </div>
              )}
            </div>
          </div>

          {/* Emploi du temps */}
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', marginBottom: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #ede9fe', animation: 'fadeUp 0.4s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} color="#3b82f6" />Emploi du temps
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{childDisplay.classe}</span>
            </div>
            {activeClassSchedule.length ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {activeClassSchedule.map((item, i) => {
                  const dayNum = item.dayOfWeek ?? item.jour ?? item.day ?? 0;
                  const dayLabel = DAY_LABELS[dayNum] || `Jour ${dayNum}`;
                  return (
                    <div key={item.id || item.idTemps || i} style={{ padding: '10px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#3b82f6', background: '#eff6ff', borderRadius: 8, padding: '4px 0', flexShrink: 0 }}>{dayLabel.substring(0, 3)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b' }}>{item.subject || item.matiere || 'Cours'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.startTime || '—'} – {item.endTime || '—'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucun créneau disponible pour cette classe.</div>
            )}
          </div>

          {/* Accès rapide & Alertes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, animation: 'fadeUp 0.4s ease 0.24s both' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #ede9fe' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 12 }}>Accès rapide</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {quickLinks.map((a) => (
                  <Link key={a.label} to={a.path} className="ql-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: `${a.color}10`, textDecoration: 'none', transition: 'all 0.18s' }}>
                    <div style={{ width: 34, height: 34, background: `${a.color}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <a.icon size={15} color={a.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b' }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.desc}</div>
                    </div>
                    <ChevronRight size={14} color="#c4b5fd" />
                  </Link>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #ede9fe' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bell size={15} color="#7c3aed" />Notifications & Rappels
              </div>
              <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                {(alerts.length ? alerts : ['Vérifier les notes du trimestre', 'Consulter le prochain conseil de classe', 'Suivre les paiements en attente']).map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#faf7ff', border: '1px solid #ede9fe' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: 4 }} />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>Connexion active — Données à jour</span>
                <Clock size={13} color="#94a3b8" style={{ marginLeft: 'auto' }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Vue Emploi du Temps (Grille) ─── */}
      {view === 'emploi-du-temps' && (
        <div style={{ animation: 'fadeUp 0.35s ease both' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(124,58,237,0.08)', border: '1px solid #ede9fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={20} color="#7c3aed" /> Grille de la semaine
                </h3>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                  Emploi du temps de {childDisplay.prenom} • {childDisplay.classe}
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 800, display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: '1px', background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                {/* En-tête des jours */}
                <div style={{ background: '#f8fafc', padding: 12 }}></div>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((jour) => (
                  <div key={jour} style={{ background: '#f8fafc', padding: '14px 8px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#1e1b4b' }}>
                    {jour}
                  </div>
                ))}

                {/* Grille horaire 8h - 17h */}
                {Array.from({ length: 9 }).map((_, i) => {
                  const hour = i + 8;
                  const timeLabel = `${hour}h00`;
                  return (
                    <React.Fragment key={hour}>
                      {/* Colonne heure */}
                      <div style={{ background: '#fcfcfc', padding: '16px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {timeLabel}
                      </div>
                      
                      {/* Cellules des jours */}
                      {[1, 2, 3, 4, 5].map((dayIdx) => {
                        const dayNameStr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][dayIdx - 1];
                        // Trouver le cours exact pour ce jour et cette heure
                        const cours = activeClassSchedule.find(item => {
                          const itemDay = String(item.dayOfWeek ?? item.jour ?? item.day ?? '').toLowerCase();
                          const isSameDay = itemDay === dayNameStr.toLowerCase() || String(itemDay) === String(dayIdx);
                          const itemHour = parseInt(String(item.startTime || item.heure || '').split(':')[0], 10);
                          return isSameDay && itemHour === hour;
                        });

                        return (
                          <div key={`${dayIdx}-${hour}`} style={{ background: 'white', padding: '10px', position: 'relative', minHeight: 70 }}>
                            {cours && (
                              <div style={{ 
                                position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, 
                                background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.05))',
                                borderLeft: '3px solid #7c3aed', borderRadius: 8, padding: '8px',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#4c1d95', lineHeight: 1.2 }}>
                                  {cours.subject || cours.matiere || cours.libelleCours || 'Cours'}
                                </div>
                                {(cours.salle || cours.libelleSalle) && (
                                  <div style={{ fontSize: 10, color: '#7c3aed', marginTop: 4, fontWeight: 600 }}>
                                    Salle : {cours.salle || cours.libelleSalle}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            
            {activeClassSchedule.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 14 }}>
                Aucun emploi du temps n'a été publié pour cette classe.
              </div>
            )}
          </div>
        </div>
      )}
    </ParentLayout>
  );
}