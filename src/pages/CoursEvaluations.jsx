import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  getClassesAPI,
  getEnseignantsAPI,
  getSallesAPI,
  getCoursAPI,
  createCoursAPI,
  updateCoursAPI,
  deleteCoursAPI,
  getEvaluationsProgrammesAPI,
  createEvaluationProgrammeAPI,
  updateEvaluationProgrammeAPI,
  deleteEvaluationProgrammeAPI,
} from '../services/api';
import { AlertCircle, BookOpen, ClipboardList, Edit2, Eye, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';

const BLUE = '#0062ff';
const ORANGE = '#ffa000';

const inp = {
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  color: '#0f172a',
  background: '#fff',
};

const EMPTY_COURS = { libelle: '', idClasse: '', idEnseignant: '', heures: '', idSalle: '' };
const EMPTY_EVAL = {
  libelle: '',
  type: 'Contrôle',
  scope: 'sequentielle',
  date: '',
  duree: '',
  coeff: '1',
  classe: '',
  cours_id: '',
  idSalle: '',
  enseignant_id: '',
  note_max: '20',
  description: '',
};

export default function CoursEvaluations() {
  const currentRole = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return String(user.role || '').toLowerCase() === 'superadmin' ? 'admin' : String(user.role || '').toLowerCase();
    } catch {
      return 'admin';
    }
  }, []);
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);

  const [selectedClasse, setSelectedClasse] = useState('');
  const [searchCours, setSearchCours] = useState('');

  const [cours, setCours] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [classEvaluations, setClassEvaluations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingCours, setLoadingCours] = useState(false);
  const [loadingEvals, setLoadingEvals] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // modal cours
  const [showCoursModal, setShowCoursModal] = useState(false);
  const [coursForm, setCoursForm] = useState(EMPTY_COURS);
  const [editingCoursId, setEditingCoursId] = useState(null);

  // modal evaluation
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalForm, setEvalForm] = useState(EMPTY_EVAL);
  const [editingEvalId, setEditingEvalId] = useState(null);
  const [evalViewOnly, setEvalViewOnly] = useState(false);
  const [selectedCoursForEvals, setSelectedCoursForEvals] = useState(null);

  useEffect(() => {
    loadRefs();
  }, []);

  useEffect(() => {
    if (!selectedClasse) {
      setCours([]);
      setEvaluations([]);
      setClassEvaluations([]);
      setSelectedCoursForEvals(null);
      return;
    }
    setEvaluations([]);
    setClassEvaluations([]);
    setSelectedCoursForEvals(null);
    loadCoursForClasse(selectedClasse);
    loadClassEvaluations(selectedClasse);
  }, [selectedClasse]);

  const loadRefs = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, eRes, sRes] = await Promise.all([getClassesAPI(), getEnseignantsAPI(), getSallesAPI()]);
      setClasses(Array.isArray(cRes.data) ? cRes.data : []);
      setEnseignants(Array.isArray(eRes.data) ? eRes.data : []);
      setSalles(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadCoursForClasse = async (idClasse) => {
    setLoadingCours(true);
    setError('');
    try {
      const res = await getCoursAPI({ idClasse });
      setCours(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement des cours');
      setCours([]);
    } finally {
      setLoadingCours(false);
    }
  };

  const loadClassEvaluations = async (classeId) => {
    setLoadingEvals(true);
    setError('');
    try {
      const res = await getEvaluationsProgrammesAPI({ classe: classeId });
      setClassEvaluations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement des évaluations');
      setClassEvaluations([]);
    } finally {
      setLoadingEvals(false);
    }
  };

  const loadEvaluationsForCours = async (coursId) => {
    setLoadingEvals(true);
    setError('');
    try {
      const res = await getEvaluationsProgrammesAPI({ cours_id: coursId, classe: selectedClasse, idSalle: selectedCoursForEvals?.idSalle });
      setEvaluations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement des évaluations');
      setEvaluations([]);
    } finally {
      setLoadingEvals(false);
    }
  };

  const classeLabel = (id) => classes.find((c) => String(c.idClasse) === String(id))?.libelle || '—';
  const enseignantLabel = (id) => {
    const en = enseignants.find((x) => String(x.idEnseignant) === String(id));
    if (!en) return '—';
    return `${en.prenom || ''} ${en.nom || ''}`.trim() || en.cours || '—';
  };
  const salleLabel = (id) => salles.find((s) => String(s.idSalle) === String(id))?.libelle || '—';

  const activeEvaluations = selectedCoursForEvals ? evaluations : classEvaluations;

  // --- Cours CRUD
  const openAddCours = () => {
    setCoursForm({ ...EMPTY_COURS, idClasse: selectedClasse || '' });
    setEditingCoursId(null);
    setError('');
    setShowCoursModal(true);
  };

  const openEditCours = (c) => {
    setCoursForm({
      libelle: c.libelle || '',
      idClasse: c.idClasse || selectedClasse || '',
      idEnseignant: c.idEnseignant || c.enseignant_id || '',
      heures: c.heures ?? '',
      idSalle: c.idSalle || c.salle_id || '',
    });
    setEditingCoursId(c.idCours);
    setError('');
    setShowCoursModal(true);
  };

  const submitCours = async (e) => {
    e?.preventDefault?.();

    if (!coursForm.libelle.trim()) {
      setError('Libellé requis');
      return;
    }
    if (!coursForm.idClasse) {
      setError('Classe requise');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        libelle: coursForm.libelle,
        idClasse: Number(coursForm.idClasse),
        idEnseignant: coursForm.idEnseignant ? Number(coursForm.idEnseignant) : null,
        heures: coursForm.heures === '' ? null : Number(coursForm.heures),
        idSalle: coursForm.idSalle ? Number(coursForm.idSalle) : null,
      };

      if (editingCoursId) await updateCoursAPI(editingCoursId, payload);
      else await createCoursAPI(payload);

      setShowCoursModal(false);
      setSuccess(editingCoursId ? 'Cours mis à jour !' : 'Cours créé !');
      setTimeout(() => setSuccess(''), 2500);
      await loadCoursForClasse(selectedClasse);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const removeCours = async (idCours) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    setError('');
    try {
      await deleteCoursAPI(idCours);
      await loadCoursForClasse(selectedClasse);
      if (selectedCoursForEvals?.idCours === idCours) {
        setSelectedCoursForEvals(null);
        setEvaluations([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  };

  // --- Evaluations
  const openProgrammerEval = async (c) => {
    setSelectedCoursForEvals(c);
    setEditingEvalId(null);
    setEvalViewOnly(false);
    setEvalForm({
      ...EMPTY_EVAL,
      classe: String(selectedClasse || c.idClasse || ''),
      cours_id: String(c.idCours),
      idSalle: String(c.idSalle || ''),
      enseignant_id: String(c.idEnseignant || ''),
      scope: currentRole === 'admin' ? 'harmonisee' : 'sequentielle',
    });
    setError('');
    setShowEvalModal(true);

    await loadEvaluationsForCours(c.idCours);
  };

  const openViewEval = (ev) => {
    setEditingEvalId(ev.id);
    setEvalViewOnly(true);
    setEvalForm({
      libelle: ev.libelle || '',
      type: ev.type || 'Contrôle',
      scope: ev.idSalle ? 'sequentielle' : 'harmonisee',
      date: ev.date ? String(ev.date).slice(0, 10) : '',
      duree: ev.duree ?? '',
      coeff: ev.coeff ?? '1',
      classe: ev.classe ?? selectedClasse,
      cours_id: ev.cours_id ?? selectedCoursForEvals?.idCours ?? '',
      idSalle: ev.idSalle ?? selectedCoursForEvals?.idSalle ?? '',
      enseignant_id: ev.enseignant_id ?? selectedCoursForEvals?.idEnseignant ?? '',
      note_max: ev.note_max ?? '20',
      description: ev.description || '',
    });
    setShowEvalModal(true);
  };

  const openEditEval = (ev) => {
    setEditingEvalId(ev.id);
    setEvalViewOnly(false);
    setEvalForm({
      libelle: ev.libelle || '',
      type: ev.type || 'Contrôle',
      scope: ev.idSalle ? 'sequentielle' : 'harmonisee',
      date: ev.date ? String(ev.date).slice(0, 10) : '',
      duree: ev.duree ?? '',
      coeff: ev.coeff ?? '1',
      classe: ev.classe ?? selectedClasse,
      cours_id: ev.cours_id ?? selectedCoursForEvals?.idCours ?? '',
      idSalle: ev.idSalle ?? selectedCoursForEvals?.idSalle ?? '',
      enseignant_id: ev.enseignant_id ?? selectedCoursForEvals?.idEnseignant ?? '',
      note_max: ev.note_max ?? '20',
      description: ev.description || '',
    });
    setShowEvalModal(true);
  };

  const submitEval = async (e) => {
    e?.preventDefault?.();
    if (evalViewOnly) {
      setShowEvalModal(false);
      return;
    }

    if (!evalForm.libelle.trim()) {
      setError('Libellé requis');
      return;
    }
    if (!evalForm.cours_id && !evalForm.idSalle && !evalForm.classe) {
      setError('classe, cours_id ou salle requis');
      return;
    }

    const isAdminLike = currentRole === 'admin' || currentRole === 'superadmin';
    const isTeacher = currentRole === 'teacher' || currentRole === 'enseignant';

    if (isTeacher) {
      if (!evalForm.idSalle) {
        setError('Une évaluation professeur doit être liée à une salle');
        return;
      }
      if (evalForm.scope !== 'sequentielle') {
        setError('La portée professeur doit être séquentielle');
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      const scope = isAdminLike ? 'harmonisee' : 'sequentielle';
      const parsedIdSalle = evalForm.idSalle ? Number(evalForm.idSalle) : null;

      if (!isAdminLike && !parsedIdSalle) {
        setError('Une évaluation professeur doit être liée à une salle');
        setSaving(false);
        return;
      }

      if (isAdminLike && scope === 'harmonisee') {
        if (parsedIdSalle) {
          setError('Une évaluation harmonisée ne doit pas être liée à une salle');
          setSaving(false);
          return;
        }
      }

      const idSalle = isAdminLike && scope === 'harmonisee' ? null : parsedIdSalle;

      const payload = {
        libelle: evalForm.libelle,
        type: evalForm.type,
        scope,
        date: evalForm.date || null,
        duree: evalForm.duree === '' ? null : Number(evalForm.duree),
        coeff: evalForm.coeff === '' ? null : Number(evalForm.coeff),
        classe: evalForm.classe ? Number(evalForm.classe) : null,
        cours_id: evalForm.cours_id ? Number(evalForm.cours_id) : null,
        idSalle,
        enseignant_id: evalForm.enseignant_id ? Number(evalForm.enseignant_id) : null,
        note_max: evalForm.note_max === '' ? 20 : Number(evalForm.note_max),
        description: evalForm.description || '',
      };

      if (editingEvalId) await updateEvaluationProgrammeAPI(editingEvalId, payload);
      else await createEvaluationProgrammeAPI(payload);

      setShowEvalModal(false);
      setSuccess(editingEvalId ? 'Évaluation mise à jour !' : 'Évaluation programmée !');
      setTimeout(() => setSuccess(''), 2500);

      if (selectedCoursForEvals?.idCours) await loadEvaluationsForCours(selectedCoursForEvals.idCours);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const removeEval = async (id) => {
    if (!window.confirm('Supprimer cette évaluation ?')) return;
    setError('');
    try {
      await deleteEvaluationProgrammeAPI(id);
      if (selectedCoursForEvals?.idCours) await loadEvaluationsForCours(selectedCoursForEvals.idCours);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  };

  const filteredCours = useMemo(() => {
    return cours.filter((c) => {
      const txt = `${c.idCours || ''} ${c.libelle || ''} ${c.enseignant || ''} ${c.salle || ''}`.toLowerCase();
      return txt.includes(searchCours.toLowerCase());
    });
  }, [cours, searchCours]);

  return (
    <Layout title="Cours & Évaluations" subtitle="Lister les cours par classe et programmer des évaluations">
      <style>{`
        input:focus,select:focus,textarea:focus{border-color:${BLUE}!important;box-shadow:0 0 0 3px rgba(0,98,255,0.12)}
        .card{background:#fff;border:1px solid #edf2f7;border-radius:16px;box-shadow:0 10px 26px rgba(15,23,42,0.06)}
        .card:hover{box-shadow:0 14px 34px rgba(15,23,42,0.10)}
        .row:hover{background:#f8fbff}
      `}</style>

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, color: '#15803d', fontSize: 13, fontWeight: 800 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Chargement...</div>
      ) : (
        <>
          {/* Vue 1: Lister Cours par Classe */}
          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #0062ff, #ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>Lister Cours par Classe</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Sélectionnez une classe, puis gérez ses cours</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)} style={{ ...inp, width: 280 }}>
                  <option value="">-- Sélectionner classe --</option>
                  {classes.map((c) => (
                    <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                  ))}
                </select>

                <button
                  onClick={() => selectedClasse && loadCoursForClasse(selectedClasse)}
                  disabled={!selectedClasse}
                  style={{ padding: '10px 14px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', cursor: selectedClasse ? 'pointer' : 'not-allowed', color: '#475569', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 900, opacity: selectedClasse ? 1 : 0.55 }}
                  title="Actualiser"
                >
                  <RefreshCw size={16} /> Actualiser
                </button>

                <button
                  onClick={openAddCours}
                  disabled={!selectedClasse}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: ORANGE, color: '#fff', border: 'none', cursor: selectedClasse ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 950, boxShadow: '0 12px 26px rgba(255,160,0,0.18)', opacity: selectedClasse ? 1 : 0.55 }}
                >
                  <Plus size={16} /> Ajouter Cours
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 420 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input type="text" placeholder="Rechercher un cours…" value={searchCours} onChange={(e) => setSearchCours(e.target.value)} style={{ ...inp, paddingLeft: 38 }} />
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Classe: <span style={{ fontWeight: 950, color: '#0f172a' }}>{selectedClasse ? classeLabel(selectedClasse) : '—'}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
            {selectedClasse && loadingCours ? (
              <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Chargement des cours...</div>
            ) : !selectedClasse ? (
              <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Sélectionnez une classe pour afficher ses cours</div>
            ) : filteredCours.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Aucun cours pour cette classe</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['ID', 'Libellé', 'Enseignant', 'Heures', 'Salle', 'Nb élèves', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 11, fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCours.map((c, idx) => (
                      <tr key={c.idCours} className="row" style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfdff' }}>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>#{c.idCours}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 950 }}>{c.libelle}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{c.enseignant || enseignantLabel(c.idEnseignant)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: BLUE, fontWeight: 950 }}>{c.heures ?? '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{c.salle || salleLabel(c.idSalle)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{c.nbEleves ?? 0}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openEditCours(c)} style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer', color: BLUE, marginRight: 8 }} title="Modifier"><Edit2 size={14} /></button>
                          <button onClick={() => removeCours(c.idCours)} style={{ padding: 8, background: '#fff7ed', border: 'none', borderRadius: 10, cursor: 'pointer', color: ORANGE, marginRight: 8 }} title="Supprimer"><Trash2 size={14} /></button>
                          <button onClick={() => openProgrammerEval(c)} style={{ padding: '8px 10px', background: BLUE, border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontWeight: 950 }} title="Programmer Éval">
                            Programmer Éval
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Vue 2: Évaluations existantes */}
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #0062ff, #ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>Programmer Évaluation</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {selectedCoursForEvals ? (
                    <>Cours sélectionné: <span style={{ fontWeight: 950, color: '#0f172a' }}>{selectedCoursForEvals.libelle}</span></>
                  ) : 'Cliquez sur “Programmer Éval” sur un cours'}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {loadingEvals ? (
              <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Chargement des évaluations...</div>
            ) : activeEvaluations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>
                {selectedCoursForEvals ? 'Aucune évaluation programmée pour ce cours' : 'Aucune évaluation programmée pour cette classe'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Libellé', 'Type', 'Date', 'Durée', 'Coeff', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 11, fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeEvaluations.map((ev, idx) => (
                      <tr key={ev.id} className="row" style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfdff' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 950 }}>{ev.libelle}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{ev.type || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{ev.duree ? `${ev.duree} min` : '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: BLUE, fontWeight: 950 }}>{ev.coeff ?? '—'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openViewEval(ev)} style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer', color: BLUE, marginRight: 8 }} title="Voir"><Eye size={14} /></button>
                          <button onClick={() => openEditEval(ev)} style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer', color: BLUE, marginRight: 8 }} title="Modifier"><Edit2 size={14} /></button>
                          <button onClick={() => removeEval(ev.id)} style={{ padding: 8, background: '#fff7ed', border: 'none', borderRadius: 10, cursor: 'pointer', color: ORANGE }} title="Supprimer"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Ajouter / Modifier Cours */}
          {showCoursModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 560, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>{editingCoursId ? 'Modifier Cours' : 'Ajouter Cours'}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Libellé, classe, enseignant, heures, salle</div>
                  </div>
                  <button onClick={() => setShowCoursModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
                </div>

                <form onSubmit={submitCours} style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Libellé *</label>
                    <input value={coursForm.libelle} onChange={(e) => setCoursForm({ ...coursForm, libelle: e.target.value })} style={inp} placeholder="Ex: Mathématiques" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Classe *</label>
                      <select value={coursForm.idClasse} onChange={(e) => setCoursForm({ ...coursForm, idClasse: e.target.value })} style={inp}>
                        <option value="">-- Choisir --</option>
                        {classes.map((c) => (
                          <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Enseignant</label>
                      <select value={coursForm.idEnseignant} onChange={(e) => setCoursForm({ ...coursForm, idEnseignant: e.target.value })} style={inp}>
                        <option value="">-- Choisir --</option>
                        {enseignants.map((en) => (
                          <option key={en.idEnseignant} value={en.idEnseignant}>{`${en.prenom || ''} ${en.nom || ''}`.trim()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Heures</label>
                      <input type="number" min={0} value={coursForm.heures} onChange={(e) => setCoursForm({ ...coursForm, heures: e.target.value })} style={inp} placeholder="Ex: 2" />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Salle</label>
                      <select value={coursForm.idSalle} onChange={(e) => setCoursForm({ ...coursForm, idSalle: e.target.value })} style={inp}>
                        <option value="">-- Choisir --</option>
                        {salles.map((s) => (
                          <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#fed7aa' : ORANGE, color: '#fff', border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 950, boxShadow: '0 12px 26px rgba(255,160,0,0.18)' }}>
                      {saving ? 'Enregistrement…' : (editingCoursId ? 'Mettre à jour' : 'Créer')}
                    </button>
                    <button type="button" onClick={() => setShowCoursModal(false)} style={{ padding: '12px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 800 }}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Programmer / Modifier Évaluation */}
          {showEvalModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 720, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>{evalViewOnly ? 'Voir Évaluation' : (editingEvalId ? 'Modifier Évaluation' : 'Programmer Évaluation')}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Tous les attributs: libellé, type, portée, salle, classe, cours_id, enseignant_id, note_max, description</div>
                  </div>
                  <button onClick={() => setShowEvalModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
                </div>

                <form onSubmit={submitEval} style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Libellé *</label>
                    <input disabled={evalViewOnly} value={evalForm.libelle} onChange={(e) => setEvalForm({ ...evalForm, libelle: e.target.value })} style={inp} placeholder="Ex: Contrôle 1" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Type</label>
                      <select disabled={evalViewOnly} value={evalForm.type} onChange={(e) => setEvalForm({ ...evalForm, type: e.target.value })} style={inp}>
                        {['Contrôle', 'Devoir', 'Examen', 'Interrogation', 'Oral', 'TP'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Portée</label>
                      {(currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'enseignant' || currentRole === 'teacher') ? (
                        <input
                          readOnly
                          value={(currentRole === 'admin' || currentRole === 'superadmin') ? 'Harmonisée (admin)' : 'Séquentielle (professeur)'}
                          style={{ ...inp, background: '#f8fafc' }}
                        />
                      ) : (
                        <select disabled={evalViewOnly} value={evalForm.scope || 'sequentielle'} onChange={(e) => setEvalForm({ ...evalForm, scope: e.target.value })} style={inp}>
                          <option value="harmonisee">Harmonisée (admin)</option>
                          <option value="sequentielle">Séquentielle (professeur)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Date</label>
                      <input disabled={evalViewOnly} type="date" value={evalForm.date} onChange={(e) => setEvalForm({ ...evalForm, date: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Salle</label>
                      {(currentRole === 'admin' || currentRole === 'superadmin') && evalForm.scope === 'harmonisee' ? (
                        <input disabled value="Aucune salle requise pour une évaluation harmonisée" style={{ ...inp, background: '#f8fafc' }} />
                      ) : (
                        <select disabled={evalViewOnly} value={evalForm.idSalle || ''} onChange={(e) => setEvalForm({ ...evalForm, idSalle: e.target.value })} style={inp}>
                          <option value="">-- Aucune / harmonisée --</option>
                          {salles.map((s) => (
                            <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Durée (min)</label>
                      <input disabled={evalViewOnly} type="number" min={0} value={evalForm.duree} onChange={(e) => setEvalForm({ ...evalForm, duree: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Coeff</label>
                      <input disabled={evalViewOnly} type="number" step="0.01" min={0} value={evalForm.coeff} onChange={(e) => setEvalForm({ ...evalForm, coeff: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Note max</label>
                      <input disabled={evalViewOnly} type="number" step="0.01" min={0} value={evalForm.note_max} onChange={(e) => setEvalForm({ ...evalForm, note_max: e.target.value })} style={inp} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Classe</label>
                    <select disabled={evalViewOnly} value={evalForm.classe} onChange={(e) => setEvalForm({ ...evalForm, classe: e.target.value })} style={inp}>
                      <option value="">-- Choisir --</option>
                      {classes.map((c) => (
                        <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>cours_id</label>
                      <input disabled value={evalForm.cours_id || '—'} style={{ ...inp, background: '#f8fafc' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>enseignant_id</label>
                      <input disabled value={evalForm.enseignant_id || '—'} style={{ ...inp, background: '#f8fafc' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Description</label>
                    <textarea disabled={evalViewOnly} rows={4} value={evalForm.description} onChange={(e) => setEvalForm({ ...evalForm, description: e.target.value })} style={{ ...inp, resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#93c5fd' : BLUE, color: '#fff', border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 950, boxShadow: '0 12px 26px rgba(0,98,255,0.18)' }}>
                      {evalViewOnly ? 'Fermer' : (saving ? 'Enregistrement…' : (editingEvalId ? 'Mettre à jour' : 'Programmer'))}
                    </button>
                    <button type="button" onClick={() => setShowEvalModal(false)} style={{ padding: '12px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 800 }}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
