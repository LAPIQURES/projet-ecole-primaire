import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Building2, X, RefreshCw, AlertCircle, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSallesAPI, createSalleAPI, updateSalleAPI, deleteSalleAPI, getClassesAPI } from '../services/api';

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

const EMPTY_FORM = { libelle: '', idClasse: '', capacite: '', position: '', surface: '', actif: 1 };

export default function Salles() {
  const [salles, setSalles] = useState([]);
  const [classes, setClasses] = useState([]);
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
      const [sRes, cRes] = await Promise.all([getSallesAPI(), getClassesAPI()]);
      setSalles(Array.isArray(sRes.data) ? sRes.data : []);
      setClasses(Array.isArray(cRes.data) ? cRes.data : []);
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

  const openEdit = (salle) => {
    setFormData({
      libelle: salle.libelle || '',
      idClasse: salle.idClasse || '',
      capacite: salle.capacite ?? '',
      position: salle.position || '',
      surface: salle.surface ?? '',
      actif: salle.actif === 0 ? 0 : 1,
    });
    setEditingId(salle.idSalle);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!formData.libelle.trim()) {
      setError('Le libellé est obligatoire');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        libelle: formData.libelle,
        capacite: formData.capacite === '' ? null : Number(formData.capacite),
        idClasse: formData.idClasse || null,
        position: formData.position || '',
        surface: formData.surface === '' ? null : Number(formData.surface),
        actif: formData.actif === 0 ? 0 : 1,
      };

      if (editingId) {
        await updateSalleAPI(editingId, payload);
        setSuccess('Salle mise à jour !');
      } else {
        await createSalleAPI(payload);
        setSuccess('Salle créée !');
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    try {
      await deleteSalleAPI(id);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  };

  const filtered = useMemo(() => {
    return salles.filter((s) => {
      const txt = `${s.idSalle || ''} ${s.libelle || ''} ${s.capacite || ''} ${s.position || ''} ${s.surface || ''} ${s.classe || ''} ${s.actif ?? ''} ${s.idAdmin ?? ''}`.toLowerCase();
      return txt.includes(search.toLowerCase());
    });
  }, [salles, search]);

  return (
    <Layout title="Salles" subtitle="Gestion des salles">
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

      {error && !showForm && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher une salle…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 38 }} />
          </div>

          <button
            onClick={loadAll}
            style={{ padding: '10px 14px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 900 }}
            title="Actualiser"
          >
            <RefreshCw size={16} /> Actualiser
          </button>

          <button
            onClick={() => navigate('/classes')}
            style={{ padding: '10px 14px', borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa', cursor: 'pointer', color: ORANGE, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 950 }}
          >
            <School size={16} /> Classes
          </button>
        </div>

        <button
          onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 950, boxShadow: '0 12px 26px rgba(0,98,255,0.18)', whiteSpace: 'nowrap' }}
        >
          <Plus size={16} /> Nouvelle salle
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 18 }}>
        <div className="card" style={{ padding: 18, transition: 'box-shadow 180ms ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #0062ff, #ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>Gestion des salles</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{salles.length} salle(s) au total</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            Thème unifié: bleu <span style={{ fontWeight: 900, color: BLUE }}>#0062ff</span> et orange <span style={{ fontWeight: 900, color: ORANGE }}>#ffa000</span>.
          </div>
        </div>

        <div className="card" style={{ padding: 18, transition: 'box-shadow 180ms ease' }}>
          <div style={{ fontSize: 13, fontWeight: 950, color: '#0f172a', marginBottom: 8 }}>Champs affichés</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['ID', 'Libellé', 'Capacité', 'Classe', 'Position', 'Surface', 'Statut', 'Créée le'].map((t) => (
              <span key={t} style={{ padding: '6px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569', fontSize: 12, border: '1px solid #e2e8f0' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 26, width: '100%', maxWidth: 560, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950, color: '#0f172a' }}>{editingId ? 'Modifier la salle' : 'Nouvelle salle'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Libellé, capacité, classe, position, surface, actif</div>
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
                <input type="text" placeholder="Ex: Salle 101" value={formData.libelle} onChange={(e) => setFormData({ ...formData, libelle: e.target.value })} style={inp} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Capacité</label>
                  <input type="number" min={0} placeholder="Ex: 30" value={formData.capacite} onChange={(e) => setFormData({ ...formData, capacite: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Classe</label>
                  <select value={formData.idClasse} onChange={(e) => setFormData({ ...formData, idClasse: e.target.value })} style={inp}>
                    <option value="">-- Aucune classe --</option>
                    {classes.map((c) => (
                      <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Position</label>
                  <input type="text" placeholder="Ex: Étage 1, aile A" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Surface</label>
                  <input type="number" min={0} placeholder="Ex: 50" value={formData.surface} onChange={(e) => setFormData({ ...formData, surface: e.target.value })} style={inp} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: '#475569', display: 'block', marginBottom: 6 }}>Statut</label>
                <select value={formData.actif} onChange={(e) => setFormData({ ...formData, actif: Number(e.target.value) })} style={inp}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#93c5fd' : BLUE, color: '#fff', border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 950, boxShadow: '0 12px 26px rgba(0,98,255,0.18)' }}>
                  {saving ? 'Enregistrement…' : (editingId ? 'Mettre à jour' : 'Créer')}
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
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 52, color: '#94a3b8', fontSize: 13 }}>Aucune salle trouvée</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['ID', 'Libellé', 'Capacité', 'Classe', 'Position', 'Surface', 'Statut', 'Créée le', 'Admin', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 11, fontWeight: 950, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((salle, idx) => {
                  const active = salle.actif !== 0;
                  const createdAt = salle.created_at ? new Date(salle.created_at).toLocaleDateString('fr-FR') : '—';
                  return (
                    <tr key={salle.idSalle} className="row" style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fcfdff', opacity: active ? 1 : 0.6 }}>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>#{salle.idSalle}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 950 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 10, background: 'linear-gradient(135deg, #0062ff, #ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Building2 size={14} />
                          </div>
                          {salle.libelle}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: BLUE, fontWeight: 950 }}>{salle.capacite ?? '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{salle.classe || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{salle.position || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{salle.surface ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, padding: '4px 9px', borderRadius: 999, background: active ? '#dcfce7' : '#fee2e2', color: active ? '#15803d' : '#dc2626', fontWeight: 800 }}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{createdAt}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>#{salle.idAdmin || '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button onClick={() => openEdit(salle)} style={{ padding: 8, background: '#eff6ff', border: 'none', borderRadius: 10, cursor: 'pointer', color: BLUE, marginRight: 8 }} title="Modifier"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(salle.idSalle)} style={{ padding: 8, background: '#fff7ed', border: 'none', borderRadius: 10, cursor: 'pointer', color: ORANGE }} title="Supprimer"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
