import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getClassesAPI, createClassAPI, updateClassAPI, deleteClassAPI } from '../services/api';
import { Plus, Edit2, Trash2, Search, School, Building2, RefreshCw, X, AlertCircle } from 'lucide-react';

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

const EMPTY_FORM = { libelle: '', idCycle: '', pension: '' };

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
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
      const classesRes = await getClassesAPI();
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);

      // Si le backend expose /classes/cycles, on l'utilise directement via fetch simple.
      try {
        const token = localStorage.getItem('token');
        const r = await fetch('/api/classes/cycles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const d = await r.json();
          setCycles(Array.isArray(d) ? d : []);
        }
      } catch {
        setCycles([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (classe) => {
    setFormData({
      libelle: classe.libelle || '',
      idCycle: classe.idCycle || '',
    });
    setEditingId(classe.idClasse);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.libelle.trim()) {
      setError('Le libellé de la classe est obligatoire');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateClassAPI(editingId, formData);
        setSuccess('Classe mise à jour !');
      } else {
        await createClassAPI(formData);
        setSuccess('Classe créée !');
      }
      setShowForm(false);
      await loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return;
    try {
      await deleteClassAPI(id);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((classe) =>
      `${classe.idClasse || ''} ${classe.libelle || ''} ${classe.niveau || ''} ${classe.cycle || ''}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [classes, search]);

  const bilingualCycles = useMemo(() => {
    return cycles.filter((cycle) => /biling|anglophone|francophone/i.test(String(cycle.libelle || '')));
  }, [cycles]);

  return (
    <Layout title="Classes" subtitle="Gestion des classes">
      <style>{`
        input:focus,select:focus{border-color:${BLUE}!important;box-shadow:0 0 0 3px rgba(0,98,255,0.12)}
        .card{background:#fff;border:1px solid #edf2f7;border-radius:16px;box-shadow:0 10px 26px rgba(15,23,42,0.06)}
        .card:hover{box-shadow:0 14px 34px rgba(15,23,42,0.10)}
        .row:hover{background:#f8fbff}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher une classe…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 38 }} />
          </div>

          <button
            onClick={loadAll}
            style={{ padding: '10px 14px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800 }}
            title="Actualiser"
          >
            <RefreshCw size={16} /> Actualiser
          </button>

          <button
            onClick={() => navigate('/salles')}
            style={{ padding: '10px 14px', borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', cursor: 'pointer', color: ORANGE, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 900 }}
          >
            <Building2 size={16} /> Salles
          </button>
        </div>

        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 950, boxShadow: '0 12px 26px rgba(0,98,255,0.18)', whiteSpace: 'nowrap' }}
        >
          <Plus size={16} /> Nouvelle classe
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)', gap: 14, marginBottom: 16, alignItems: 'start' }}>
        <div className="card" style={{ padding: 16, transition: 'box-shadow 180ms ease', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, #0062ff, #ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <School size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>Gestion des classes</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{classes.length} classe(s) au total</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 16, transition: 'box-shadow 180ms ease', minWidth: 0, maxHeight: 280, overflow: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 950, color: '#0f172a', marginBottom: 8 }}>Cycles disponibles</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cycles.length > 0 ? cycles.map((cycle) => (
              <span key={cycle.idCycle} style={{ padding: '6px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569', fontSize: 12, border: '1px solid #e2e8f0' }}>
                {cycle.libelle}
              </span>
            )) : (
              <span style={{ color: '#94a3b8', fontSize: 12 }}>Aucun cycle chargé</span>
            )}
          </div>
          <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #eef2f7' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Options bilingues</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bilingualCycles.length > 0 ? bilingualCycles.map((cycle) => (
                <span key={cycle.idCycle} style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(0,98,255,0.08)', color: BLUE, fontSize: 12, border: '1px solid rgba(0,98,255,0.16)', fontWeight: 800 }}>
                  {cycle.libelle}
                </span>
              )) : (
                <span style={{ color: '#94a3b8', fontSize: 12 }}>Aucune option bilingue configurée</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 520, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>{editingId ? 'Modifier la classe' : 'Nouvelle classe'}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Saisissez le libellé et le cycle, y compris bilingue si disponible</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Libellé *</label>
                <input type="text" placeholder="Ex: 6A" value={formData.libelle} onChange={(e) => setFormData({ ...formData, libelle: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Cycle</label>
                <select value={formData.idCycle} onChange={(e) => setFormData({ ...formData, idCycle: e.target.value })} style={inp}>
                  <option value="">-- Aucun cycle --</option>
                  {cycles.map((cycle) => (
                    <option key={cycle.idCycle} value={cycle.idCycle}>{cycle.libelle}</option>
                  ))}
                </select>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {bilingualCycles.slice(0, 4).map((cycle) => (
                    <span key={cycle.idCycle} style={{ padding: '4px 9px', borderRadius: 999, background: 'rgba(0,98,255,0.08)', color: BLUE, fontSize: 11, fontWeight: 800 }}>
                      Bilingue · {cycle.libelle}
                    </span>
                  ))}
                </div>
              </div>
              {!editingId && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Prix de la scolarité (FCFA)</label>
                  <input type="number" placeholder="Ex: 150000" value={formData.pension} onChange={(e) => setFormData({ ...formData, pension: e.target.value })} style={inp} />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Le système génèrera automatiquement 3 tranches pour cette classe.</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#93c5fd' : BLUE, color: '#fff', border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 950, boxShadow: '0 12px 26px rgba(0,98,255,0.18)' }}>
                  {saving ? 'Enregistrement…' : (editingId ? 'Mettre à jour' : 'Enregistrer')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '12px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 800 }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Chargement...</div>
        ) : filteredClasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Aucune classe trouvée</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['ID', 'Libellé', 'Niveau', 'Nb élèves', 'Enseignant', 'Salles', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((classe, idx) => (
                  <tr key={classe.idClasse} className="row" style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfdff' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>#{classe.idClasse}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 950 }}>{classe.libelle}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{classe.niveau || classe.cycle || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: BLUE, fontWeight: 950 }}>{classe.nbEleves || 0}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{classe.enseignant || classe.enseignantNom || classe.nomEnseignant || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{classe.nbSalles || (Array.isArray(classe.salles) ? classe.salles.length : 0)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => openEdit(classe)} style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer', color: BLUE, marginRight: 8 }} title="Modifier"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(classe.idClasse)} style={{ padding: 8, background: '#fff7ed', border: 'none', borderRadius: 10, cursor: 'pointer', color: ORANGE }} title="Supprimer"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
