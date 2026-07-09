import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getPersonnelAPI, createPersonnelAPI, updatePersonnelAPI, deletePersonnelAPI } from '../services/api';

const initialForm = { idPers: '', idPoste: '', idFonction: '', dateDebut: '', dateFin: '', actif: 1 };

const Personnel = () => {
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setError('');
      const [pRes, fRes, personnelRes] = await Promise.all([
        fetch('/api/postes'),
        fetch('/api/fonctions'),
        getPersonnelAPI(),
      ]);

      const postesData = await pRes.json();
      const fonctionsData = await fRes.json();

      setPostes(Array.isArray(postesData) ? postesData : []);
      setFonctions(Array.isArray(fonctionsData) ? fonctionsData : []);
      setPersonnel(Array.isArray(personnelRes.data) ? personnelRes.data : []);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données.');
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!form.idPers) {
      setError('Veuillez renseigner l’identifiant de la personne (idPers).');
      return;
    }

    try {
      setError('');
      const payload = {
        idPers: Number(form.idPers),
        idPoste: form.idPoste || null,
        idFonction: form.idFonction || null,
        dateDebut: form.dateDebut || null,
        dateFin: form.dateFin || null,
        actif: form.actif,
      };

      if (editingId) {
        await updatePersonnelAPI(editingId, payload);
        setSuccess('Fiche personnel mise à jour.');
      } else {
        await createPersonnelAPI(payload);
        setSuccess('Personnel ajouté.');
      }

      resetForm();
      await loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de l’enregistrement.');
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.idPersonnel);
    setForm({
      idPers: row.idPers || '',
      idPoste: row.idPoste || '',
      idFonction: row.idFonction || '',
      dateDebut: row.dateDebut ? row.dateDebut.split('T')[0] : '',
      dateFin: row.dateFin ? row.dateFin.split('T')[0] : '',
      actif: Number(row.actif) === 0 ? 0 : 1,
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce dossier personnel ?')) return;
    try {
      await deletePersonnelAPI(id);
      setSuccess('Personnel supprimé.');
      setTimeout(() => setSuccess(''), 3000);
      if (editingId === id) resetForm();
      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <Layout title="Gestion du Personnel" subtitle="Créer, modifier et supprimer les affectations du personnel">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 20 }}>
        {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: 14, borderRadius: 14 }}>{error}</div>}
        {success && <div style={{ color: '#14532d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: 14, borderRadius: 14 }}>{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 20, alignItems: 'start' }}>
          <div className="card" style={{ padding: 22, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 800 }}>Créer / modifier un dossier personnel</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>idPers (Personne)</label>
                  <input value={form.idPers} onChange={(e) => setForm({ ...form, idPers: e.target.value })} placeholder="Id de la personne" style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>Statut actif</label>
                  <select value={form.actif} onChange={(e) => setForm({ ...form, actif: Number(e.target.value) })} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <option value={1}>Actif</option>
                    <option value={0}>Inactif</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>Poste</label>
                  <select value={form.idPoste} onChange={(e) => setForm({ ...form, idPoste: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <option value="">-- Aucune sélection --</option>
                    {postes.map((p) => <option key={p.idPoste} value={p.idPoste}>{p.libelle}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>Fonction</label>
                  <select value={form.idFonction} onChange={(e) => setForm({ ...form, idFonction: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <option value="">-- Aucune sélection --</option>
                    {fonctions.map((f) => <option key={f.idFonction} value={f.idFonction}>{f.libelle}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>Date de début</label>
                  <input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#334155' }}>Date de fin</label>
                  <input type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" style={{ flex: 1, minWidth: 140, padding: '12px 18px', borderRadius: 14, border: 'none', background: '#0062ff', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {editingId ? 'Mettre à jour' : 'Créer le personnel'}
                </button>
                <button type="button" onClick={resetForm} style={{ flex: 1, minWidth: 140, padding: '12px 18px', borderRadius: 14, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer' }}>
                  Réinitialiser
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: 22, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800 }}>Références</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Postes</div>
              <ul style={{ paddingLeft: 18, color: '#475569', lineHeight: 1.8 }}>
                {postes.map((p) => <li key={p.idPoste}>{p.libelle}</li>)}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Fonctions</div>
              <ul style={{ paddingLeft: 18, color: '#475569', lineHeight: 1.8 }}>
                {fonctions.map((f) => <li key={f.idFonction}>{f.libelle}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22, minWidth: 0, overflowX: 'auto' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800 }}>Liste du personnel</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                {['ID', 'Personne', 'Poste', 'Fonction', 'Début', 'Fin', 'Statut', 'Actions'].map((label) => (
                  <th key={label} style={{ padding: '14px 12px', fontSize: 12, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personnel.map((item) => (
                <tr key={item.idPersonnel} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontSize: 13, color: '#334155' }}>{item.idPersonnel}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{item.nom || '—'} {item.prenom || ''}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#475569' }}>{item.poste || '—'}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#475569' }}>{item.fonction || '—'}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#475569' }}>{item.dateDebut ? item.dateDebut.split('T')[0] : '—'}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#475569' }}>{item.dateFin ? item.dateFin.split('T')[0] : '—'}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: item.actif === 1 ? '#0f766e' : '#b91c1c', fontWeight: 700 }}>{item.actif === 1 ? 'Actif' : 'Inactif'}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => handleEdit(item)} style={{ padding: '8px 12px', borderRadius: 12, border: 'none', background: '#eff6ff', color: '#0369a1', cursor: 'pointer' }}>Modifier</button>
                    <button type="button" onClick={() => handleDelete(item.idPersonnel)} style={{ padding: '8px 12px', borderRadius: 12, border: 'none', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {personnel.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 22, textAlign: 'center', color: '#64748b' }}>Aucun personnel enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Personnel;
