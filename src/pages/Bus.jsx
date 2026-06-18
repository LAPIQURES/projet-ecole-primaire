import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Bus, X, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { getBusAPI, getAbonnementsBusAPI, createBusAPI, updateBusAPI, createAbonnementBusAPI, updateAbonnementBusAPI, deleteAbonnementBusAPI, getElevesAPI } from '../services/api';

const inp = {
  padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit', color: '#1e293b', background: '#fff',
};

const EMPTY_BUS_FORM = { libelle: '', capacite: '', chauffeur: '', plaqueImmatriculation: '' };
const EMPTY_FORM = { matricule: '', idBus: '', tarif: '', dateDebut: '', dateFin: '' };

export default function BusManagement() {
  const [abonnements, setAbonnements] = useState([]);
  const [buses, setBuses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBusForm, setShowBusForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [busFormData, setBusFormData] = useState(EMPTY_BUS_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingBusId, setEditingBusId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [abRes, bRes, eRes] = await Promise.all([
        getAbonnementsBusAPI(),
        getBusAPI(),
        getElevesAPI()
      ]);
      setAbonnements(Array.isArray(abRes.data) ? abRes.data : []);
      setBuses(Array.isArray(bRes.data) ? bRes.data : []);
      setEleves(Array.isArray(eRes.data) ? eRes.data : []);
    } catch (err) {
      setError('Erreur de chargement');
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setError(''); setSuccess('');
    setShowForm(true);
  };

  const openAddBus = () => {
    setBusFormData(EMPTY_BUS_FORM);
    setEditingBusId(null);
    setError(''); setSuccess('');
    setShowBusForm(true);
  };

  const openEditBus = (bus) => {
    setBusFormData({
      libelle: bus.libelle || '',
      capacite: bus.capacite || '',
      chauffeur: bus.chauffeur || '',
      plaqueImmatriculation: bus.plaqueImmatriculation || '',
    });
    setEditingBusId(bus.idBus);
    setError(''); setSuccess('');
    setShowBusForm(true);
  };

  const openEdit = (ab) => {
    setFormData({
      matricule: ab.matricule || '',
      idBus: ab.idBus || '',
      tarif: ab.tarif || '',
      dateDebut: ab.dateDebut ? ab.dateDebut.split('T')[0] : '',
      dateFin: ab.dateFin ? ab.dateFin.split('T')[0] : '',
    });
    setEditingId(ab.idAbonnement);
    setError(''); setSuccess('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.matricule || !formData.idBus || !formData.tarif) {
      setError('Champs obligatoires : Élève, Bus, Tarif');
      return;
    }
    setSaving(true); setError('');
    try {
      if (editingId) {
        await updateAbonnementBusAPI(editingId, formData);
        setSuccess('Abonnement mis à jour !');
      } else {
        await createAbonnementBusAPI(formData);
        setSuccess('Abonnement créé !');
      }
      setShowForm(false);
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;
    try {
      await deleteAbonnementBusAPI(id);
      setSuccess('Abonnement supprimé');
      await loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleBusSubmit = async () => {
    if (!busFormData.libelle.trim()) {
      setError('Libellé du bus requis');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingBusId) {
        await updateBusAPI(editingBusId, busFormData);
        setSuccess('Bus mis à jour !');
      } else {
        await createBusAPI(busFormData);
        setSuccess('Bus créé !');
      }
      setShowBusForm(false);
      setBusFormData(EMPTY_BUS_FORM);
      setEditingBusId(null);
      await loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = abonnements.filter(ab =>
    `${ab.elevePrenom || ''} ${ab.eleveNom || ''}`.toLowerCase().includes(search.toLowerCase()) ||
    (ab.busLibelle || '').toLowerCase().includes(search.toLowerCase()) ||
    (ab.statut || '').toLowerCase().includes(search.toLowerCase())
  );

  const busesSorted = useMemo(() => {
    return [...buses].sort((a, b) => String(a.libelle || '').localeCompare(String(b.libelle || '')));
  }, [buses]);

  return (
    <Layout title="Bus Scolaire" subtitle={`${abonnements.length} abonnement(s) actif(s)`}>
      <style>{`input:focus,select:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}`}</style>

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, color: '#15803d', fontSize: 13, fontWeight: 600 }}>
          ✅ {success}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input type="text" placeholder="Rechercher un élève ou un bus…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 36 }} />
          </div>
          <button onClick={loadAll} style={{ padding: '9px 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={openAddBus} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(15,23,42,0.15)', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Nouveau bus
          </button>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(37,99,235,0.25)', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Nouvel abonnement
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Bus enregistrés</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{buses.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Abonnements actifs</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{abonnements.filter((ab) => ab.statut === 'ACTIF').length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Élèves abonnés</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{new Set(abonnements.map((ab) => ab.matricule)).size}</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#0f172a' }}>Flotte bus</div>
        {busesSorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 28, color: '#94a3b8', fontSize: 13 }}>Aucun bus trouvé</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['ID', 'Libellé', 'Capacité', 'Chauffeur', 'Plaque', 'Admin', 'Créé le', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {busesSorted.map((bus) => (
                  <tr key={bus.idBus} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>#{bus.idBus}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{bus.libelle || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{bus.capacite ?? '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{bus.chauffeur || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{bus.plaqueImmatriculation || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>#{bus.idAdmin || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{bus.created_at ? new Date(bus.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <button onClick={() => openEditBus(bus)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}><Edit2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showBusForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{editingBusId ? 'Modifier bus' : 'Nouveau bus'}</div>
              <button onClick={() => setShowBusForm(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Libellé *</label>
                <input value={busFormData.libelle} onChange={(e) => setBusFormData({ ...busFormData, libelle: e.target.value })} style={inp} placeholder="Bus Route A" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Capacité</label>
                <input type="number" value={busFormData.capacite} onChange={(e) => setBusFormData({ ...busFormData, capacite: e.target.value })} style={inp} placeholder="50" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Chauffeur</label>
                <input value={busFormData.chauffeur} onChange={(e) => setBusFormData({ ...busFormData, chauffeur: e.target.value })} style={inp} placeholder="Nom du chauffeur" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Plaque immatriculation</label>
                <input value={busFormData.plaqueImmatriculation} onChange={(e) => setBusFormData({ ...busFormData, plaqueImmatriculation: e.target.value })} style={inp} placeholder="ABC-123-XYZ" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={handleBusSubmit} disabled={saving} style={{ flex: 1, padding: '11px', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 9, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700 }}>
                {saving ? 'Enregistrement…' : (editingBusId ? 'Mettre à jour' : 'Créer bus')}
              </button>
              <button onClick={() => setShowBusForm(false)} style={{ padding: '11px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{editingId ? 'Modifier abonnement' : 'Nouvel abonnement'}</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Élève *</label>
                <select value={formData.matricule} onChange={e => setFormData({ ...formData, matricule: e.target.value })} style={inp}>
                  <option value="">-- Sélectionner un élève --</option>
                  {eleves.map(e => (
                    <option key={e.matricule} value={e.matricule}>{e.prenom} {e.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Bus *</label>
                <select value={formData.idBus} onChange={e => setFormData({ ...formData, idBus: e.target.value })} style={inp}>
                  <option value="">-- Sélectionner un bus --</option>
                  {buses.map(b => (
                    <option key={b.idBus} value={b.idBus}>{b.libelle} ({b.plaqueImmatriculation})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Tarif mensuel (F) *</label>
                <input type="number" placeholder="25000" value={formData.tarif}
                  onChange={e => setFormData({ ...formData, tarif: e.target.value })} style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Début</label>
                  <input type="date" value={formData.dateDebut}
                    onChange={e => setFormData({ ...formData, dateDebut: e.target.value })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Fin</label>
                  <input type="date" value={formData.dateFin}
                    onChange={e => setFormData({ ...formData, dateFin: e.target.value })} style={inp} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: '11px', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 9, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700 }}>
                {saving ? 'Enregistrement…' : (editingId ? 'Mettre à jour' : 'Créer abonnement')}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '11px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', fontSize: 13 }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', fontSize: 13 }}>Aucun abonnement trouvé</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Élève</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Bus</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Tarif</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Période</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Statut</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ab => (
                <tr key={ab.idAbonnement} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#1e293b', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Bus size={16} color="#2563eb" />
                      {ab.elevePrenom} {ab.eleveNom}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{ab.busLibelle}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>{ab.tarif?.toLocaleString()} F</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>
                    {ab.dateDebut ? new Date(ab.dateDebut).toLocaleDateString('fr-FR') : '-'} à {ab.dateFin ? new Date(ab.dateFin).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12 }}>
                    <span style={{ display: 'inline-block', padding: '4px 10px', background: ab.statut === 'ACTIF' ? '#dcfce7' : '#fef2f2', color: ab.statut === 'ACTIF' ? '#15803d' : '#dc2626', borderRadius: 4, fontWeight: 600 }}>
                      {ab.statut === 'ACTIF' ? '🟢 Actif' : '🔴 Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13 }}>
                    <button onClick={() => openEdit(ab)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', marginRight: 12 }}><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(ab.idAbonnement)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
