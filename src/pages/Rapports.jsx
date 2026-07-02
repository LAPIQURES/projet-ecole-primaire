import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getRapportsElevesAPI, deleteRapportEleveAPI, getRapportsEnseignantsAPI, deleteRapportEnseignantAPI } from '../services/api';
import { Trash2, RefreshCw, ShieldAlert, GraduationCap, Search } from 'lucide-react';

export default function Rapports() {
  const [eleveRapports, setEleveRapports] = useState([]);
  const [ensRapports, setEnsRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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
        <button onClick={load} style={{ padding: '10px 14px', borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

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
