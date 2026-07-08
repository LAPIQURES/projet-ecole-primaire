import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, MessageSquare, Calendar, Award, Clock, ChevronRight, Bell } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';
import { getCurrentEnseignantAPI, getMessagesAPI, getEvaluationsAPI } from '../services/api';

export default function DashboardEnseignant() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date();
  const heure = now.getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const userId = String(user.id || '');
  const userRole = 'enseignant';
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ courses: 0, students: 0, evaluations: 0, messages: 0 });
  const [agenda, setAgenda] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  const todayLabel = useMemo(() => now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), [now]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherRes, messagesRes, evalRes] = await Promise.allSettled([
        getCurrentEnseignantAPI(),
        getMessagesAPI(),
        getEvaluationsAPI(),
      ]);

      const teacher = teacherRes.status === 'fulfilled' && teacherRes.value?.data ? teacherRes.value.data : null;
      try {
        const classesRes = await (await import('../services/api')).getClassesAPI();
        setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      } catch (e) { setClasses([]); }
      const messages = messagesRes.status === 'fulfilled' && Array.isArray(messagesRes.value.data) ? messagesRes.value.data : [];
      const evals = evalRes.status === 'fulfilled' && Array.isArray(evalRes.value.data) ? evalRes.value.data : [];

      const teacherMessages = messages.filter((m) => {
        const senderMatch = m.senderRole === userRole && String(m.senderId || '') === userId;
        const receiverMatch = m.receiverRole === userRole && String(m.receiverId || '') === userId;
        return senderMatch || receiverMatch;
      });

      setMetrics({
        courses: teacher?.cours?.length ?? 0,
        students: teacher?.stats?.nbEleves ?? 0,
        evaluations: evals.length,
        messages: teacherMessages.length,
      });
      setAgenda((teacher?.calendrier || []).slice(0, 3).map((item, idx) => ({
        time: item.heure || item.startTime || ['08:00', '10:00', '14:00'][idx] || '—',
        title: item.libelleCours || item.cours || item.subject || item.libelle || `Cours ${idx + 1}`,
        room: item.libelleSalle || item.salle || 'Salle',
        color: ['#10b981', '#3b82f6', '#8b5cf6'][idx % 3],
      })));
      setAlerts([
        evals.length ? 'Évaluations enregistrées et à publier' : 'Aucune évaluation programmée',
        teacherMessages.length ? 'Messages à traiter' : 'Boîte de réception vide',
        teacher?.stats?.nbEleves ? 'Élèves assignés détectés' : 'Aucun élève chargé',
      ]);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    const fallbackTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1800);
    loadData();
    return () => { mounted = false; clearTimeout(fallbackTimer); };
  }, [loadData]);

  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;
      // join teacher room
      if (userId) socket.emit('join:group', `prof-${userId}`);

      const handler = () => { loadData().catch(() => {}); };
      socket.on('emploi:created', handler);
      socket.on('emploi:updated', handler);
      socket.on('emploi:deleted', handler);
      socket.on('evaluation:created', handler);
      socket.on('rapport:created', handler);

      return () => {
        try {
          socket.off('emploi:created', handler);
          socket.off('emploi:updated', handler);
          socket.off('emploi:deleted', handler);
          socket.off('evaluation:created', handler);
          socket.off('rapport:created', handler);
        } catch (e) {}
      };
    } catch (e) {}
  }, [userId, loadData]);

  const stats = [
    { label: 'Mes cours', value: String(metrics.courses), icon: BookOpen, color: '#10b981', hint: 'Planifiés cette semaine' },
    { label: 'Mes élèves', value: String(metrics.students), icon: Users, color: '#3b82f6', hint: 'Groupes suivis' },
    { label: 'Évaluations', value: String(metrics.evaluations), icon: FileText, color: '#8b5cf6', hint: 'À publier' },
    { label: 'Messages', value: String(metrics.messages), icon: MessageSquare, color: '#f59e0b', hint: 'Non lus ou récents' },
  ];

  const quickActions = [
    { label: 'Saisir les notes', icon: Award, color: '#10b981', path: '/enseignant/eleves' },
    { label: 'Cahier d’appel', icon: FileText, color: '#3b82f6', path: '/enseignant/cahier-appel' },
    { label: 'Mes cours', icon: BookOpen, color: '#8b5cf6', path: '/enseignant/cours' },
    { label: 'Emploi du temps', icon: Calendar, color: '#f59e0b', path: '/enseignant/emploi-du-temps' },
  ];

  const agendaData = agenda.length > 0 ? agenda : [
    { time: '—', title: 'Aucun cours chargé', room: 'Vérifier la connexion API', color: '#10b981' },
  ];

  return (
    <TeacherLayout title="Tableau de bord" subtitle={todayLabel}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ marginBottom: '24px', animation: 'fadeUp 0.35s ease both' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#064e3b', marginBottom: '4px' }}>{salutation}, {user.prenom} {user.nom} 👋</h2>
        <p style={{ fontSize: '14px', color: '#059669' }}>Voici votre espace pédagogique du jour.</p>
        {loading && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: 6 }}>Chargement des données API…</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #d1fae5', animation: `fadeUp 0.35s ease ${i * 0.08}s both` }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={20} color={s.color} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#064e3b' }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 2 }}>{s.hint}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '18px' }}>
        <div style={{ display: 'grid', gap: '18px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #d1fae5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#064e3b', margin: 0 }}>Actions rapides</h3>
              <Bell size={16} color="#10b981" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {quickActions.map((a) => (
                <a key={a.label} onClick={() => navigate(a.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: `${a.color}10`, textDecoration: 'none', cursor: 'pointer' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a.icon size={16} color={a.color} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#064e3b' }}>{a.label}</div>
                  <ChevronRight size={14} color="#6ee7b7" style={{ marginLeft: 'auto' }} />
                </a>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #d1fae5' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#064e3b', margin: '0 0 16px' }}>Cours du jour</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {agendaData.map((item) => (
                <div key={item.time} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ width: 58, textAlign: 'center', fontWeight: 800, color: item.color, fontSize: 13 }}>{item.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.room}</div>
                  </div>
                  <Clock size={16} color={item.color} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '18px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #d1fae5' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#064e3b', margin: '0 0 12px' }}>Mes classes</h3>
            {classes.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Aucune classe trouvée</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {classes.filter(c => String(c.idEnseignant || c.idProf || c.enseignantId) === String(user.id) || String(c.enseignant) === `${user.prenom} ${user.nom}`).slice(0,6).map((c) => (
                  <div key={c.idClasse || c.libelle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #eef2f7' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{c.libelle || `Classe ${c.idClasse}`}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{Array.isArray(c.salles) ? c.salles.join(', ') : (c.salle || '—')}</div>
                    </div>
                    <button onClick={() => navigate(`/classes`)} style={{ padding: '8px 10px', borderRadius: 10, background: '#eff6ff', color: '#0062ff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Voir</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '16px', padding: '22px', boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Espace enseignant</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Tout ce qu’il faut au même endroit</div>
            <div style={{ fontSize: 13, opacity: 0.92, lineHeight: 1.5 }}>Consultez vos cours, gérez vos évaluations et suivez vos élèves sans perdre la navigation.</div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #d1fae5' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#064e3b', margin: '0 0 16px' }}>Rappels</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {alerts.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 13, color: '#0f172a' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}