import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const Personnel = () => {
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [form, setForm] = useState({ idPers: '', idPoste: '', idFonction: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [pRes, fRes, perRes] = await Promise.all([
        fetch('/api/postes'),
        fetch('/api/fonctions'),
        fetch('/api/personnel', { headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {} })
      ]);
      const postesData = await pRes.json();
      const fonctionsData = await fRes.json();
      const personnelData = perRes.ok ? await perRes.json() : [];
      setPostes(postesData || []);
      setFonctions(fonctionsData || []);
      setPersonnel(personnelData || []);
    } catch (err) { console.error(err); setError('Erreur chargement'); }
  };

  const handleCreate = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setSuccess('Personnel ajouté');
      setTimeout(()=>setSuccess(''),3000);
      loadAll();
    } catch (err) { console.error(err); setError('Erreur création'); }
  };

  return (
    <Layout title="Gestion du Personnel">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2>Gestion du Personnel</h2>
        {error && <div style={{color:'red'}}>{error}</div>}
        {success && <div style={{color:'green'}}>{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h3>Créer/Assigner</h3>
            <div>
              <label>idPers (Personne)</label>
              <input value={form.idPers} onChange={e=>setForm({...form,idPers:e.target.value})} />
            </div>
            <div>
              <label>Poste</label>
              <select value={form.idPoste} onChange={e=>setForm({...form,idPoste:e.target.value})}>
                <option value="">--</option>
                {postes.map(p=> <option key={p.idPoste} value={p.idPoste}>{p.libelle}</option>)}
              </select>
            </div>
            <div>
              <label>Fonction</label>
              <select value={form.idFonction} onChange={e=>setForm({...form,idFonction:e.target.value})}>
                <option value="">--</option>
                {fonctions.map(f=> <option key={f.idFonction} value={f.idFonction}>{f.libelle}</option>)}
              </select>
            </div>
            <button onClick={handleCreate}>Créer / Assigner</button>
          </div>

          <div>
            <h3>Postes</h3>
            <ul>
              {postes.map(p => <li key={p.idPoste}>{p.libelle}</li>)}
            </ul>

            <h3>Fonctions</h3>
            <ul>
              {fonctions.map(f => <li key={f.idFonction}>{f.libelle}</li>)}
            </ul>
          </div>
        </div>

        <div>
          <h3>Liste Personnel</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th>id</th><th>Personne</th><th>Poste</th><th>Fonction</th><th>Actif</th></tr></thead>
            <tbody>
              {personnel.map(per => (
                <tr key={per.idPersonnel}><td>{per.idPersonnel}</td><td>{per.nom} {per.prenom}</td><td>{per.poste}</td><td>{per.fonction}</td><td>{per.actif}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Personnel;
