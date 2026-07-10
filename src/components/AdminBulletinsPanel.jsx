import React, { useEffect, useState } from 'react';
import { getClassesAPI, getSallesAPI, getAnneesAPI, getTrimestresAPI, generateClassBulletinsAPI } from '../services/api';

const AdminBulletinsPanel = () => {
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [trimestres, setTrimestres] = useState([]);

  const [mode, setMode] = useState('classe'); // 'classe' or 'salle'
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedSalle, setSelectedSalle] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes, aRes, tRes] = await Promise.all([getClassesAPI(), getSallesAPI(), getAnneesAPI(), getTrimestresAPI()]);
        setClasses(Array.isArray(cRes.data) ? cRes.data : []);
        setSalles(Array.isArray(sRes.data) ? sRes.data : []);
        setAnnees(Array.isArray(aRes.data) ? aRes.data : []);
        setTrimestres(Array.isArray(tRes.data) ? tRes.data : []);
        if (Array.isArray(aRes.data) && aRes.data[0]) setSelectedAnnee(aRes.data[0].idAnnee || aRes.data[0].id);
        if (Array.isArray(tRes.data) && tRes.data[0]) setSelectedTrimestre(tRes.data[0].idTrimes || tRes.data[0].id);
      } catch (err) {
        console.error('AdminBulletinsPanel load error', err);
      }
    })();
  }, []);

  const handleGenerate = async (preview = false) => {
    if (!selectedAnnee || !selectedTrimestre) {
      setMessage('Sélectionnez l\'année et le trimestre.');
      return;
    }

    const payload = {
      idAnnee: selectedAnnee,
      idTrimes: selectedTrimestre,
    };
    if (mode === 'classe') payload.idClasse = selectedClasse;
    else payload.idSalle = selectedSalle;

    setLoading(true);
    setMessage('');
    try {
      const res = await generateClassBulletinsAPI(payload);
      const html = res?.data || res;
      if (preview) {
        const url = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
        window.open(url, '_blank');
      } else {
        const url = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
        window.open(url, '_blank');
        setMessage('Le fichier HTML des bulletins a été ouvert dans un nouvel onglet.');
      }
    } catch (err) {
      console.error('generate error', err);
      const msg = err?.response?.data?.error || err.message || 'Erreur génération bulletins';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e6edf3' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>📋 Bulletins (Admin)</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" checked={mode === 'classe'} onChange={() => setMode('classe')} /> Classe
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" checked={mode === 'salle'} onChange={() => setMode('salle')} /> Salle
        </label>
      </div>

      {mode === 'classe' ? (
        <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)} style={{ width: '100%', padding: '8px 10px', marginBottom: 8 }}>
          <option value="">-- Choisir une classe --</option>
          {classes.map((c) => (
            <option key={c.idClasse || c.id} value={c.idClasse || c.id}>{c.libelle || c.nom || c.code}</option>
          ))}
        </select>
      ) : (
        <select value={selectedSalle} onChange={(e) => setSelectedSalle(e.target.value)} style={{ width: '100%', padding: '8px 10px', marginBottom: 8 }}>
          <option value="">-- Choisir une salle --</option>
          {salles.map((s) => (
            <option key={s.idSalle || s.id} value={s.idSalle || s.id}>{s.libelle || s.nom || s.code}</option>
          ))}
        </select>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <select value={selectedAnnee} onChange={(e) => setSelectedAnnee(e.target.value)} style={{ flex: 1, padding: '8px 10px' }}>
          <option value="">-- Année scolaire --</option>
          {annees.map(a => (<option key={a.idAnnee || a.id} value={a.idAnnee || a.id}>{a.libelle || a.nom}</option>))}
        </select>
        <select value={selectedTrimestre} onChange={(e) => setSelectedTrimestre(e.target.value)} style={{ width: 160, padding: '8px 10px' }}>
          <option value="">-- Trimestre --</option>
          {trimestres.map(t => (<option key={t.idTrimes || t.id} value={t.idTrimes || t.id}>{t.libelle || t.nom}</option>))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <button onClick={() => handleGenerate(false)} disabled={loading} style={{ padding: '8px 12px', background: '#0062ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>{loading ? 'Génération...' : 'Générer'}</button>
        <button onClick={() => handleGenerate(true)} disabled={loading} style={{ padding: '8px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>Aperçu</button>
        <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 13 }}>{message}</div>
      </div>
    </div>
  );
};

export default AdminBulletinsPanel;
