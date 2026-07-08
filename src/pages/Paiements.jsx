import React, { useState, useEffect } from 'react';
import { CreditCard, Search, RefreshCw, Plus, X, AlertCircle, FileText, BadgeDollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';
import { getPaiementByIdAPI } from '../services/api';

const API_URL = 'http://localhost:5000/api';
const inp = {
  padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit', color: '#1e293b', background: '#fff',
};

export default function Paiements({ noLayout = false }) {
  const [paiements, setPaiements] = useState([]);
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ matricule: '', montant: '', idMode: '', commentaire: '', datePaie: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadAll(); }, []);

  const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        axios.get(`${API_URL}/paiements`, auth()),
        axios.get(`${API_URL}/paiements/modes`, auth()).catch(() => ({ data: [] })),
      ]);
      setPaiements(Array.isArray(pRes.data) ? pRes.data : []);
      setModes(Array.isArray(mRes.data) ? mRes.data : []);
    } catch (err) {
      setError('Erreur chargement paiements');
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.matricule || !formData.montant) { setError('Matricule et montant requis'); return; }
    setSaving(true); setError('');
    try {
      await axios.post(`${API_URL}/paiements`, formData, auth());
      setSuccess('Paiement enregistré !');
      setShowForm(false);
      loadAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSaving(false); }
  };

  const filtered = paiements.filter(p =>
    `${p.matricule} ${p.nom || ''} ${p.prenom || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openDetails = async (p) => {
    setSelected({ ...p, _loading: true });
    try {
      const res = await getPaiementByIdAPI(p.idPaie);
      setSelected(res.data || p);
    } catch {
      setSelected(p);
    }
  };

  const totalMois = paiements
    .filter(p => { const d = new Date(p.datePaie); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((sum, p) => sum + Number(p.montant || 0), 0);

  const paymentContent = () => (
    <>
      <style>{`input:focus,select:focus,textarea:focus{border-color:#16a34a!important;box-shadow:0 0 0 3px rgba(22,163,74,0.1)}`}</style>

      {success && <div style={{ marginBottom: 16, padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, color: '#15803d', fontSize: 13, fontWeight: 600 }}>✅ {success}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total ce mois', value: totalMois.toLocaleString('fr-FR') + ' FCFA', color: '#16a34a' },
          { label: 'Nb paiements', value: paiements.length, color: '#0891b2' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
          <input placeholder="Matricule ou nom…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadAll} style={{ padding: '9px 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><RefreshCw size={14} /></button>
          <button onClick={() => { setFormData({ matricule: '', montant: '', idMode: '', commentaire: '', datePaie: new Date().toISOString().split('T')[0] }); setError(''); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
            <Plus size={16} /> Enregistrer un paiement
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Nouveau paiement</div>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={16} /></button>
            </div>
            {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 13 }}><AlertCircle size={14} style={{ marginRight: 6 }} />{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Matricule élève *', key: 'matricule', type: 'number', ph: 'Ex: 12345' },
                { label: 'Montant (FCFA) *', key: 'montant', type: 'number', ph: 'Ex: 50000' },
                { label: 'Date de paiement', key: 'datePaie', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Mode de paiement</label>
                <select value={formData.idMode} onChange={e => setFormData({ ...formData, idMode: e.target.value })} style={inp}>
                  <option value="">-- Choisir --</option>
                  {modes.map(m => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Commentaire</label>
                <textarea value={formData.commentaire} onChange={e => setFormData({ ...formData, commentaire: e.target.value })} rows={2}
                  style={{ ...inp, resize: 'vertical' }} placeholder="Tranche 1, inscription…" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: '11px', background: saving ? '#86efac' : '#16a34a', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                {saving ? 'Enregistrement…' : 'Valider le paiement'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '11px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
                  {['ID', 'Élève', 'Montant', 'Date', 'Mode', 'Commentaire'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    <CreditCard size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                    <div>Aucun paiement trouvé</div>
                  </td></tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.idPaie || i} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }} onClick={() => openDetails(p)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>#{p.idPaie}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                      {p.prenom ? `${p.prenom} ${p.nom}` : `Matr. ${p.matricule}`}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
                      {Number(p.montant).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                      {p.datePaie ? new Date(p.datePaie).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569' }}>{p.mode || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>{p.commentaire || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8', background: '#fafbff' }}>
              {filtered.length} paiement(s) affiché(s)
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div style={{ width: '100%', maxWidth: 860, background: '#fff', borderRadius: 18, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(0,98,255,0.10), rgba(255,160,0,0.10))', borderBottom: '1px solid #eef2f7' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>Détails paiement</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Traçabilité du payeur · tranche imputée · reçu</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 36, height: 36, borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 14, border: '1px solid #eef2f7', background: '#f8fafc' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Élève</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{selected.elevePrenom || selected.prenom || '—'} {selected.eleveNom || selected.nom || ''}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{selected.eleveMatricule || selected.matricule || '—'} · {selected.eleveClasse || '—'} · {selected.eleveSalle || '—'}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, border: '1px solid #eef2f7', background: '#f8fafc' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Payé par</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{selected.payeurPrenom || ''} {selected.payeurNom || ''}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{selected.payeurType || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 14, border: '1px solid #eef2f7', background: '#fff' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Montant</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a' }}>{Number(selected.montant || 0).toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, border: '1px solid #eef2f7', background: '#fff' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Imputation</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{selected.allocation?.statut || '—'}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{selected.allocation?.tranche || '—'} · Reste: {Number(selected.allocation?.resteARegler || 0).toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, border: '1px solid #eef2f7', background: '#f8fafc' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Mode / opération</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{selected.mode || '—'}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{selected.operationID || 'Aucune opération'} · {selected.datePaie ? new Date(selected.datePaie).toLocaleDateString('fr-FR') : '—'}</div>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', padding: 12, borderRadius: 14, border: '1px solid #eef2f7', background: '#f8fafc' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Commentaire</div>
                <div style={{ fontSize: 13, color: '#0f172a', marginTop: 6 }}>{selected.commentaire || '—'}</div>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' }}><FileText size={14} /> Reçu PDF</button>
                <button style={{ padding: '10px 14px', borderRadius: 12, border: 'none', background: '#0062ff', color: '#fff', cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' }}><BadgeDollarSign size={14} /> Valider</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (noLayout) {
    return paymentContent();
  }

  return (
    <Layout title="Paiements" subtitle="Gestion des paiements scolaires">
      {paymentContent()}
    </Layout>
  );
}
