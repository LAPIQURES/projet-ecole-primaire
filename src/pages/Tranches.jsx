import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getTranchesAPI, createTrancheAPI, updateTrancheAPI, deleteTrancheAPI, getTranchesParCycleAPI } from '../services/api';
import { Plus, Edit2, Trash2, RefreshCw, X, AlertCircle } from 'lucide-react';

const inp = { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1e293b', background: '#fff' };
const EMPTY = { libelle: '', montant: '', delai_mois: '', delai_jour: '', idScolarite: '' };

export default function Tranches() {
  const [tranches, setTranches] = useState([]);
  const [parCycle, setParCycle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, pcRes] = await Promise.all([getTranchesAPI(), getTranchesParCycleAPI()]);
      setTranches(Array.isArray(tRes.data) ? tRes.data : []);
      setParCycle(Array.isArray(pcRes.data) ? pcRes.data : []);
    } catch (err) { setError(err.response?.data?.error || err.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowForm(true); };
  const openEdit = (t) => { setForm({ libelle: t.libelle, montant: t.montant, delai_mois: t.delai_mois, delai_jour: t.delai_jour, idScolarite: t.idScolarite }); setEditing(t.idTranche); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.libelle || !form.idScolarite) { setError('Libelle et scolarité requis'); return; }
    setSaving(true); setError('');
    try {
      if (editing) {
        await updateTrancheAPI(editing, form);
      } else {
        await createTrancheAPI(form);
      }
      setShowForm(false);
      await load();
    } catch (err) { setError(err.response?.data?.error || err.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (!window.confirm('Supprimer la tranche ?')) return; try { await deleteTrancheAPI(id); await load(); } catch (err) { setError(err.message); } };

  return (
    <Layout title="Tranches de paiement" subtitle="Gérer les tranches par scolarité">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: '#64748b' }}>{tranches.length} tranche(s)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{ padding: '8px 12px', borderRadius:8, background:'#f1f5f9', border:'1px solid #e2e8f0' }}><RefreshCw size={14} /></button>
          <button onClick={openAdd} style={{ padding:'8px 14px', borderRadius:8, background:'#2563eb', color:'#fff', border:'none' }}><Plus size={14} /> Nouvelle tranche</button>
        </div>
      </div>

      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(2,6,23,0.5)', zIndex:120, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', padding:20, borderRadius:12, width:'100%', maxWidth:520 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontWeight:800 }}>{editing ? 'Modifier la tranche' : 'Nouvelle tranche'}</div>
              <button onClick={()=>setShowForm(false)} style={{ background:'#f1f5f9', border:'none', padding:8, borderRadius:8 }}><X size={16} /></button>
            </div>
            {error && <div style={{marginBottom:8,color:'#dc2626'}}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display:'grid', gap:10 }}>
              <div>
                <label style={{fontSize:12}}>Libellé</label>
                <input value={form.libelle} onChange={e=>setForm({...form, libelle:e.target.value})} style={inp} />
              </div>
              <div>
                <label style={{fontSize:12}}>Montant</label>
                <input type="number" value={form.montant} onChange={e=>setForm({...form, montant:e.target.value})} style={inp} />
              </div>
              <div style={{display:'flex', gap:8}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:12}}>Delai mois</label>
                  <input value={form.delai_mois} onChange={e=>setForm({...form, delai_mois:e.target.value})} style={inp} />
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:12}}>Delai jour</label>
                  <input value={form.delai_jour} onChange={e=>setForm({...form, delai_jour:e.target.value})} style={inp} />
                </div>
              </div>
              <div>
                <label style={{fontSize:12}}>Scolarité (id)</label>
                <input value={form.idScolarite} onChange={e=>setForm({...form, idScolarite:e.target.value})} style={inp} />
                <div style={{fontSize:12,color:'#94a3b8',marginTop:6}}>Pour associer la tranche, renseignez l'id de la scolarité (voir table Scolarite)</div>
              </div>
              <div style={{display:'flex', gap:8, marginTop:6}}>
                <button type="submit" disabled={saving} style={{flex:1, padding:10, background:'#2563eb', color:'#fff', border:'none', borderRadius:8}}>{saving ? '…' : 'Enregistrer'}</button>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:10, background:'#f1f5f9', border:'none', borderRadius:8}}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:12, padding:12, border:'1px solid #f1f5f9' }}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f8fafc'}}>
              {['ID','Libelle','Montant','Delai','Scolarite','Actions'].map(h=> (
                <th key={h} style={{padding:'10px 12px', textAlign:'left', fontSize:12, color:'#64748b'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tranches.length === 0 ? (
              <tr><td colSpan={6} style={{padding:30, color:'#94a3b8'}}>Aucune tranche</td></tr>
            ) : tranches.map(t => (
              <tr key={t.idTranche} style={{borderBottom:'1px solid #f8fafc'}}>
                <td style={{padding:'10px 12px'}}>{t.idTranche}</td>
                <td style={{padding:'10px 12px', fontWeight:700}}>{t.libelle}</td>
                <td style={{padding:'10px 12px'}}>{Number(t.montant).toLocaleString('fr-FR')}</td>
                <td style={{padding:'10px 12px'}}>{t.delai_mois || '-'} mois / {t.delai_jour || '-'}</td>
                <td style={{padding:'10px 12px'}}>{t.scolariteLibelle || t.idScolarite || '-'}</td>
                <td style={{padding:'10px 12px'}}>
                  <button onClick={()=>openEdit(t)} style={{background:'none',border:'none',color:'#2563eb',marginRight:8}}><Edit2 size={14} /></button>
                  <button onClick={()=>handleDelete(t.idTranche)} style={{background:'none',border:'none',color:'#dc2626'}}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{marginTop:12,color:'#94a3b8',fontSize:13}}>
        Affichage par cycle (extrait) :
        <pre style={{whiteSpace:'pre-wrap', marginTop:8, background:'#f8fafc', padding:10, borderRadius:8}}>{JSON.stringify(parCycle.slice(0,6),null,2)}</pre>
      </div>
    </Layout>
  );
}
