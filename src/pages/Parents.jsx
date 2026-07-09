import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { Users, Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { getParentsAPI, getParentByIdAPI, createParentAPI, updateParentAPI, deleteParentAPI, deactivateParentAPI, reactivateParentAPI } from '../services/api';


const s = {
  page: { background: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", padding: '28px' },
  card: { background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' },
  btn: (color) => ({ padding: '10px 20px', background: color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }),
  inp: { width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' },
  label: { fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' },
};

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

// Composant recherche élève avec autocomplete
function EleveSearch({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const timer = useRef(null);

  const search = async (q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`/api/parents/search?q=${q}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setResults(data || []);
      setShow(true);
    } catch (e) { setResults([]); }
  };

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    setSelectedLabel('');
    onChange('');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 300);
  };

  const select = (el) => {
    setSelectedLabel(`${el.prenom} ${el.nom} ${el.salle ? '— ' + el.salle : ''}`);
    setQuery('');
    onChange(el.matricule);
    setShow(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Enfant (Élève)</label>
      {selectedLabel ? (
        <div style={{ padding: '10px 12px', border: '1.5px solid #10b981', borderRadius: '8px', fontSize: '14px', color: '#1e293b', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedLabel}
          <button onClick={() => { setSelectedLabel(''); onChange(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={14} /></button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Rechercher un élève par nom, prénom..."
            value={query}
            onChange={handleInput}
            onFocus={() => query.length >= 2 && setShow(true)}
            onBlur={() => setTimeout(() => setShow(false), 200)}
          />
        </div>
      )}
      {show && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200, maxHeight: '200px', overflowY: 'auto' }}>
          {results.map(el => (
            <div key={el.matricule} onClick={() => select(el)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{el.prenom} {el.nom}</span>
              {el.salle && <span style={{ color: '#94a3b8', marginLeft: '8px' }}>— {el.salle}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Parents() {
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', mobile: '', phone: '', password: '', matricules: [], isUser: true, username: '', numChildren: 1 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const res = await getParentsAPI(); setParents(res.data || []); }
    catch (e) { setError('Erreur: ' + (e.response?.data?.error || e.message)); }
    finally { setLoading(false); }
  };

  const openDetails = async (p) => {
    setSelectedParent({ ...p, _loading: true });
    try {
      const res = await getParentByIdAPI(p.idParent);
      setSelectedParent(res.data || p);
    } catch {
      setSelectedParent(p);
    }
  };

  const openAdd = () => { setEditing(null); setForm({ nom: '', prenom: '', mobile: '', phone: '', password: '', matricules: [], isUser: true, username: '', numChildren: 1 }); setError(''); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ nom: p.nom, prenom: p.prenom, mobile: p.mobile || '', phone: p.phone || '', password: '', matricules: (p.children || []).map(c => c.matricule), isUser: !!p.username, username: p.username || '', numChildren: (p.children || []).length || 1 }); setError(''); setShowModal(true); };

  const toggleActive = async (p) => {
    try {
      if (Number(p.actif) === 1) await deactivateParentAPI(p.idParent);
      else await reactivateParentAPI(p.idParent);
      setSuccess(Number(p.actif) === 1 ? 'Parent désactivé' : 'Parent réactivé');
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors du changement de statut');
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom) { setError('Nom et prénom requis'); return; }
    if (!form.matricules || form.matricules.length === 0) { setError('Veuillez sélectionner au moins un élève'); return; }
    if ((form.matricules || []).length !== Number(form.numChildren || 1)) { setError(`Veuillez sélectionner exactement ${form.numChildren} enfant(s)`); return; }
    if (form.isUser && !editing && !form.password) { setError('Mot de passe requis pour un nouveau parent utilisateur'); return; }
    setError('');
    try {
      let res;
      if (editing) { res = await updateParentAPI(editing.idParent, form); setSuccess('Parent modifié !'); }
      else { res = await createParentAPI(form); setSuccess('Parent créé !'); }
      // If backend returned login info, show it briefly
      if (res && res.data && res.data.loginInfo) {
        const li = res.data.loginInfo;
        setSuccess(`Parent créé ! Identifiant: ${li.username} / Mot de passe: ${li.password}`);
      }
      setShowModal(false); load(); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.error || 'Erreur lors de l\'enregistrement'); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Supprimer le parent ${p.prenom} ${p.nom} ?`)) return;
    try { await deleteParentAPI(p.idParent); setSuccess('Parent supprimé'); load(); setTimeout(() => setSuccess(''), 3000); }
    catch (e) { setError(e.response?.data?.error || 'Erreur'); }
  };

  const filtered = parents.filter(p => `${p.nom} ${p.prenom} ${p.eleveNom || ''} ${p.elevePrenom || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title="Parents" subtitle="Gestion des parents">
      <div style={s.page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Parents</h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>{parents.length} parent(s) enregistré(s)</p>
          </div>
          <button onClick={openAdd} style={s.btn('#10b981')}><Plus size={16} /> Nouveau parent</button>
        </div>

      {success && <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', color: '#15803d', fontSize: '14px' }}><CheckCircle size={16} />{success}</div>}
      {error && !showModal && <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}

      <div style={{ ...s.card, padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Search size={18} color="#94a3b8" />
        <input style={{ ...s.inp, border: 'none', padding: '0' }} placeholder="Rechercher par nom, prénom ou enfant..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={s.card}>
        {loading ? <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Chargement...</div> : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}><Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>Aucun parent trouvé</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['Parent', 'Téléphone', 'Enfant', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.idParent} onClick={() => openDetails(p)} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? 'white' : '#fafafa', cursor: 'pointer' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>
                        {p.prenom?.[0]}{p.nom?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{p.prenom} {p.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{p.mobile || p.phone || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{p.elevePrenom || '—'} {p.eleveNom || ''}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: Number(p.actif) === 1 ? '#dcfce7' : '#fee2e2', color: Number(p.actif) === 1 ? '#15803d' : '#dc2626', fontWeight: 700 }}>
                      {Number(p.actif) === 1 ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(p)} style={{ padding: '6px', background: '#f0fdf4', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }}><Edit2 size={14} /></button>
                      <button onClick={() => toggleActive(p)} style={{ padding: '6px', background: Number(p.actif) === 1 ? '#fff7ed' : '#f0fdf4', border: 'none', borderRadius: '6px', cursor: 'pointer', color: Number(p.actif) === 1 ? '#f59e0b' : '#16a34a' }} title={Number(p.actif) === 1 ? 'Désactiver' : 'Réactiver'}>{Number(p.actif) === 1 ? <AlertCircle size={14} /> : <CheckCircle size={14} />}</button>
                      <button onClick={() => handleDelete(p)} style={{ padding: '6px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedParent && (
        <Modal title="Détails du parent" onClose={() => setSelectedParent(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #eef2f7' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Parent</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{selectedParent.prenom} {selectedParent.nom}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedParent.mobile || selectedParent.phone || '—'}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #eef2f7' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Enfant principal</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{selectedParent.elevePrenom || '—'} {selectedParent.eleveNom || ''}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedParent.eleveMatricule || selectedParent.matricule || '—'}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #eef2f7' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Salle / classe / cycle</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{selectedParent.eleveSalle || '—'}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{selectedParent.eleveClasse || '—'} · {selectedParent.eleveCycle || '—'}</div>
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 14, background: '#fff', border: '1px solid #eef2f7' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Enfants liés</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0062ff' }}>{selectedParent.nbEnfants || selectedParent.children?.length || 0}</div>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {(selectedParent.children || []).map((child) => (
                  <div key={child.matricule} style={{ padding: 10, borderRadius: 12, background: '#f8fafc', border: '1px solid #eef2f7' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{child.prenom} {child.nom}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{child.matricule} · {child.salle || '—'} · {child.classe || '—'}</div>
                  </div>
                ))}
                {(selectedParent.children || []).length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucun enfant détaillé</div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editing ? 'Modifier le parent' : 'Nouveau parent'} onClose={() => setShowModal(false)}>
          {error && <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', color: '#dc2626', fontSize: '13px' }}><AlertCircle size={14} />{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={s.label}>Prénom *</label><input style={s.inp} value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" /></div>
            <div><label style={s.label}>Nom *</label><input style={s.inp} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom" /></div>
            <div><label style={s.label}>Mobile</label><input style={s.inp} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="Ex: 677000000" /></div>
            <div><label style={s.label}>Téléphone</label><input style={s.inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ex: 677000000" /></div>
            <div><label style={s.label}>Mot de passe {!editing && '*'}</label><input style={s.inp} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Laisser vide pour ne pas modifier' : 'Mot de passe initial'} /></div>
            <div style={{ gridColumn: '1/-1' }}>
              <EleveSearch onChange={(val) => {
                if (!val) return;
                if ((form.matricules || []).includes(val)) return;
                if ((form.matricules || []).length >= Number(form.numChildren || 1)) { setError(`Vous avez déjà sélectionné ${form.numChildren} enfant(s)`); return; }
                setForm({ ...form, matricules: [...(form.matricules || []), val] });
              }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {(form.matricules || []).map(m => {
                  const child = (selectedParent?.children || []).find(c => c.matricule === m) || { matricule: m };
                  return (
                    <div key={m} style={{ padding: '6px 10px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{child.prenom ? `${child.prenom} ${child.nom}` : child.matricule}</div>
                      <button onClick={() => setForm({ ...form, matricules: form.matricules.filter(x => x !== m) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={12} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div><label style={s.label}>Nom d'utilisateur</label><input style={s.inp} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Nom d'utilisateur (laisser vide pour génération automatique)" disabled={!form.isUser} /></div>
            <div><label style={s.label}>Nombre d'enfants *</label><input style={s.inp} type="number" min={1} max={10} value={form.numChildren} onChange={e => setForm({ ...form, numChildren: Math.max(1, Number(e.target.value || 1)) })} /></div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={!form.isUser} onChange={(e) => setForm({ ...form, isUser: !e.target.checked })} />
                <span style={{ fontSize: '13px' }}>Non utilisateur (ne pas créer de compte parent)</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>Annuler</button>
            <button onClick={handleSubmit} style={s.btn('#10b981')}>{editing ? 'Mettre à jour le parent' : 'Enregistrer le parent'}</button>
          </div>
        </Modal>
      )}
      </div>
    </Layout>
  );
}
