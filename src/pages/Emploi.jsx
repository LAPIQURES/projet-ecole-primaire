import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import ParentLayout from '../components/ParentLayout';
import TeacherLayout from '../components/TeacherLayout';
import {
  affecterEnseignantAPI,
  createEmploiAPI,
  deleteEmploiAPI,
  getClassesAPI,
  getCoursAPI,
  getEmploiAPI,
  getEnseignantsAPI,
  getSallesAPI,
  updateEmploiAPI,
} from '../services/api';
import {
  AlertCircle,
  CalendarDays,
  DoorOpen,
  Edit2,
  Plus,
  RefreshCw,
  School,
  Trash2,
  Users,
  X,
} from 'lucide-react';

const BLUE = '#0062ff';
const ORANGE = '#ffa000';

const DAYS = [
  { value: 1, short: 'Lun', label: 'Lundi' },
  { value: 2, short: 'Mar', label: 'Mardi' },
  { value: 3, short: 'Mer', label: 'Mercredi' },
  { value: 4, short: 'Jeu', label: 'Jeudi' },
  { value: 5, short: 'Ven', label: 'Vendredi' },
];

const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i); // 7h → 17h

const normalizeScheduleDay = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (/^[1-5]$/.test(lower)) return Number(lower);
  if (lower.startsWith('lun')) return 1;
  if (lower.startsWith('mar')) return 2;
  if (lower.startsWith('mer')) return 3;
  if (lower.startsWith('jeu')) return 4;
  if (lower.startsWith('ven')) return 5;
  return null;
};

const normalizeEmploiItem = (item, courses = []) => {
  const normalized = { ...item };
  normalized.id = item.id ?? item.idTemps ?? item.ID ?? item.Id;
  normalized.dayOfWeek = normalizeScheduleDay(item.dayOfWeek ?? item.jour ?? item.day ?? item.day_of_week ?? item.jourDeSemaine) ?? normalized.dayOfWeek;
  const rawHeure = String(item.heure ?? '').trim();
  const heureParts = rawHeure.includes('-') ? rawHeure.split('-').map((p) => p.trim()) : [rawHeure];
  normalized.startTime = normalizeTimeInput(item.startTime ?? heureParts[0] ?? item.start ?? item.heure_debut ?? item.time ?? '');
  normalized.idProf = item.idProf ?? item.idEnseignant ?? item.id_prof ?? item.idProfesseur ?? item.idEnseignant;

  if (item.endTime || item.fin_heure || item.end || item.heure_fin || item.finishTime || heureParts[1]) {
    normalized.endTime = normalizeTimeInput(item.endTime ?? item.fin_heure ?? item.end ?? item.heure_fin ?? item.finishTime ?? heureParts[1]);
  } else if (normalized.startTime) {
    normalized.endTime = computeEndTime(normalized.startTime, 1);
  }

  if (!normalized.subject && item.idCours) {
    const course = courses.find((c) => String(c.idCours || c.id) === String(item.idCours));
    if (course) normalized.subject = course.libelle || course.label || normalized.subject;
  }

  if (!normalized.subject && item.subject) {
    normalized.subject = item.subject;
  }

  return normalized;
};

const EMPTY_FORM = {
  id: null,
  idClasse: '',
  dayOfWeek: '1',
  startTime: '08:00',
  duration: '1',
  idCours: '',
  subject: '',
  idProf: '',
  idSalle: '',
};

