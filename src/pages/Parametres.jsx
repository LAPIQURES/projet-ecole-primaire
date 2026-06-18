import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Layout from '../components/Layout';
import { 
  getAnneesAPI, createAnneeAPI, updateAnneeAPI, deleteAnneeAPI,
  getTrimestresAPI, createTrimestresAPI, updateTrimestresAPI, deleteTrimestresAPI,
  getBusAPI, createBusAPI, getAbonnementsBusAPI, createAbonnementBusAPI, updateAbonnementBusAPI,
  getTranchesAPI, createTrancheAPI, updateTrancheAPI, deleteTrancheAPI,
  getElevesAPI
} from '../services/api';

const inp = {
  padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit', color: '#1e293b', background: '#fff',
};

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '10px 16px',
    background: active ? '#2563eb' : '#f1f5f9',
    color: active ? '#fff' : '#64748b',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    marginRight: 8,
    marginBottom: 8
  }}>
    {label}
  </button>
);

const MiniRangeCalendar = ({ startDate, endDate, onStartChange, onEndChange }) => {
  const today = new Date();
  const preview = startDate && endDate ? `${new Date(startDate).toLocaleDateString('fr-FR')} → ${new Date(endDate).toLocaleDateString('fr-FR')}` : 'Définissez une plage académique';

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 14, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>Plage académique</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{preview}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Début</label>
          <input type="date" value={startDate || ''} min={`${today.getFullYear() - 1}-01-01`} max={`${today.getFullYear() + 3}-12-31`} onChange={(e) => onStartChange(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Fin</label>
          <input type="date" value={endDate || ''} min={startDate || `${today.getFullYear()}-01-01`} max={`${today.getFullYear() + 4}-12-31`} onChange={(e) => onEndChange(e.target.value)} style={inp} />
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {['Aujourd’hui', 'Ce mois', 'Cette année'].map((label) => (
          <div key={label} style={{ padding: 10, borderRadius: 12, background: '#f8fafc', border: '1px solid #eef2f7', fontSize: 11, color: '#475569', fontWeight: 800, textAlign: 'center' }}>{label}</div>
        ))}
      </div>
    </div>
  );
};

export default function Parametres() {
  const [activeTab, setActiveTab] = useState('annees');
  const [annees, setAnnees] = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [buses, setBuses] = useState([]);
  const [abonnements, setAbonnements] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const yearRangeLabel = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${e.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [aRes, tRes, bRes, abRes, trRes, eRes] = await Promise.all([
        getAnneesAPI(), getTrimestresAPI(), getBusAPI(),
        getAbonnementsBusAPI(), getTranchesAPI(), getElevesAPI()
      ]);
      setAnnees(Array.isArray(aRes.data) ? aRes.data : []);
      setTrimestres(Array.isArray(tRes.data) ? tRes.data : []);
      setBuses(Array.isArray(bRes.data) ? bRes.data : []);
      setAbonnements(Array.isArray(abRes.data) ? abRes.data : []);
      setTranches(Array.isArray(trRes.data) ? trRes.data : []);
      setEleves(Array.isArray(eRes.data) ? eRes.data : []);
    } catch (err) {
      setError('Erreur de chargement');
    } finally { setLoading(false); }
  };

  const handleAddAnnee = async () => {
    if (!formData.libelle) { setError('Libelle requis'); return; }
    try {
      setSaving(true);
      const periode = formData.periode || yearRangeLabel(formData.dateDebut, formData.dateFin);
      const payload = { ...formData, periode };
      if (editingId) {
        await updateAnneeAPI(editingId, payload);
      } else {
        await createAnneeAPI(payload);
      }
      loadAll();
      setShowForm(false);
      setFormData({});
      setEditingId(null);
      setSuccess(editingId ? 'Année mise à jour !' : 'Année créée !');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSaving(false); }
  };

  const handleAddTrimestre = async () => {
    if (!formData.libelle || !formData.idAca) { setError('Champs obligatoires'); return; }
    try {
      setSaving(true);
      if (editingId) {
        await updateTrimestresAPI(editingId, formData);
      } else {
        await createTrimestresAPI(formData);
      }
      loadAll();
      setShowForm(false);
      setFormData({});
      setEditingId(null);
      setSuccess(editingId ? 'Trimestre mis à jour !' : 'Trimestre créé !');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSaving(false); }
  };

  const handleAddBus = async () => {
    if (!formData.libelle) { setError('Libelle requis'); return; }
    try {
      setSaving(true);
      await createBusAPI(formData);
      loadAll();
      setShowForm(false);
      setFormData({});
      setSuccess('Bus créé !');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSaving(false); }
  };

  const handleAddAbonnement = async () => {
    if (!formData.matricule || !formData.idBus) { setError('Champs obligatoires'); return; }
    try {
      setSaving(true);
      if (editingId) {
        await updateAbonnementBusAPI(editingId, formData);
      } else {
        await createAbonnementBusAPI(formData);
      }
      loadAll();
      setShowForm(false);
      setFormData({});
      setEditingId(null);
      setSuccess(editingId ? 'Abonnement mis à jour !' : 'Abonnement créé !');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    try {
      if (type === 'annee') await deleteAnneeAPI(id);
      else if (type === 'trimestre') await deleteTrimestresAPI(id);
      else if (type === 'tranche') await deleteTrancheAPI(id);
      loadAll();
    } catch (err) { setError(err.message); }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'annees':
        return (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Libelle *</label>
            <input type="text" placeholder="Ex: 2024-2025" value={formData.libelle || ''}
              onChange={e => setFormData({ ...formData, libelle: e.target.value })} style={inp} />
            <div style={{ marginTop: 12 }}>
              <MiniRangeCalendar
                startDate={formData.dateDebut || ''}
                endDate={formData.dateFin || ''}
                onStartChange={(value) => setFormData({ ...formData, dateDebut: value, periode: yearRangeLabel(value, formData.dateFin) })}
                onEndChange={(value) => setFormData({ ...formData, dateFin: value, periode: yearRangeLabel(formData.dateDebut, value) })}
              />
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Période générée</label>
            <input type="text" readOnly placeholder="Aperçu automatique" value={formData.periode || ''}
              style={{ ...inp, background: '#f8fafc', color: '#64748b' }} />
          </div>
        );
      case 'trimestres':
        return (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Libelle *</label>
            <input type="text" placeholder="Ex: 1er Trimestre" value={formData.libelle || ''}
              onChange={e => setFormData({ ...formData, libelle: e.target.value })} style={inp} />
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Année *</label>
            <select value={formData.idAca || ''} onChange={e => setFormData({ ...formData, idAca: e.target.value })} style={inp}>
              <option value="">-- Sélectionner --</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Période</label>
            <input type="text" placeholder="Septembre - Décembre" value={formData.periode || ''}
              onChange={e => setFormData({ ...formData, periode: e.target.value })} style={inp} />
          </div>
        );
      case 'bus':
        return (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Libelle Bus *</label>
            <input type="text" placeholder="Ex: Bus Route A" value={formData.libelle || ''}
              onChange={e => setFormData({ ...formData, libelle: e.target.value })} style={inp} />
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Capacité</label>
            <input type="number" placeholder="50" value={formData.capacite || ''}
              onChange={e => setFormData({ ...formData, capacite: e.target.value })} style={inp} />
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Chauffeur</label>
            <input type="text" placeholder="Nom du chauffeur" value={formData.chauffeur || ''}
              onChange={e => setFormData({ ...formData, chauffeur: e.target.value })} style={inp} />
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Plaque Immatriculation</label>
            <input type="text" placeholder="ABC-123-XYZ" value={formData.plaqueImmatriculation || ''}
              onChange={e => setFormData({ ...formData, plaqueImmatriculation: e.target.value })} style={inp} />
          </div>
        );
      case 'abonnements':
        return (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Élève *</label>
            <select value={formData.matricule || ''} onChange={e => setFormData({ ...formData, matricule: e.target.value })} style={inp}>
              <option value="">-- Sélectionner --</option>
              {eleves.map(e => (
                <option key={e.matricule} value={e.matricule}>{e.prenom} {e.nom}</option>
              ))}
            </select>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Bus *</label>
            <select value={formData.idBus || ''} onChange={e => setFormData({ ...formData, idBus: e.target.value })} style={inp}>
              <option value="">-- Sélectionner --</option>
              {buses.map(b => (
                <option key={b.idBus} value={b.idBus}>{b.libelle}</option>
              ))}
            </select>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Tarif</label>
            <input type="number" placeholder="25000" value={formData.tarif || ''}
              onChange={e => setFormData({ ...formData, tarif: e.target.value })} style={inp} />
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5, marginTop: 12 }}>Début</label>
            <input type="date" value={formData.dateDebut || ''}
              onChange={e => setFormData({ ...formData, dateDebut: e.target.value })} style={inp} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout title="Paramètres du Système" subtitle="Configuration académique et administrative">
      <style>{`input:focus,select:focus,textarea:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}`}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Années', value: annees.length },
          { label: 'Trimestres', value: trimestres.length },
          { label: 'Bus', value: buses.length },
          { label: 'Abonnements', value: abonnements.length },
        ].map((item) => (
          <div key={item.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, color: '#1d4ed8', fontSize: 13, fontWeight: 600 }}>
          Chargement des paramètres...
        </div>
      )}

      {success && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, color: '#15803d', fontSize: 13, fontWeight: 600 }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
          ❌ {error}
        </div>
      )}

      <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap', padding: 12, background: '#f8fafc', borderRadius: 10 }}>
        <Tab label="📅 Années" active={activeTab === 'annees'} onClick={() => { setActiveTab('annees'); setShowForm(false); }} />
        <Tab label="📆 Trimestres" active={activeTab === 'trimestres'} onClick={() => { setActiveTab('trimestres'); setShowForm(false); }} />
        <Tab label="🚌 Bus Scolaires" active={activeTab === 'bus'} onClick={() => { setActiveTab('bus'); setShowForm(false); }} />
        <Tab label="🎫 Abonnements" active={activeTab === 'abonnements'} onClick={() => { setActiveTab('abonnements'); setShowForm(false); }} />
        <Tab label="💰 Tranches Paiement" active={activeTab === 'tranches'} onClick={() => { setActiveTab('tranches'); setShowForm(false); }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
          {activeTab === 'annees' && '📅 Années Académiques'}
          {activeTab === 'trimestres' && '📆 Trimestres'}
          {activeTab === 'bus' && '🚌 Bus Scolaires'}
          {activeTab === 'abonnements' && '🎫 Abonnements Bus'}
          {activeTab === 'tranches' && '💰 Tranches de Paiement'}
        </div>
        {activeTab !== 'tranches' && (
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({}); setError(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <Plus size={16} /> Ajouter
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid #e2e8f0' }}>
          {renderForm()}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={
              activeTab === 'annees' ? handleAddAnnee :
              activeTab === 'trimestres' ? handleAddTrimestre :
              activeTab === 'bus' ? handleAddBus :
              activeTab === 'abonnements' ? handleAddAbonnement :
              null
            } disabled={saving} style={{ padding: '10px 20px', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* YEARS */}
      {activeTab === 'annees' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {annees.map(a => (
            <div key={a.idAnnee} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{a.libelle}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{a.periode}</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditingId(a.idAnnee); setFormData(a); setShowForm(true); }} style={{ flex: 1, padding: '8px', background: '#dbeafe', color: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Modifier</button>
                <button onClick={() => handleDelete(a.idAnnee, 'annee')} style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRIMESTRES */}
      {activeTab === 'trimestres' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {trimestres.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucun trimestre</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Libelle</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Année</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Période</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trimestres.map(t => (
                  <tr key={t.idTrimes} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{t.libelle}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{t.anneeLibelle}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{t.periode}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>
                      <button onClick={() => { setEditingId(t.idTrimes); setFormData(t); setShowForm(true); }} style={{ background: '#dbeafe', color: '#2563eb', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', marginRight: 8, fontSize: 11 }}>Modifier</button>
                      <button onClick={() => handleDelete(t.idTrimes, 'trimestre')} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* BUS */}
      {activeTab === 'bus' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {buses.map(b => (
            <div key={b.idBus} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>{b.libelle}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>📍 {b.plaqueImmatriculation}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>👤 {b.chauffeur}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>📦 Capacité: {b.capacite} places</div>
            </div>
          ))}
        </div>
      )}

      {/* ABONNEMENTS */}
      {activeTab === 'abonnements' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {abonnements.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucun abonnement</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Élève</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Bus</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Tarif</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {abonnements.map(ab => (
                  <tr key={ab.idAbonnement} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{ab.elevePrenom} {ab.eleveNom}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{ab.busLibelle}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{ab.tarif.toLocaleString()} F</td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: ab.statut === 'ACTIF' ? '#dcfce7' : '#fef2f2', color: ab.statut === 'ACTIF' ? '#15803d' : '#dc2626', borderRadius: 4 }}>
                        {ab.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TRANCHES - Read only display */}
      {activeTab === 'tranches' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {tranches.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucune tranche définie (gérée dans le module Paiements)</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Libelle</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Montant</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Délai</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#475569' }}>Scolarité</th>
                </tr>
              </thead>
              <tbody>
                {tranches.map(tr => (
                  <tr key={tr.idTranche} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{tr.libelle}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{tr.montant.toLocaleString()} F</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{tr.delai_mois}m {tr.delai_jour}j</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{tr.scolariteLibelle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Layout>
  );
}
