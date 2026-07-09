import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Edit2, Power, Search, UserCheck, X, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { createEnseignantAPI, updateEnseignantAPI, getEnseignantByIdAPI } from '../services/api';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = 'http://localhost:5000/api';
const inp = {
  padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit', color: '#1e293b', background: '#fff',
};

const EMPTY_FORM = { nom: '', prenom: '', mobile: '', phone: '', username: '', password: '', dateNaissance: '', lieuNaissance: '', idCours: '' };

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState([]);
  const [cours, setCours] = useState([]);
  const [showFiche, setShowFiche] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const h = { headers: { Authorization: `Bearer ${token}` } };
      const [eRes, cRes] = await Promise.all([
        axios.get(`${API_URL}/enseignants`, h),
        axios.get(`${API_URL}/cours`, h).catch(() => ({ data: [] })),
      ]);
      setEnseignants(Array.isArray(eRes.data) ? eRes.data : []);
      setCours(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (err) {
      setError('Erreur de chargement');
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null); setError(''); setSuccess('');
    setShowForm(true);
  };

  const openEdit = (en) => {
    setFormData({
      nom: en.nom || '', prenom: en.prenom || '',
      mobile: en.mobile || '', phone: en.phone || '',
      username: en.username || '', password: '',
      dateNaissance: en.dateNaissance ? en.dateNaissance.split('T')[0] : '',
      lieuNaissance: en.lieuNaissance || '',
      idCours: en.idCours || '',
    });
    setEditingId(en.idEnseignant);
    setError(''); setSuccess('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError('Nom et prénom obligatoires');
      return;
    }
    setSaving(true); setError('');
    try {
      if (editingId) {
        await updateEnseignantAPI(editingId, formData);
        setSuccess('Enseignant mis à jour !');
      } else {
        await createEnseignantAPI(formData);
        setSuccess('Enseignant ajouté !');
      }
      setShowForm(false);
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSaving(false); }
  };

  const handleToggle = async (en) => {
    if (!window.confirm(`${en.Actif ? 'Désactiver' : 'Réactiver'} ${en.prenom} ${en.nom} ?`)) return;
    try {
      await updateEnseignantAPI(en.idEnseignant, { ...en, Actif: en.Actif ? 0 : 1 });
      loadAll();
    } catch (err) { setError(err.message); }
  };

  const filtered = enseignants.filter(e =>
    `${e.prenom || ''} ${e.nom || ''} ${e.username || ''} ${e.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openDetails = (en) => {
    setDetailError('');
    setSelected({ ...en, _loadingDetail: true });
    setShowFiche(true);
    getEnseignantByIdAPI(en.idEnseignant)
      .then((res) => setSelected(res.data || en))
      .catch((err) => {
        setDetailError(err.response?.data?.error || err.message || 'Impossible de charger les détails');
        setSelected(en);
      });
  };

  return (
    <Layout title="Gestion des Enseignants" subtitle={`${enseignants.filter(e=>e.Actif).length} actif(s) · ${enseignants.length} au total`}>
      <style>{`input:focus,select:focus{border-color:#0062ff!important;box-shadow:0 0 0 3px rgba(0,98,255,0.18)}`}</style>

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, color: '#15803d', fontSize: 13, fontWeight: 600 }}>
          ✅ {success}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher un enseignant…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 36 }} />
          </div>
          <button onClick={loadAll} style={{ padding: '9px 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: '#0062ff', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 6px 18px rgba(0,98,255,0.25)', whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Ajouter un enseignant
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{editingId ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Informations de l'enseignant</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Prénom *', key: 'prenom', type: 'text', ph: 'Prénom' },
                { label: 'Nom *', key: 'nom', type: 'text', ph: 'Nom de famille' },
                { label: 'Mobile', key: 'mobile', type: 'tel', ph: '+237 6XX XXX XXX' },
                { label: 'Téléphone', key: 'phone', type: 'tel', ph: 'Fixe' },
                { label: 'Nom d\'utilisateur', key: 'username', type: 'text', ph: 'Login connexion' },
                { label: editingId ? 'Nouveau mot de passe' : 'Mot de passe', key: 'password', type: 'password', ph: editingId ? 'Laisser vide = inchangé' : 'Mot de passe' },
                { label: 'Date de naissance', key: 'dateNaissance', type: 'date' },
                { label: 'Lieu de naissance', key: 'lieuNaissance', type: 'text', ph: 'Ville' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph || ''} value={formData[f.key]}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Cours assigné</label>
                <select value={formData.idCours} onChange={e => setFormData({ ...formData, idCours: e.target.value })} style={inp}>
                  <option value="">-- Aucun cours --</option>
                  {cours.map(c => (
                    <option key={c.idCours} value={c.idCours}>{c.libelle}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: '11px', background: saving ? 'rgba(0,98,255,0.55)' : '#0062ff', color: '#fff', border: 'none', borderRadius: 9, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 800, boxShadow: saving ? 'none' : '0 10px 26px rgba(0,98,255,0.20)' }}>
                {saving ? 'Enregistrement…' : (editingId ? 'Mettre à jour l\'enseignant' : 'Enregistrer l\'enseignant')}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '11px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #dbeafe', borderTopColor: '#0062ff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8' }}>Chargement…</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eff6ff', borderBottom: '1px solid #e2e8f0' }}>
                    {['ID', 'Enseignant', 'Contact', 'Username', 'Cours assigné', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                      <UserCheck size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
                      <div style={{ fontSize: 14 }}>Aucun enseignant trouvé</div>
                    </td></tr>
                  ) : filtered.map((en, i) => (
                    <tr
                      key={en.idEnseignant || i}
                      onClick={() => openDetails(en)}
                      style={{ borderBottom: '1px solid #f8fafc', opacity: en.Actif ? 1 : 0.55, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fbff'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>#{en.idEnseignant}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AvatarCircle name={`${en.prenom || ''} ${en.nom || ''}`} photoURL={en.photoURL} size={34} />
                          <div>
                            <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 800 }}>{en.prenom || '—'} {en.nom || ''}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{en.email || en.username || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                        <div>{en.mobile || '—'}</div>
                        {en.phone && <div style={{ color: '#94a3b8' }}>{en.phone}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{en.username || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                        {en.cours ? <span style={{ background: 'rgba(0,98,255,0.10)', color: '#0062ff', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 800 }}>{en.cours}</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: en.Actif ? '#dcfce7' : '#fee2e2', color: en.Actif ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                          {en.Actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(en); }}
                            style={{ padding: '6px 10px', background: 'rgba(255,160,0,0.12)', border: '1px solid rgba(255,160,0,0.25)', borderRadius: 7, cursor: 'pointer', color: '#b45309', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                          >
                            <Edit2 size={13} /> Modifier
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggle(en); }}
                            style={{ padding: '6px 10px', background: en.Actif ? '#fef2f2' : '#f0fdf4', border: 'none', borderRadius: 7, cursor: 'pointer', color: en.Actif ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                          >
                            <Power size={13} /> {en.Actif ? 'Désact.' : 'Réact.'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8', background: '#fafbff', display: 'flex', justifyContent: 'space-between' }}>
              <span>{filtered.length} enseignant(s) affiché(s)</span>
              <span>Total : {enseignants.length}</span>
            </div>
          </>
        )}
      </div>

      {showFiche && selected && (
        <EnseignantDetailsModal enseignant={selected} onClose={() => setShowFiche(false)} detailError={detailError} />
      )}
    </Layout>
  );
}

function AvatarCircle({ name, photoURL, size = 34 }) {
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?';
  const gradient = 'linear-gradient(135deg, #0062ff, #ffa000)';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: gradient,
        border: '2px solid rgba(0,98,255,0.18)',
        boxShadow: '0 10px 24px rgba(0,98,255,0.10)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Fallback always present behind the image */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: Math.max(12, Math.floor(size * 0.35)) }}>
        {initial}
      </div>
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : null}
    </div>
  );
}

function CalendarMonth({ year, month, activeWeekdays = [] }) {
  const monthsFR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const week = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  // JS: 0=Dim .. 6=Sam → convert to Monday-start index
  const startOffset = (first.getDay() + 6) % 7;
  const days = last.getDate();
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{monthsFR[month]} {year}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Mois courant</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
        {week.map((w) => (
          <div key={w} style={{ fontSize: 11, fontWeight: 800, color: '#475569', textAlign: 'center' }}>{w}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {cells.map((d, idx) => {
          const isToday = isThisMonth && d === today.getDate();
          const weekday = (new Date(year, month, d).getDay() + 6) % 7;
          const active = isToday || activeWeekdays.includes(weekday);
          return (
            <div
              key={idx}
              style={{
                height: 34,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: d ? (active ? '#fff' : '#0f172a') : '#cbd5e1',
                background: active ? 'linear-gradient(135deg, #0062ff, #ffa000)' : '#f8fafc',
                border: active ? '1px solid rgba(255,255,255,0.35)' : '1px solid #eef2f7',
                boxShadow: active ? '0 10px 22px rgba(0,98,255,0.18)' : 'none',
              }}
            >
              {d || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EnseignantDetailsModal({ enseignant, onClose, detailError }) {
  if (!enseignant) {
    return null;
  }

  if (detailError) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.60)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
        <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 30px 90px rgba(0,0,0,0.35)', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#dc2626', marginBottom: 12 }}>❌ Erreur</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{detailError}</div>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#0062ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const theme = useMemo(() => ({ blue: '#0062ff', orange: '#ffa000' }), []);
  const fullName = `${enseignant?.prenom || ''} ${enseignant?.nom || ''}`.trim() || '—';
  const normalizeArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);
  const classes = normalizeArray(enseignant?.classes);
  const salles = normalizeArray(enseignant?.salles);
  const cours = normalizeArray(enseignant?.cours);
  const calendrier = normalizeArray(enseignant?.calendrier);
  const courseLabel = (() => {
    if (enseignant?.cours == null) return '—';
    if (typeof enseignant.cours === 'string') return enseignant.cours;
    if (typeof enseignant.cours === 'object') return enseignant.cours.libelle || enseignant.cours.classe || enseignant.cours.salle || enseignant.cours.subject || '—';
    return String(enseignant.cours);
  })();
  const stats = enseignant?.stats || {};
  const [view, setView] = React.useState('classes');
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const activeWeekdays = Array.from(new Set(calendrier.map((item) => Number(item.dayOfWeek)).filter(Boolean).map((d) => d - 1)));
  const timetable = days.map((jour, index) => {
    const slots = calendrier.filter((item) => Number(item.dayOfWeek) === index + 1);
    return {
      jour,
      matin: slots[0] ? `${slots[0].startTime?.slice(0, 5) || '—'} - ${slots[0].endTime?.slice(0, 5) || '—'}` : '—',
      apresmidi: slots[1] ? `${slots[1].startTime?.slice(0, 5) || '—'} - ${slots[1].endTime?.slice(0, 5) || '—'}` : '—',
      salle: slots[0]?.salle || slots[1]?.salle || '—',
      classe: slots[0]?.classe || slots[1]?.classe || '—',
      subject: slots[0]?.subject || slots[1]?.subject || '—',
    };
  });

  const selectedClassList = view === 'classes' ? classes : salles;

  if (enseignant._loadingDetail && !enseignant.classes && !enseignant.salles && !enseignant.cours) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.60)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
        <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 30px 90px rgba(0,0,0,0.35)', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Chargement des détails...</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Veuillez patienter pendant que les informations de l'enseignant se chargent.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.60)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{`
        .ens-modal{width:100%; max-width:980px; max-height:calc(100vh - 40px); background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 30px 90px rgba(0,0,0,0.30); overflow-y:auto;}
        .ens-head{padding:14px 16px; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(0,98,255,0.12), rgba(255,160,0,0.12)); border-bottom:1px solid #eef2f7}
        .ens-grid{display:grid; grid-template-columns: minmax(260px, 320px) minmax(0, 1fr); gap:14px; padding:16px}
        .ens-fullwidth{grid-column: 1 / -1;}
        @media (max-width: 900px){ .ens-grid{grid-template-columns: 1fr; } .ens-fullwidth{grid-column: auto;} }
      `}</style>

      <div className="ens-modal" role="dialog" aria-modal="true">
        <div className="ens-head">
          <div>
            <div style={{ fontSize: 16, fontWeight: 1000, color: '#0f172a' }}>Détails enseignant</div>
            <div style={{ fontSize: 12, color: '#475569' }}>Bio · Affectations · Horaires · Salles</div>
          </div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }} title="Fermer"><X size={18} /></button>
        </div>

        <div className="ens-grid">
          <div style={{ border: '1px solid #eef2f7', borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <AvatarCircle name={fullName} photoURL={enseignant?.photoURL} size={86} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 1000, color: '#0f172a' }}>{fullName}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: theme.blue }}>{courseLabel}</div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {[
                { label: 'Email', value: enseignant?.email || enseignant?.username || '—' },
                { label: 'Téléphone', value: enseignant?.mobile || enseignant?.phone || '—' },
                { label: 'Identifiant', value: enseignant?.username || '—' },
                { label: 'Détails perso', value: `${enseignant?.dateNaissance?.split?.('T')?.[0] || '—'} · ${enseignant?.lieuNaissance || '—'}` },
              ].map((it) => (
                <div key={it.label} style={{ padding: '10px 12px', borderRadius: 14, background: '#f8fafc', border: '1px solid #eef2f7' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>{it.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 2, wordBreak: 'break-word' }}>{it.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(0,98,255,0.08)', border: '1px solid rgba(0,98,255,0.16)' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>Classes</div>
                <div style={{ fontSize: 22, fontWeight: 1000, color: '#0f172a' }}>{stats.nbClasses ?? classes.length}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(255,160,0,0.10)', border: '1px solid rgba(255,160,0,0.18)' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>Salles</div>
                <div style={{ fontSize: 22, fontWeight: 1000, color: '#0f172a' }}>{stats.nbSalles ?? salles.length}</div>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #eef2f7', borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180, padding: 12, borderRadius: 16, background: 'rgba(0,98,255,0.08)', border: '1px solid rgba(0,98,255,0.18)' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6 }}>Nb classes</div>
                <div style={{ fontSize: 24, fontWeight: 1100, color: '#0f172a', marginTop: 4 }}>{stats.nbClasses ?? classes.length}</div>
              </div>
              <div style={{ flex: 1, minWidth: 180, padding: 12, borderRadius: 16, background: 'rgba(255,160,0,0.10)', border: '1px solid rgba(255,160,0,0.22)' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6 }}>Nb élèves</div>
                <div style={{ fontSize: 24, fontWeight: 1100, color: '#0f172a', marginTop: 4 }}>{stats.nbEleves ?? 0}</div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setView('classes')} style={{ padding: 12, borderRadius: 16, border: '1px solid rgba(0,98,255,0.18)', background: view === 'classes' ? 'rgba(0,98,255,0.08)' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Nb classes</div>
                <div style={{ fontSize: 24, fontWeight: 1100, color: '#0f172a' }}>{stats.nbClasses ?? classes.length}</div>
              </button>
              <button onClick={() => setView('salles')} style={{ padding: 12, borderRadius: 16, border: '1px solid rgba(255,160,0,0.22)', background: view === 'salles' ? 'rgba(255,160,0,0.10)' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Nb salles</div>
                <div style={{ fontSize: 24, fontWeight: 1100, color: '#0f172a' }}>{stats.nbSalles ?? salles.length}</div>
              </button>
            </div>

            <div style={{ marginTop: 12, padding: 12, borderRadius: 16, border: '1px solid #eef2f7', background: '#fff' }}>
              <div style={{ fontSize: 13, fontWeight: 1000, color: '#0f172a', marginBottom: 8 }}>
                {view === 'classes' ? 'Classes liées' : 'Salles liées'}
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {(selectedClassList.length > 0 ? selectedClassList : []).map((item) => (
                  <button
                    key={view === 'classes' ? item.idClasse : item.idSalle}
                    onClick={() => setView(view === 'classes' ? 'salles' : 'classes')}
                    style={{
                      padding: '9px 10px',
                      borderRadius: 12,
                      border: '1px solid #eef2f7',
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>{item.libelle || '—'}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      {view === 'classes'
                        ? `${item.nbSalles || 0} salle(s) · ${item.nbEleves || 0} élève(s)`
                        : `${item.classe || '—'} · ${item.nbEleves || 0} élève(s)`}
                    </span>
                  </button>
                ))}
                {(selectedClassList.length === 0) && (
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucune donnée liée</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 16, border: '1px solid #eef2f7', background: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 1000, color: '#0f172a', marginBottom: 8 }}>Horaires et salles</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Jour', 'Matin', 'Après-midi', 'Salle'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 900, padding: '8px 6px', borderBottom: '1px solid #eef2f7' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map((r) => (
                        <tr key={r.jour}>
                          <td style={{ padding: '8px 6px', fontSize: 12, fontWeight: 900, color: theme.blue }}>{r.jour}</td>
                          <td style={{ padding: '8px 6px', fontSize: 12, color: '#0f172a', fontWeight: 700 }}>{r.matin}</td>
                          <td style={{ padding: '8px 6px', fontSize: 12, color: '#0f172a', fontWeight: 700 }}>{r.apresmidi}</td>
                          <td style={{ padding: '8px 6px', fontSize: 12, color: '#475569', fontWeight: 700 }}>{r.salle}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  {cours.slice(0, 4).map((c) => (
                    <div key={c.idCours} style={{ padding: '8px 10px', borderRadius: 12, background: '#f8fafc', border: '1px solid #eef2f7', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{c.libelle}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{c.classe || '—'} · {c.salle || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 16, border: '1px solid #eef2f7', background: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 1000, color: '#0f172a', marginBottom: 8 }}>Présence des créneaux</div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Créneaux actifs', value: Math.max(1, calendrier.length) },
                        { name: 'Classes liées', value: Math.max(1, classes.length) },
                        { name: 'Salles liées', value: Math.max(1, salles.length) },
                      ]} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                        {['#0062ff', '#ffa000', '#94a3b8'].map((color, idx) => (
                          <Cell key={idx} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="ens-fullwidth" style={{ border: '1px solid #eef2f7', borderRadius: 16, padding: 14, background: '#fff' }}>
            <div style={{ padding: 12, borderRadius: 16, background: 'linear-gradient(135deg, rgba(0,98,255,0.10), rgba(255,160,0,0.10))', border: '1px solid #eef2f7' }}>
              <CalendarMonth year={new Date().getFullYear()} month={new Date().getMonth()} activeWeekdays={activeWeekdays} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

