import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, RefreshCw, X, AlertCircle, UserPlus, UserCheck } from 'lucide-react';
import Layout from '../components/Layout';
import {
  getInscriptionsAPI,
  createInscriptionAPI,
  updateInscriptionAPI,
  deleteInscriptionAPI,
  getElevesAPI,
  getSallesAPI,
  getAnneesAPI,
  getClassesAPI,
} from '../services/api';

const BLUE = '#0062ff';
const ORANGE = '#ffa000';
const GREEN = '#16a34a';

const inp = {
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  color: '#0f172a',
  background: '#fff',
};

const EMPTY_FORM = { matricule: '', idSalle: '', idAcademi: '', commentaire: '' };

const badge = (active, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: active ? `${color}14` : '#f1f5f9',
  color: active ? color : '#64748b',
  border: `1px solid ${active ? `${color}33` : '#e2e8f0'}`,
});

const toSexeLabel = (v) => {
  if (v === 1 || v === '1' || String(v).toLowerCase().startsWith('m')) return 'M';
  if (v === 2 || v === '2' || String(v).toLowerCase().startsWith('f')) return 'F';
  return '—';
};

const toDateFr = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('fr-FR');
};

export default function Inscriptions() {
  const [inscriptions, setInscriptions] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [salles, setSalles] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [section, setSection] = useState('');
  const [niveau, setNiveau] = useState('');
  const [admisClasse, setAdmisClasse] = useState('');
  const [venantClasse, setVenantClasse] = useState('');

  const [selectedAnneeId, setSelectedAnneeId] = useState('');
  const [trimestre, setTrimestre] = useState('Trimestre 1');
  const [sequence, setSequence] = useState('Séquence 1');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [iRes, eRes, sRes, aRes, cRes] = await Promise.all([
        getInscriptionsAPI(),
        getElevesAPI(),
        getSallesAPI(),
        getAnneesAPI(),
        getClassesAPI().catch(() => ({ data: [] })),
      ]);

      const iRows = Array.isArray(iRes.data) ? iRes.data : [];
      const eRows = Array.isArray(eRes.data) ? eRes.data : [];
      const sRows = Array.isArray(sRes.data) ? sRes.data : [];
      const aRows = Array.isArray(aRes.data) ? aRes.data : [];
      const cRows = Array.isArray(cRes.data) ? cRes.data : [];

      setInscriptions(iRows);
      setEleves(eRows);
      setSalles(sRows);
      setAnnees(aRows);
      setClasses(cRows);

      // Pré-sélection année 2022-2023 si disponible
      if (!selectedAnneeId) {
        const target = aRows.find((a) => String(a.libelle || '').includes('2022') && String(a.libelle || '').includes('2023'));
        const first = aRows[0];
        setSelectedAnneeId(String(target?.idAnnee || first?.idAnnee || ''));
      }
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEdit = (ins) => {
    setFormData({
      matricule: ins.matricule || ins.matriculeEleve || '',
      idSalle: ins.idSalle || '',
      idAcademi: ins.idAcademi || ins.idAnnee || '',
      commentaire: ins.commentaire || '',
    });
    setEditingId(ins.idFrequente);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.matricule || !formData.idSalle || !formData.idAcademi) {
      setError('Tous les champs marqués * sont obligatoires');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateInscriptionAPI(editingId, formData);
        setSuccess('Inscription modifiée !');
      } else {
        await createInscriptionAPI(formData);
        setSuccess('Inscription ajoutée !');
      }
      setShowForm(false);
      await loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette inscription ?')) return;
    try {
      await deleteInscriptionAPI(id);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    }
  };

  const eleveByMatricule = useMemo(() => {
    const m = new Map();
    (Array.isArray(eleves) ? eleves : []).forEach((e) => {
      if (e?.matricule != null) m.set(String(e.matricule), e);
    });
    return m;
  }, [eleves]);

  const classeByLibelle = useMemo(() => {
    const m = new Map();
    (Array.isArray(classes) ? classes : []).forEach((c) => {
      if (c?.libelle) m.set(String(c.libelle), c);
    });
    return m;
  }, [classes]);

  const optionsSection = useMemo(() => {
    const set = new Set();
    (Array.isArray(classes) ? classes : []).forEach((c) => {
      if (c?.cycle) set.add(String(c.cycle));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [classes]);

  const optionsClasse = useMemo(() => {
    const set = new Set();
    (Array.isArray(classes) ? classes : []).forEach((c) => {
      if (c?.libelle) set.add(String(c.libelle));
    });
    (Array.isArray(salles) ? salles : []).forEach((s) => {
      if (s?.classe) set.add(String(s.classe));
    });
    (Array.isArray(eleves) ? eleves : []).forEach((e) => {
      if (e?.classe) set.add(String(e.classe));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [classes, salles, eleves]);

  const anneeLabel = useMemo(() => {
    const a = annees.find((x) => String(x.idAnnee) === String(selectedAnneeId));
    return a?.libelle || '2022-2023';
  }, [annees, selectedAnneeId]);

  const rows = useMemo(() => {
    const base = Array.isArray(inscriptions) ? inscriptions : [];

    return base
      .map((i) => {
        const matricule = String(i?.matricule ?? i?.matriculeEleve ?? '');
        const e = eleveByMatricule.get(matricule);
        const classe = i?.classe || e?.classe || '—';
        const classeInfo = classeByLibelle.get(String(classe));

        const r = {
          raw: i,
          id: i?.idFrequente,
          matricule: matricule || '—',
          nom: i?.eleveNom || e?.nom || '—',
          prenom: i?.elevePrenom || e?.prenom || '—',
          dob: e?.dateNaissance || i?.dateNaissance || null,
          lieu: e?.lieuNaissance || i?.lieuNaissance || '—',
          sexe: e?.sexe ?? i?.sexe,
          classe,
          section: i?.section || i?.cycle || classeInfo?.cycle || '',
          redoublant: i?.redoublant ?? e?.redoublant ?? i?.estRedoublant ?? 0,
          inscrit: i?.inscrit ?? 1,
        };

        return r;
      })
      .filter((r) => {
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          `${r.matricule} ${r.nom} ${r.prenom} ${r.classe}`.toLowerCase().includes(q) ||
          `${r.section}`.toLowerCase().includes(q);

        const matchSection = !section || String(r.section) === String(section);
        const matchNiveau = !niveau || String(r.classe).includes(String(niveau));

        const admisVal = r.raw?.admisEnClasseDe || r.raw?.admisClasse || r.raw?.classeAdmise || r.classe;
        const venantVal = r.raw?.venantDeClasseDe || r.raw?.venantClasse || r.raw?.classeOrigine || r.raw?.classePrecedente || '';

        const matchAdmis = !admisClasse || String(admisVal) === String(admisClasse);
        const matchVenant = !venantClasse || String(venantVal) === String(venantClasse);

        return matchSearch && matchSection && matchNiveau && matchAdmis && matchVenant;
      });
  }, [inscriptions, eleveByMatricule, classeByLibelle, search, section, niveau, admisClasse, venantClasse]);

  const totalInscrits = inscriptions.length;
  const totalEleves = eleves.length || inscriptions.length;

  return (
    <Layout title="Inscriptions" subtitle="Gestion des inscriptions">
      <style>{`
        input:focus,select:focus,textarea:focus{border-color:${BLUE}!important;box-shadow:0 0 0 3px rgba(0,98,255,0.12)}
        .row-hover:hover{background:#f8fbff!important}
        .btn-act:hover{filter:brightness(0.98)}
      `}</style>

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, color: '#15803d', fontSize: 13, fontWeight: 700 }}>
          {success}
        </div>
      )}

      {error && !showForm && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Header (Image 3) */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '16px 18px',
        border: '1px solid #edf2f7',
        boxShadow: '0 8px 22px rgba(15,23,42,0.06)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>Année scolaire {anneeLabel}</div>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>•</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <select value={selectedAnneeId} onChange={(e) => setSelectedAnneeId(e.target.value)} style={{ ...inp, width: 190, padding: '8px 10px', borderRadius: 12 }}>
                  {annees.length === 0 ? <option value="">2022-2023</option> : annees.map((a) => (
                    <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
                  ))}
                </select>
                <select value={trimestre} onChange={(e) => setTrimestre(e.target.value)} style={{ ...inp, width: 170, padding: '8px 10px', borderRadius: 12 }}>
                  {['Trimestre 1', 'Trimestre 2', 'Trimestre 3'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={sequence} onChange={(e) => setSequence(e.target.value)} style={{ ...inp, width: 170, padding: '8px 10px', borderRadius: 12 }}>
                  {['Séquence 1', 'Séquence 2', 'Séquence 3', 'Séquence 4', 'Séquence 5', 'Séquence 6'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#64748b' }}>
              Filtrez vos inscriptions par section, niveau et origine.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/eleves')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 12,
                background: GREEN,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 800,
                boxShadow: '0 10px 22px rgba(22,163,74,0.18)',
              }}
            >
              <UserPlus size={16} /> Nouvel Élève
            </button>

            <button
              onClick={openAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 12,
                background: BLUE,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 800,
                boxShadow: '0 10px 22px rgba(0,98,255,0.18)',
              }}
            >
              <Plus size={16} /> Ajouter
            </button>

            <button
              onClick={loadAll}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                background: '#fff',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                color: '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
              }}
              className="btn-act"
              title="Actualiser"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '14px 18px',
        border: '1px solid #edf2f7',
        boxShadow: '0 8px 22px rgba(15,23,42,0.06)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher: matricule, nom, classe..." style={{ ...inp, paddingLeft: 38 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6 }}>Section</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} style={inp}>
              <option value="">Toutes</option>
              {optionsSection.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6 }}>Niveau</label>
            <select value={niveau} onChange={(e) => setNiveau(e.target.value)} style={inp}>
              <option value="">Tous</option>
              {optionsClasse.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6 }}>Admis en classe de</label>
            <select value={admisClasse} onChange={(e) => setAdmisClasse(e.target.value)} style={inp}>
              <option value="">Toutes</option>
              {optionsClasse.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 6 }}>Venant de classe de</label>
            <select value={venantClasse} onChange={(e) => setVenantClasse(e.target.value)} style={inp}>
              <option value="">Toutes</option>
              {optionsClasse.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 22px rgba(15,23,42,0.06)', border: '1px solid #edf2f7', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Chargement...</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>
            <UserCheck size={34} style={{ opacity: 0.25, marginBottom: 8 }} />
            <div>Aucune inscription trouvée</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Matricule', 'Nom', 'Prénom', 'DOB', 'Lieu', 'Sexe', 'Classe', 'Redoublant', 'Inscrit', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id ?? idx} className="row-hover" style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfdff' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{r.matricule}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{r.nom}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{r.prenom}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>{toDateFr(r.dob)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{r.lieu || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{toSexeLabel(r.sexe)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569', fontWeight: 800 }}>{r.classe}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={badge(!!Number(r.redoublant), ORANGE)}>{Number(r.redoublant) ? 'Oui' : 'Non'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={badge(!!Number(r.inscrit ?? 1), BLUE)}>{Number(r.inscrit ?? 1) ? 'Oui' : 'Non'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => openEdit(r.raw)}
                        style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer', color: BLUE, marginRight: 8 }}
                        className="btn-act"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.raw?.idFrequente)}
                        style={{ padding: 8, background: '#fff7ed', border: 'none', borderRadius: 10, cursor: 'pointer', color: ORANGE }}
                        className="btn-act"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #f1f5f9',
          background: '#fafbff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Effectif des inscrits: <span style={{ fontWeight: 900, color: BLUE }}>{rows.length}</span> / <span style={{ fontWeight: 900, color: '#0f172a' }}>{totalEleves}</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Total inscriptions: {totalInscrits}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 560, boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>{editingId ? 'Modifier' : 'Ajouter'} une inscription</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Renseignez l’élève, la classe et l’année scolaire</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Élève *</label>
                <select value={formData.matricule} onChange={(e) => setFormData({ ...formData, matricule: e.target.value })} style={inp}>
                  <option value="">-- Sélectionner un élève --</option>
                  {eleves.map((e) => (
                    <option key={e.matricule} value={e.matricule}>
                      {e.prenom} {e.nom} (Matr. {e.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Classe / Salle *</label>
                <select value={formData.idSalle} onChange={(e) => setFormData({ ...formData, idSalle: e.target.value })} style={inp}>
                  <option value="">-- Sélectionner une salle --</option>
                  {salles.map((s) => (
                    <option key={s.idSalle} value={s.idSalle}>
                      {s.libelle}{s.classe ? ` (${s.classe})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Année scolaire *</label>
                <select value={formData.idAcademi} onChange={(e) => setFormData({ ...formData, idAcademi: e.target.value })} style={inp}>
                  <option value="">-- Sélectionner une année --</option>
                  {annees.map((a) => (
                    <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Commentaire</label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  placeholder="Notes..."
                  style={{ ...inp, minHeight: 90, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: saving ? '#93c5fd' : BLUE,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 950,
                  boxShadow: '0 10px 22px rgba(0,98,255,0.18)',
                }}
              >
                {saving ? 'Enregistrement…' : editingId ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: '12px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
