import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getRapportsElevesAPI, deleteRapportEleveAPI, getRapportsEnseignantsAPI, deleteRapportEnseignantAPI, createRapportEleveAPI, createRapportEnseignantAPI } from '../services/api';
import { Trash2, RefreshCw, ShieldAlert, GraduationCap, Search, Plus, X } from 'lucide-react';

export default function Rapports() {
  const [eleveRapports, setEleveRapports] = useState([]);
  const [ensRapports, setEnsRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('eleve');
  const [formData, setFormData] = useState({ 
    libelle: '', matricule: '', annee: '2024-2025', points: '', commentaire: '', event_date: new Date().toISOString().split('T')[0],
    reference: '', categorie: '', idEnseignant: '', titre: '', details: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [eRes, rRes] = await Promise.all([getRapportsElevesAPI(), getRapportsEnseignantsAPI()]);
      setEleveRapports(Array.isArray(eRes.data) ? eRes.data : []);
      setEnsRapports(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (err) { setError(err.response?.data?.error || err.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  const delEleve = async (id) => { if (!window.confirm('Supprimer ce rapport élève ?')) return; try { await deleteRapportEleveAPI(id); await load(); } catch (err) { setError(err.message); } };
  const delEns = async (id) => { if (!window.confirm('Supprimer ce rapport enseignant ?')) return; try { await deleteRapportEnseignantAPI(id); await load(); } catch (err) { setError(err.message); } };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formType === 'eleve') {
        if (!formData.matricule || !formData.libelle) throw new Error('Matricule et libellé obligatoires.');
        await createRapportEleveAPI({
          libelle: formData.libelle, matricule: formData.matricule, annee: formData.annee,
          points: formData.points || 0, commentaire: formData.commentaire, event_date: formData.event_date
        });
      } else {
        if (!formData.idEnseignant || !formData.titre) throw new Error('ID Enseignant et titre obligatoires.');
        await createRapportEnseignantAPI(formData.idEnseignant, {
          reference: formData.reference, categorie: formData.categorie, titre: formData.titre, details: formData.details
        });
      }
      setShowForm(false);
      setFormData({ libelle: '', matricule: '', annee: '2024-2025', points: '', commentaire: '', event_date: new Date().toISOString().split('T')[0], reference: '', categorie: '', idEnseignant: '', titre: '', details: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const elevesFiltered = useMemo(() => {
    return eleveRapports.filter((r) => {
      const text = `${r.idRap || ''} ${r.libelle || ''} ${r.points ?? ''} ${r.matricule || ''} ${r.commentaire || ''} ${r.annee || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [eleveRapports, search]);

  const enseignantsFiltered = useMemo(() => {
    return ensRapports.filter((r) => {
      const text = `${r.id || ''} ${r.reference || ''} ${r.categorie || ''} ${r.idEnseignant || ''} ${r.titre || ''} ${r.details || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [ensRapports, search]);

  const totalPoints = eleveRapports.reduce((sum, rapport) => sum + (Number(rapport.points) || 0), 0);

  return (
    <Layout title="Rapports" subtitle="Incidents disciplinaires et retours pédagogiques">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Rapports élèves</div>
          <div style={{ fontSize: 24, fontWeight: 950, color: '#0f172a' }}>{eleveRapports.length}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Rapports enseignants</div>
          <div style={{ fontSize: 24, fontWeight: 950, color: '#0f172a' }}>{ensRapports.length}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Total points</div>
          <div style={{ fontSize: 24, fontWeight: 950, color: '#0f172a' }}>{totalPoints}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Filtré</div>
          <div style={{ fontSize: 24, fontWeight: 950, color: '#0f172a' }}>{elevesFiltered.length + enseignantsFiltered.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un rapport…" style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowForm(true)} style={{ padding: '10px 14px', borderRadius: 12, background: '#0062ff', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={14} /> Nouveau Rapport
          </button>
          <button onClick={load} style={{ padding: '10px 14px', borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Créer un rapport</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button type="button" onClick={() => setFormType('eleve')} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: formType === 'eleve' ? '#0062ff' : '#f1f5f9', color: formType === 'eleve' ? '#fff' : '#64748b', cursor: 'pointer', fontWeight: 600 }}>Élève</button>
              <button type="button" onClick={() => setFormType('enseignant')} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: formType === 'enseignant' ? '#0062ff' : '#f1f5f9', color: formType === 'enseignant' ? '#fff' : '#64748b', cursor: 'pointer', fontWeight: 600 }}>Enseignant</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formType === 'eleve' ? (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Matricule Élève *</label>
                    <input type="text" value={formData.matricule} onChange={e => setFormData({ ...formData, matricule: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Titre / Libellé *</label>
                    <input type="text" value={formData.libelle} onChange={e => setFormData({ ...formData, libelle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Points (Retrait)</label>
                      <input type="number" value={formData.points} onChange={e => setFormData({ ...formData, points: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Date</label>
                      <input type="date" value={formData.event_date} onChange={e => setFormData({ ...formData, event_date: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Commentaire</label>
                    <textarea value={formData.commentaire} onChange={e => setFormData({ ...formData, commentaire: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box', resize: 'vertical' }} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>ID Enseignant *</label>
                    <input type="number" value={formData.idEnseignant} onChange={e => setFormData({ ...formData, idEnseignant: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Catégorie</label>
                    <select value={formData.categorie} onChange={e => setFormData({ ...formData, categorie: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                      <option value="">-- Choisir --</option>
                      <option value="Absence">Absence</option>
                      <option value="Avertissement">Avertissement</option>
                      <option value="Félicitation">Félicitation</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Titre *</label>
                    <input type="text" value={formData.titre} onChange={e => setFormData({ ...formData, titre: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Détails</label>
                    <textarea value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', boxSizing: 'border-box', resize: 'vertical' }} />
                  </div>
                </>
              )}
              
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#93c5fd' : '#0062ff', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  {saving ? 'Enregistrement…' : 'Enregistrer le rapport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div style={{ color:'#dc2626', marginBottom:10 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        <div style={{ background:'#fff', padding:16, borderRadius:14, border:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{margin:0, display:'flex', alignItems:'center', gap:8}}><ShieldAlert size={18} /> Rapports élèves</h3>
            <div style={{ fontSize:12, color:'#64748b' }}>{elevesFiltered.length} visible(s)</div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['ID', 'Libellé', 'Points', 'Matricule', 'Année', 'Date', 'Commentaire', 'Actions'].map((h) => (
                    <th key={h} style={{ padding:'12px 10px', textAlign:'left', fontSize:11, fontWeight:900, color:'#64748b', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {elevesFiltered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding:18, color:'#94a3b8' }}>Aucun rapport élève</td></tr>
                ) : elevesFiltered.map((r) => (
                  <tr key={r.idRap} style={{ borderBottom:'1px solid #f8fafc' }}>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>#{r.idRap}</td>
                    <td style={{ padding:'12px 10px', fontWeight:800, color:'#0f172a' }}>{r.libelle || '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.points ?? '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.matricule || '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.annee || '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.event_date ? new Date(r.event_date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.commentaire || '—'}</td>
                    <td style={{ padding:'12px 10px' }}><button onClick={()=>delEleve(r.idRap)} style={{background:'none',border:'none',color:'#dc2626',cursor:'pointer'}}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background:'#fff', padding:16, borderRadius:14, border:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{margin:0, display:'flex', alignItems:'center', gap:8}}><GraduationCap size={18} /> Rapports enseignants</h3>
            <div style={{ fontSize:12, color:'#64748b' }}>{enseignantsFiltered.length} visible(s)</div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['ID', 'Référence', 'Catégorie', 'Enseignant', 'Titre', 'Date', 'Détails', 'Actions'].map((h) => (
                    <th key={h} style={{ padding:'12px 10px', textAlign:'left', fontSize:11, fontWeight:900, color:'#64748b', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enseignantsFiltered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding:18, color:'#94a3b8' }}>Aucun rapport enseignant</td></tr>
                ) : enseignantsFiltered.map((r) => (
                  <tr key={r.id} style={{ borderBottom:'1px solid #f8fafc' }}>
                    <td style={{ padding:'12px 10px', color:'#94a3b8' }}>#{r.id}</td>
                    <td style={{ padding:'12px 10px', fontWeight:800, color:'#0f172a' }}>{r.reference || '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.categorie || '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>#{r.idEnseignant || '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.titre || '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.created_at ? new Date(r.created_at).toLocaleString('fr-FR') : '—'}</td>
                    <td style={{ padding:'12px 10px', color:'#475569' }}>{r.details || '—'}</td>
                    <td style={{ padding:'12px 10px' }}><button onClick={()=>delEns(r.id)} style={{background:'none',border:'none',color:'#dc2626',cursor:'pointer'}}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