export default function Emploi() {
  const userRole = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return String(user.role || '').toLowerCase();
    } catch {
      return '';
    }
  })();

  const Shell = userRole === 'parent' ? ParentLayout : userRole === 'enseignant' ? TeacherLayout : Layout;

  const [items, setItems] = useState([]);
  const [salles, setSalles] = useState([]);
  const [profs, setProfs] = useState([]);
  const [classes, setClasses] = useState([]);
  const [cours, setCours] = useState([]);

  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedSalle, setSelectedSalle] = useState('');
  const [selectedMode, setSelectedMode] = useState('classe'); // 'classe' | 'salle'
  const [activeView, setActiveView] = useState('grille'); // 'grille' | 'affectations'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'details' | 'affecter'
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedItem, setSelectedItem] = useState(null);

  const [affectProf, setAffectProf] = useState(null);
  const [affectSalle, setAffectSalle] = useState('');
  const [manualAffectations, setManualAffectations] = useState({}); // { [idEnseignant]: Set<idSalle> }

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [eRes, sRes, pRes, cRes, coursRes] = await Promise.all([
        getEmploiAPI(),
        getSallesAPI(),
        getEnseignantsAPI(),
        getClassesAPI(),
        getCoursAPI().catch(() => ({ data: [] })),
      ]);

      const fetchedItems = Array.isArray(eRes.data) ? eRes.data : [];
      const normalizedItems = fetchedItems.map((item) => normalizeEmploiItem(item, Array.isArray(coursRes.data) ? coursRes.data : []));
      setItems(normalizedItems);
      setSalles(Array.isArray(sRes.data) ? sRes.data : []);
      setProfs(Array.isArray(pRes.data) ? pRes.data : []);
      setClasses(Array.isArray(cRes.data) ? cRes.data : []);
      setCours(Array.isArray(coursRes.data) ? coursRes.data : []);

      // DEBUG: log any slots mentioning "anglais" or using the common 'Anglais' course id
      try {
        const matches = normalizedItems.filter((it) => {
          const subj = String(it.subject || '').toLowerCase();
          if (subj.includes('anglais')) return true;
          if (String(it.idCours || '') === '31') return true;
          return false;
        });
        if (matches.length) {
          // eslint-disable-next-line no-console
          console.info('DEBUG: Emploi normalized items matching "Anglais":', matches);
        } else {
          // eslint-disable-next-line no-console
          console.info('DEBUG: No Emploi normalized items found for "Anglais"');
        }
      } catch (dbgErr) {
        // eslint-disable-next-line no-console
        console.warn('DEBUG: error inspecting emploi items', dbgErr);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const profByIdPers = useMemo(() => {
    const m = new Map();
    for (const p of profs) m.set(String(p.idPers), p);
    return m;
  }, [profs]);

  const salleById = useMemo(() => {
    const m = new Map();
    for (const s of salles) m.set(String(s.idSalle), s);
    return m;
  }, [salles]);

  const classeById = useMemo(() => {
    const m = new Map();
    for (const c of classes) m.set(String(c.idClasse), c);
    return m;
  }, [classes]);

  const coursById = useMemo(() => {
    const m = new Map();
    for (const c of cours) m.set(String(c.idCours), c);
    return m;
  }, [cours]);

  const selectedItems = useMemo(() => {
    if (selectedMode === 'classe') {
      if (!selectedClasse) return [];
      return items.filter((it) => String(it.idClasse || '') === String(selectedClasse));
    }
    if (selectedMode === 'salle') {
      if (!selectedSalle) return [];
      return items.filter((it) => String(it.idSalle || '') === String(selectedSalle));
    }
    return [];
  }, [items, selectedClasse, selectedSalle, selectedMode]);

  const cellMap = useMemo(() => {
    const m = new Map();

    for (const it of selectedItems) {
      const day = normalizeScheduleDay(it.dayOfWeek ?? it.jour ?? it.day);
      if (!day || day < 1 || day > 5) continue;

      const start = timeToMinutes(it.startTime);
      const end = timeToMinutes(it.endTime);
      if (start == null || end == null) continue;

      for (const h of HOURS) {
        const cellStart = h * 60;
        const cellEnd = (h + 1) * 60;
        if (!overlaps(start, end, cellStart, cellEnd)) continue;

        const key = `${day}-${h}`;
        const isStart = Math.floor(start / 60) === h;
        // En cas de chevauchement (normalement interdit), on garde le 1er.
        if (!m.has(key)) m.set(key, { item: it, isStart });
      }
    }

    return m;
  }, [selectedItems]);

  const coursOptions = useMemo(() => {
    if (!form.idClasse) return cours;
    return cours.filter((c) => String(c.idClasse || '') === String(form.idClasse));
  }, [cours, form.idClasse]);

  const suggestedSallesForProf = useMemo(() => {
    if (!form.idProf) return [];

    const targetIdPers = String(form.idProf);
    const teacher = profs.find((p) => String(p.idPers) === targetIdPers);
    if (!teacher) return [];

    const ids = new Set();

    // via cours: c.idEnseignant (Enseignant.idEnseignant) + c.idSalle
    for (const c of cours) {
      if (!c?.idSalle) continue;
      if (String(c.idEnseignant || '') === String(teacher.idEnseignant || '')) ids.add(String(c.idSalle));
    }

    // via affectations manuelles (frontend)
    const manual = manualAffectations[String(teacher.idEnseignant)];
    if (manual) for (const id of manual) ids.add(String(id));

    return Array.from(ids)
      .map((id) => salleById.get(String(id)))
      .filter(Boolean);
  }, [form.idProf, profs, cours, manualAffectations, salleById]);

  const computedEndTime = useMemo(() => {
    return computeEndTime(form.startTime, form.duration);
  }, [form.startTime, form.duration]);

  useEffect(() => {
    // Auto: cours => subject + prof + salle
    if (!form.idCours) return;
    const c = coursById.get(String(form.idCours));
    if (!c) return;

    const next = { ...form };
    if (!next.subject) next.subject = c.libelle || '';

    // prof (idPers) depuis c.idEnseignant
    if (!next.idProf && c.idEnseignant) {
      const teacher = profs.find((p) => String(p.idEnseignant || '') === String(c.idEnseignant));
      if (teacher?.idPers) next.idProf = String(teacher.idPers);
    }

    if (!next.idSalle && c.idSalle) next.idSalle = String(c.idSalle);

    // Evite les setState inutiles
    if (
      next.subject !== form.subject ||
      next.idProf !== form.idProf ||
      next.idSalle !== form.idSalle
    ) {
      setForm(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.idCours]);

  const openCreate = (dayOfWeek, startTime) => {
    setError('');
    setSelectedItem(null);
    setForm({
      ...EMPTY_FORM,
      idClasse: selectedMode === 'classe' ? (selectedClasse || '') : '',
      idSalle: selectedMode === 'salle' ? (selectedSalle || '') : '',
      dayOfWeek: String(dayOfWeek ?? 1),
      startTime: startTime ?? '08:00',
      duration: '1',
    });
    setModal('create');
  };

  const openDetails = (it) => {
    setSelectedItem(it);
    setModal('details');
  };

  const openEdit = (it) => {
    setError('');

    const duration = computeDurationHours(it.startTime, it.endTime);
    const normalizedDay = normalizeScheduleDay(it.dayOfWeek ?? it.jour ?? it.day) ?? 1;

    setForm({
      ...EMPTY_FORM,
      id: it.id,
      idClasse: it.idClasse ? String(it.idClasse) : '',
      dayOfWeek: String(normalizedDay),
      startTime: normalizeTimeInput(it.startTime) || '08:00',
      duration: String(duration || 1),
      subject: it.subject || '',
      idProf: it.idProf ? String(it.idProf) : '',
      idSalle: it.idSalle ? String(it.idSalle) : '',
      idCours: '',
    });
    setSelectedItem(it);
    setModal('edit');
  };

  const validateForm = () => {
    const start = timeToMinutes(form.startTime);
    const end = timeToMinutes(computedEndTime);

    if (!form.idClasse) return 'La classe est obligatoire';
    if (!form.dayOfWeek) return 'Le jour est obligatoire';
    if (!form.startTime) return 'L\'heure de début est obligatoire';
    if (!form.duration || Number(form.duration) <= 0) return 'La durée doit être > 0';
    if (!form.subject && !form.idCours) return 'Le cours / libellé est obligatoire';
    if (!form.idProf) return 'L\'enseignant est obligatoire';
    if (!form.idSalle) return 'La salle est obligatoire';

    if (start == null || end == null) return 'Heures invalides';
    if (end <= start) return 'La durée doit produire une heure de fin valide';

    // bornes 8h → 18h (tolérance)
    if (start < 8 * 60 || end > 18 * 60) return 'Horaire hors plage (08:00 → 18:00)';

    const conflict = findConflict({
      ...form,
      endTime: computedEndTime,
    }, items, form.id);

    if (conflict) return conflict;

    return '';
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();

    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      idSalle: form.idSalle || null,
      idClasse: form.idClasse || null,
      idProf: form.idProf || null,
      subject: (form.subject || coursById.get(String(form.idCours))?.libelle || '').trim(),
      dayOfWeek: Number(form.dayOfWeek),
      startTime: normalizeTimeInput(form.startTime),
      endTime: normalizeTimeInput(computedEndTime),
      // compatibility: also send 'jour' and 'heure' for backends using legacy schema
      jour: DAYS.find(d => Number(d.value) === Number(form.dayOfWeek))?.label || undefined,
      heure: normalizeTimeInput(form.startTime),
      idCours: form.idCours || undefined,
    };

    setSaving(true);
    setError('');
    try {
      if (modal === 'edit' && form.id) {
        try {
          await updateEmploiAPI(form.id, payload);
        } catch (err) {
          // compat backend (si PUT non supporté)
          if ([404, 405].includes(err?.response?.status)) {
            await deleteEmploiAPI(form.id);
            await createEmploiAPI(payload);
          } else {
            throw err;
          }
        }
        setSuccess('Créneau modifié !');
      } else {
        await createEmploiAPI(payload);
        setSuccess('Créneau ajouté !');
      }

      setModal(null);
      setForm(EMPTY_FORM);
      setSelectedItem(null);
      await loadAll();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      await deleteEmploiAPI(id);
      setModal(null);
      setSelectedItem(null);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  };

  const openAffecter = (p) => {
    setError('');
    setSuccess('');
    setAffectProf(p);
    setAffectSalle('');
    setModal('affecter');
  };

  const handleAffecter = async () => {
    if (!affectProf?.idEnseignant) {
      setError('Enseignant invalide');
      return;
    }
    if (!affectSalle) {
      setError('Sélectionnez une salle');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await affecterEnseignantAPI(affectProf.idEnseignant, { idSalle: Number(affectSalle) });

      setManualAffectations((prev) => {
        const next = { ...prev };
        const key = String(affectProf.idEnseignant);
        const set = new Set(next[key] || []);
        set.add(String(affectSalle));
        next[key] = set;
        return next;
      });

      setSuccess('Affectation enregistrée !');
      setModal(null);
      setActiveView('affectations');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'affectation');
    } finally {
      setSaving(false);
    }
  };

  const teacherStats = useMemo(() => {
    const rows = profs.map((p) => {
      const idPers = String(p.idPers);
      const teacherItems = items.filter((it) => String(it.idProf || '') === idPers);

      const hours = teacherItems.reduce((acc, it) => acc + (computeDurationHours(it.startTime, it.endTime) || 0), 0);

      const classIds = Array.from(new Set(teacherItems.map((it) => String(it.idClasse || '')).filter(Boolean)));
      const classesLabel = classIds
        .map((id) => classeById.get(id)?.libelle || id)
        .filter(Boolean);

      const salleIds = new Set();

      for (const it of teacherItems) {
        if (it.idSalle) salleIds.add(String(it.idSalle));
      }

      for (const c of cours) {
        if (String(c.idEnseignant || '') === String(p.idEnseignant || '') && c.idSalle) salleIds.add(String(c.idSalle));
      }

      const manual = manualAffectations[String(p.idEnseignant)];
      if (manual) for (const id of manual) salleIds.add(String(id));

      const sallesLabel = Array.from(salleIds)
        .map((id) => salleById.get(id)?.libelle || id)
        .filter(Boolean);

      return {
        prof: p,
        hours,
        sallesLabel,
        classesLabel,
      };
    });

    // tri: plus chargé en haut
    return rows.sort((a, b) => (b.hours || 0) - (a.hours || 0));
  }, [profs, items, classeById, cours, salleById, manualAffectations]);

  const renderCell = (day, h) => {
    const key = `${day}-${h}`;
    const info = cellMap.get(key);

    const hasSelection = selectedMode === 'classe' ? Boolean(selectedClasse) : Boolean(selectedSalle);
    const baseStyle = {
      border: '1px solid #e2e8f0',
      height: 64,
      padding: 8,
      verticalAlign: 'top',
      background: '#fff',
      cursor: hasSelection ? 'pointer' : 'not-allowed',
      position: 'relative',
      minWidth: 180,
    };

    if (!hasSelection) {
      return (
        <td key={key} style={{ ...baseStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}>
          <div style={{ fontSize: 12 }}>—</div>
        </td>
      );
    }

    if (!info) {
      return (
        <td
          key={key}
          style={{ ...baseStyle }}
          onClick={() => openCreate(day, `${pad2(h)}:00`)}
          title="Ajouter un cours"
        />
      );
    }

    const it = info.item;
    const isStart = info.isStart;
    const color = colorForSubject(it.subject || 'Cours');
    const bg = isStart ? color : lighten(color, 0.22);

    const prof = it.idProf ? profByIdPers.get(String(it.idProf)) : null;
    const salle = it.idSalle ? salleById.get(String(it.idSalle)) : null;

    const tooltip = `${it.subject || 'Cours'}\n${prof ? `${prof.prenom} ${prof.nom}` : 'Enseignant: —'}\n${salle ? `Salle: ${salle.libelle}` : `Salle: ${it.idSalle || '—'}`}\n${normalizeTimeInput(it.startTime)} - ${normalizeTimeInput(it.endTime)}`;

    const classe = it.idClasse ? classeById.get(String(it.idClasse)) : null;
    return (
      <td
        key={key}
        style={{ ...baseStyle, background: bg }}
        onClick={() => openDetails(it)}
        title={tooltip}
      >
        {isStart ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 950, color: '#0f172a', lineHeight: 1.1 }}>
              {it.subject || '—'}
            </div>
            {selectedMode === 'salle' && (
              <div style={{ fontSize: 12, color: '#475569', opacity: 0.95 }}>
                {classe ? classe.libelle : it.idClasse || '—'}
              </div>
            )}
            <div style={{ fontSize: 12, color: '#0f172a', opacity: 0.85, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span>{prof ? `${prof.prenom} ${prof.nom}` : it.idProf || '—'}</span>
              <span>·</span>
              <span>{salle ? salle.libelle : it.idSalle || '—'}</span>
            </div>
            <div style={{ fontSize: 11, color: '#0f172a', opacity: 0.75 }}>
              {normalizeTimeInput(it.startTime)} - {normalizeTimeInput(it.endTime)}
            </div>
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', opacity: 0.9, textAlign: 'center', lineHeight: 1 }}>
              {it.subject || '—'}
            </div>
          </div>
        )}
      </td>
    );
  };

  return (
    <Shell title="Emploi du temps" subtitle="Grille horaire (Lun–Ven) + affectations">
      <style>{`
        input:focus,select:focus{border-color:${BLUE}!important;box-shadow:0 0 0 3px rgba(0,98,255,0.16)}
        .card{background:#fff;border:1px solid #edf2f7;border-radius:16px;box-shadow:0 10px 26px rgba(15,23,42,0.06)}
        .tab{padding:10px 14px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-weight:900;font-size:13px;color:#475569}
        .tabActive{border-color:${BLUE};color:${BLUE};box-shadow:0 10px 22px rgba(0,98,255,0.10)}
      `}</style>

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, color: '#15803d', fontSize: 13, fontWeight: 900 }}>
          {success}
        </div>
      )}

      {error && !modal && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* top controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={loadAll}
            style={{ padding: '10px 14px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 950 }}
          >
            <RefreshCw size={16} /> Actualiser
          </button>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setSelectedMode('classe')}
              style={{ padding: '10px 14px', borderRadius: 12, border: selectedMode === 'classe' ? `1px solid ${BLUE}` : '1px solid #e2e8f0', background: selectedMode === 'classe' ? '#eff6ff' : '#fff', color: selectedMode === 'classe' ? BLUE : '#475569', cursor: 'pointer', fontWeight: 900 }}
            >
              Par classe
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode('salle')}
              style={{ padding: '10px 14px', borderRadius: 12, border: selectedMode === 'salle' ? `1px solid ${BLUE}` : '1px solid #e2e8f0', background: selectedMode === 'salle' ? '#eff6ff' : '#fff', color: selectedMode === 'salle' ? BLUE : '#475569', cursor: 'pointer', fontWeight: 900 }}
            >
              Par salle
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0' }}>
            {selectedMode === 'classe' ? <School size={16} color={BLUE} /> : <DoorOpen size={16} color={BLUE} />}
            {selectedMode === 'classe' ? (
              <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)} style={{ ...inp, border: 'none', padding: 0, width: 220 }}>
                <option value="">-- Sélectionner classe --</option>
                {classes.map((c) => (
                  <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                ))}
              </select>
            ) : (
              <select value={selectedSalle} onChange={(e) => setSelectedSalle(e.target.value)} style={{ ...inp, border: 'none', padding: 0, width: 220 }}>
                <option value="">-- Sélectionner salle --</option>
                {salles.map((s) => (
                  <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ fontSize: 12, color: '#64748b' }}>
            {selectedMode === 'classe'
              ? (selectedClasse ? `${selectedItems.length} créneau(x) pour la classe` : 'Sélectionnez une classe pour afficher la grille')
              : (selectedSalle ? `${selectedItems.length} créneau(x) pour la salle` : 'Sélectionnez une salle pour afficher la grille')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className={`tab ${activeView === 'grille' ? 'tabActive' : ''}`}
            onClick={() => setActiveView('grille')}
            type="button"
          >
            <CalendarDays size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Grille
          </button>
          <button
            className={`tab ${activeView === 'affectations' ? 'tabActive' : ''}`}
            onClick={() => setActiveView('affectations')}
            type="button"
          >
            <Users size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Affectations prof→salle
          </button>

          <button
            onClick={() => openCreate(1, '08:00')}
            disabled={selectedMode === 'classe' ? !selectedClasse : !selectedSalle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 12,
              background: (selectedMode === 'classe' ? selectedClasse : selectedSalle) ? ORANGE : '#fed7aa',
              color: (selectedMode === 'classe' ? selectedClasse : selectedSalle) ? '#fff' : '#9a3412',
              border: 'none',
              cursor: (selectedMode === 'classe' ? selectedClasse : selectedSalle) ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 950,
              boxShadow: (selectedMode === 'classe' ? selectedClasse : selectedSalle) ? '0 12px 26px rgba(255,160,0,0.22)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
        {[{
          icon: <CalendarDays size={18} color={BLUE} />,
          title: 'Créneaux',
          value: items.length,
          subtitle: 'au total',
        }, {
          icon: <DoorOpen size={18} color={ORANGE} />,
          title: 'Salles',
          value: salles.length,
          subtitle: 'disponibles',
        }, {
          icon: <Users size={18} color="#7c3aed" />,
          title: 'Enseignants',
          value: profs.length,
          subtitle: 'chargés',
        }].map((c) => (
          <div key={c.title} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, #0062ff, #ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 950, color: '#0f172a', fontSize: 13 }}>{c.title}</div>
                <div style={{ fontSize: 18, fontWeight: 950, color: '#0f172a', marginTop: 2 }}>{c.value} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 800 }}>{c.subtitle}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* content */}
      <div className="card" style={{ padding: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', fontSize: 13 }}>Chargement…</div>
        ) : activeView === 'affectations' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: '#eff6ff', borderBottom: '1px solid #e2e8f0' }}>
                  {['Enseignant', 'Salles assignées', 'Heures / semaine', 'Classes', 'Action'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teacherStats.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 42, textAlign: 'center', color: '#94a3b8' }}>Aucun enseignant</td></tr>
                ) : teacherStats.map((r) => (
                  <tr key={r.prof.idEnseignant} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 950, color: '#0f172a' }}>{r.prof.prenom} {r.prof.nom}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{r.sallesLabel.length ? r.sallesLabel.join(', ') : '—'}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{(r.hours || 0).toFixed(1)} h</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{r.classesLabel.length ? r.classesLabel.join(', ') : '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={() => openAffecter(r.prof)}
                        style={{ padding: '9px 12px', borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', cursor: 'pointer', color: ORANGE, fontWeight: 950, fontSize: 12, whiteSpace: 'nowrap' }}
                        title="Ajouter une affectation prof → salle"
                      >
                        <DoorOpen size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Affecter salle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
              Astuce: les salles sont déduites des cours (idEnseignant→idSalle) et/ou des créneaux. L\'affectation manuelle enregistre une suggestion via l\'API enseignant.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
              <thead>
                <tr>
                  <th style={{ padding: 10, background: '#f8fafc', border: '1px solid #e2e8f0', width: 86 }} />
                  {DAYS.map((d) => (
                    <th key={d.value} style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: 12, fontWeight: 950, color: '#0f172a' }}>{d.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td style={{ padding: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: 950, color: '#0f172a', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {h}h - {h + 1}h
                    </td>
                    {DAYS.map((d) => renderCell(d.value, h))}
                  </tr>
                ))}
              </tbody>
            </table>

            {!((selectedMode === 'classe' ? selectedClasse : selectedSalle)) && (
              <div style={{ padding: 16, fontSize: 12, color: '#94a3b8' }}>
                {selectedMode === 'classe'
                  ? 'Sélectionnez une classe pour afficher et modifier son emploi du temps.'
                  : 'Sélectionnez une salle pour afficher et modifier son emploi du temps.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: create/edit */}
      {(modal === 'create' || modal === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 720, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>{modal === 'edit' ? 'Modifier un créneau' : 'Ajouter un cours à l\'emploi du temps'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Conflits vérifiés: salle / enseignant / classe</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Classe *</label>
                <select value={form.idClasse} onChange={(e) => setForm({ ...form, idClasse: e.target.value, idCours: '' })} style={inp}>
                  <option value="">-- Classe --</option>
                  {classes.map((c) => (
                    <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Jour *</label>
                <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} style={inp}>
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Heure début *</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} style={inp} />
              </div>

              <div>
                <label style={lbl}>Durée (heures) *</label>
                <input type="number" min={0.5} step={0.5} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} style={inp} />
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Fin: <span style={{ fontWeight: 950, color: '#0f172a' }}>{computedEndTime}</span></div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Cours *</label>
                <select value={form.idCours} onChange={(e) => setForm({ ...form, idCours: e.target.value, subject: '' })} style={inp}>
                  <option value="">-- Sélectionner un cours --</option>
                  {coursOptions.map((c) => (
                    <option key={c.idCours} value={c.idCours}>{c.libelle}</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Couleur auto par cours (libellé).</div>
              </div>

              <div>
                <label style={lbl}>Enseignant *</label>
                <select value={form.idProf} onChange={(e) => setForm({ ...form, idProf: e.target.value, idSalle: '' })} style={inp}>
                  <option value="">-- Enseignant --</option>
                  {profs.map((p) => (
                    <option key={p.idEnseignant} value={p.idPers}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Salle *</label>
                <select value={form.idSalle} onChange={(e) => setForm({ ...form, idSalle: e.target.value })} style={inp}>
                  <option value="">-- Salle --</option>
                  {(suggestedSallesForProf.length ? suggestedSallesForProf : salles).map((s) => (
                    <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  {suggestedSallesForProf.length
                    ? 'Salles suggérées (affectation prof→salle)'
                    : 'Aucune salle suggérée: affichage de toutes les salles'}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Libellé (optionnel)</label>
                <input placeholder="(Sinon, le cours sélectionné sera utilisé)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inp} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', background: saving ? 'rgba(255,160,0,0.55)' : ORANGE, color: '#fff', border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 950, boxShadow: saving ? 'none' : '0 12px 26px rgba(255,160,0,0.22)' }}>
                  {saving ? 'Enregistrement…' : (modal === 'edit' ? 'Modifier' : 'Ajouter')}
                </button>
                <button type="button" onClick={() => setModal(null)} style={{ padding: '11px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 900 }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: details */}
      {modal === 'details' && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 560, boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>Détails du créneau</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Clic sur une cellule → détails complets</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            <div style={{ padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff' }}>
              {renderDetailRow('Cours', selectedItem.subject || '—')}
              {renderDetailRow('Classe', classeById.get(String(selectedItem.idClasse || ''))?.libelle || selectedItem.idClasse || '—')}
              {renderDetailRow('Jour', DAYS.find((d) => d.value === Number(selectedItem.dayOfWeek))?.label || selectedItem.dayOfWeek || '—')}
              {renderDetailRow('Horaire', `${normalizeTimeInput(selectedItem.startTime)} - ${normalizeTimeInput(selectedItem.endTime)}`)}
              {renderDetailRow('Enseignant', selectedItem.idProf ? `${profByIdPers.get(String(selectedItem.idProf))?.prenom || ''} ${profByIdPers.get(String(selectedItem.idProf))?.nom || ''}`.trim() || selectedItem.idProf : '—')}
              {renderDetailRow('Salle', salleById.get(String(selectedItem.idSalle || ''))?.libelle || selectedItem.idSalle || '—')}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => openEdit(selectedItem)}
                style={{ flex: 1, padding: '11px 14px', borderRadius: 12, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 950, fontSize: 13, boxShadow: '0 12px 26px rgba(0,98,255,0.18)' }}
              >
                <Edit2 size={16} style={{ verticalAlign: -3, marginRight: 8 }} /> Modifier
              </button>
              <button
                onClick={() => handleDelete(selectedItem.id)}
                style={{ padding: '11px 14px', borderRadius: 12, background: '#fff', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', fontWeight: 950, fontSize: 13 }}
              >
                <Trash2 size={16} style={{ verticalAlign: -3, marginRight: 8 }} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: affecter prof->salle */}
      {modal === 'affecter' && affectProf && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>Affectation prof → salle</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{affectProf.prenom} {affectProf.nom}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div>
              <label style={lbl}>Salle</label>
              <select value={affectSalle} onChange={(e) => setAffectSalle(e.target.value)} style={inp}>
                <option value="">-- Salle --</option>
                {salles.map((s) => (
                  <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={handleAffecter}
                disabled={saving}
                style={{ flex: 1, padding: '11px 14px', borderRadius: 12, background: saving ? 'rgba(255,160,0,0.55)' : ORANGE, color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 950, fontSize: 13, boxShadow: saving ? 'none' : '0 12px 26px rgba(255,160,0,0.22)' }}
              >
                <DoorOpen size={16} style={{ verticalAlign: -3, marginRight: 8 }} /> {saving ? 'Enregistrement…' : 'Ajouter affectation'}
              </button>
              <button
                onClick={() => setModal(null)}
                style={{ padding: '11px 14px', borderRadius: 12, background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 13 }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function renderDetailRow(label, value) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: 120, fontSize: 12, color: '#64748b', fontWeight: 900 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 900, flex: 1 }}>{value}</div>
    </div>
  );
}

function timeToMinutes(t) {
  if (!t) return null;
  const str = String(t).slice(0, 5);
  const [h, m] = str.split(':').map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function normalizeTimeInput(t) {
  if (!t) return '';
  const s = String(t);
  if (s.length >= 5) return s.slice(0, 5);
  return s;
}

function computeEndTime(startTime, durationHours) {
  const start = timeToMinutes(startTime);
  const dur = Number(durationHours);
  if (start == null || !Number.isFinite(dur) || dur <= 0) return '';
  const end = start + Math.round(dur * 60);
  const hh = Math.floor(end / 60);
  const mm = end % 60;
  return `${pad2(hh)}:${pad2(mm)}`;
}

function computeDurationHours(startTime, endTime) {
  const s = timeToMinutes(startTime);
  const e = timeToMinutes(endTime);
  if (s == null || e == null || e <= s) return 0;
  return (e - s) / 60;
}

function findConflict(candidate, items, ignoreId) {
  const day = normalizeScheduleDay(candidate.dayOfWeek);
  const start = timeToMinutes(candidate.startTime);
  const end = timeToMinutes(candidate.endTime);

  if (!day || start == null || end == null) return '';

  for (const it of items) {
    if (ignoreId && String(it.id) === String(ignoreId)) continue;
    if (Number(it.dayOfWeek) !== day) continue;

    const s = timeToMinutes(it.startTime);
    const e = timeToMinutes(it.endTime);
    if (s == null || e == null) continue;

    if (!overlaps(start, end, s, e)) continue;

    if (candidate.idSalle && it.idSalle && String(candidate.idSalle) === String(it.idSalle)) {
      return 'Conflit: la salle est déjà occupée sur cet horaire';
    }
    if (candidate.idProf && it.idProf && String(candidate.idProf) === String(it.idProf)) {
      return 'Conflit: l\'enseignant est déjà occupé sur cet horaire';
    }
    if (candidate.idClasse && it.idClasse && String(candidate.idClasse) === String(it.idClasse)) {
      return 'Conflit: la classe a déjà un cours sur cet horaire';
    }
  }

  return '';
}

function colorForSubject(subject) {
  const s = String(subject || 'Cours');
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 85% 78%)`;
}

function lighten(hsl, amount = 0.15) {
  // expects hsl(H S% L%)
  const m = /hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/.exec(hsl);
  if (!m) return hsl;
  const h = Number(m[1]);
  const s = Number(m[2]);
  const l = Number(m[3]);
  const nl = Math.min(95, Math.round(l + amount * 100));
  return `hsl(${h} ${s}% ${nl}%)`;
}

const lbl = {
  fontSize: 12,
  fontWeight: 950,
  color: '#475569',
  display: 'block',
  marginBottom: 6,
};

const inp = {
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  color: '#0f172a',
  background: '#fff',
};
