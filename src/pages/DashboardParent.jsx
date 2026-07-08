import React, { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, CreditCard, MessageSquare, FileText, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import ParentLayout from '../components/ParentLayout';
import { getMessagesAPI, getPaiementsAPI, getRapportsElevesAPI, getEleveByIdAPI, getParentByIdAPI, getBulletinsByEleveAPI, getBulletinDetailAPI } from '../services/api';
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
  const [children, setChildren] = useState([]);
  const [selectedMatricule, setSelectedMatricule] = useState(String(user.matricule || '').trim());
  const [childInfo, setChildInfo] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [bulletinDetail, setBulletinDetail] = useState(null);
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
      if (!selectedMatricule && parentChildren.length) {
        setSelectedMatricule(String(parentChildren[0].matricule));
      }

      const activeMatricule = selectedMatricule || childMatricule || (parentChildren[0] && String(parentChildren[0].matricule)) || '';
      const childPaiements = activeMatricule ? paiements.filter((p) => String(p.matricule) === activeMatricule) : paiements;
      const childReports = activeMatricule ? rapports.filter((r) => String(r.matricule) === activeMatricule) : rapports;
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
  }, [childMatricule, parentId, selectedMatricule, user.id]);

  useEffect(() => {
    if (!selectedMatricule) return;
    let mounted = true;
    const loadChildInfo = async () => {
      try {
        const [childRes, bulletinsRes] = await Promise.allSettled([
          getEleveByIdAPI(selectedMatricule),
          getBulletinsByEleveAPI(selectedMatricule),
        ]);

        if (mounted) {
          setChildInfo(childRes.status === 'fulfilled' && childRes.value?.data ? childRes.value.data : null);
          setBulletins(bulletinsRes.status === 'fulfilled' && Array.isArray(bulletinsRes.value.data) ? bulletinsRes.value.data : []);
        }
      } catch {
        if (mounted) {
          setChildInfo(null);
          setBulletins([]);
        }
      }
    };
    loadChildInfo();
    return () => { mounted = false; };
  }, [selectedMatricule]);

  useEffect(() => {
    let mounted = true;
    const fallbackTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1800);
    loadData();
    setView(getViewFromPath(location.pathname));
    return () => { mounted = false; clearTimeout(fallbackTimer); };
  }, [getViewFromPath, loadData, location.pathname]);

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
    <ParentLayout title="Tableau de bord" subtitle={now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
      {view === 'messages' && (
        <div style={{ paddingTop: 8 }}>
          <Messages noLayout />
        </div>
      )}
      {view === 'paiements' && (
        <div style={{ paddingTop: 8 }}>
          <Paiements noLayout />
        </div>
      )}
      {view === 'enfant' && (
        <div style={{ paddingTop: 8, display: 'grid', gap: '18px' }}>
          <div style={{ background: 'white', borderRadius: '18px', boxShadow: '0 12px 48px rgba(15,23,42,0.08)', padding: '28px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', marginBottom: '10px' }}>Mes enfants</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '18px' }}>Sélectionnez un enfant pour afficher ses informations et son évolution.</div>
            {children.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {children.map((c) => {
                  const active = String(c.matricule) === String(selectedMatricule);
                  return (
                    <button
                      key={c.matricule}
                      onClick={() => setSelectedMatricule(String(c.matricule))}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 16px',
                        border: active ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: active ? '#f5f3ff' : '#ffffff',
                        color: '#1f2937',
                        cursor: 'pointer',
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {c.prenom} {c.nom}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#475569' }}>Aucun enfant lié trouvé pour ce compte parent.</div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '18px', boxShadow: '0 12px 48px rgba(15,23,42,0.08)', padding: '28px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b', marginBottom: '14px' }}>Informations de l’enfant sélectionné</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: 13, color: '#334155' }}>
                <span style={{ fontWeight: 700 }}>Nom complet</span>
                <span>{childDisplay.prenom} {childDisplay.nom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: 13, color: '#334155' }}>
                <span style={{ fontWeight: 700 }}>Classe</span>
                <span>{childDisplay.classe}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: 13, color: '#334155' }}>
                <span style={{ fontWeight: 700 }}>Cycle</span>
                <span>{childDisplay.cycle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: 13, color: '#334155' }}>
                <span style={{ fontWeight: 700 }}>Salle</span>
                <span>{childDisplay.salle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: 13, color: '#334155' }}>
                <span style={{ fontWeight: 700 }}>Date de naissance</span>
                <span>{childDisplay.dateNaissance}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {view === 'bulletins' && (
        <div style={{ paddingTop: 8, display: 'grid', gap: '18px' }}>
          <div style={{ background: 'white', borderRadius: '18px', boxShadow: '0 12px 48px rgba(15,23,42,0.08)', padding: '28px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', marginBottom: '10px' }}>Notes & Bulletins</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '18px' }}>Liste des bulletins de l’enfant sélectionné.</div>

            {children.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                {children.map((c) => {
                  const active = String(c.matricule) === String(selectedMatricule);
                  return (
                    <button
                      key={c.matricule}
                      onClick={() => setSelectedMatricule(String(c.matricule))}
                      style={{
                        borderRadius: '12px',
                        padding: '10px 14px',
                        border: active ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: active ? '#f5f3ff' : '#ffffff',
                        color: '#1f2937',
                        cursor: 'pointer',
                        fontWeight: active ? 700 : 600,
                      }}
                    >
                      {c.prenom} {c.nom}
                    </button>
                  );
                })}
              </div>
            )}

            {!selectedMatricule && (
              <div style={{ fontSize: '13px', color: '#475569' }}>Sélectionnez un enfant pour afficher ses bulletins.</div>
            )}

            {selectedMatricule && (
              <div style={{ display: 'grid', gap: '14px' }}>
                {bulletins.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#475569' }}>Aucun bulletin disponible pour cet enfant.</div>
                ) : bulletins.map((bulletin) => (
                  <div key={bulletin.idBulletin} style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b' }}>{bulletin.annee} · {bulletin.trimestre}</div>
                        <div style={{ fontSize: '13px', color: '#475569' }}>{bulletin.nombreCours || 0} matière(s) · Moyenne : {bulletin.moyenneGenerale ?? '—'}</div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await getBulletinDetailAPI(bulletin.idBulletin);
                            setBulletinDetail(data);
                          } catch (err) {
                            console.error(err);
                            setBulletinDetail(null);
                          }
                        }}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#7c3aed', color: 'white', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Voir le bulletin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {bulletinDetail && (
            <div style={{ background: 'white', borderRadius: '18px', boxShadow: '0 12px 48px rgba(15,23,42,0.08)', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b' }}>Détails du bulletin</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{bulletinDetail.elevePrenom} {bulletinDetail.eleveNom} · {bulletinDetail.annee} · {bulletinDetail.trimestre}</div>
                </div>
                <button
                  onClick={() => setBulletinDetail(null)}
                  style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', color: '#1f2937', cursor: 'pointer' }}
                >
                  Fermer
                </button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px' }}>Moyenne Générale</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b' }}>{bulletinDetail.moyenneGenerale ?? '—'}</div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px' }}>Statut</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b' }}>{bulletinDetail.statut || '—'}</div>
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px' }}>Appréciation</div>
                  <div style={{ fontSize: '14px', color: '#1e1b4b' }}>{bulletinDetail.appreciation || 'Aucune appréciation'}</div>
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {Array.isArray(bulletinDetail.details) && bulletinDetail.details.map((detail) => (
                    <div key={detail.idDetail} style={{ padding: '14px', borderRadius: '14px', background: '#f8fafc' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b' }}>{detail.libelleCours}</div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>Note : {detail.note ?? '—'} · Coef : {detail.coefficient ?? '—'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{detail.appreciation || detail.appreciation_long || ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
            {childDisplay.prenom[0]}{childDisplay.nom[0]}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800' }}>{childDisplay.prenom} {childDisplay.nom}</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Classe : {childDisplay.classe}</div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>Matricule : {childDisplay.matricule}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px', animation: 'fadeUp 0.35s ease 0.2s both' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ede9fe' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b', marginBottom: '14px' }}>Informations sur l’enfant</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Nom complet</span>
              <span>{childDisplay.prenom} {childDisplay.nom}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Classe</span>
              <span>{childDisplay.classe}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Cycle</span>
              <span>{childDisplay.cycle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Salle</span>
              <span>{childDisplay.salle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>Date de naissance</span>
              <span>{childDisplay.dateNaissance}</span>
            </div>
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
    </ParentLayout>
  );
}