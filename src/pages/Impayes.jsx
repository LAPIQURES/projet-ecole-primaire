import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { Search, CheckCircle, Phone } from 'lucide-react';
import API from '../services/api';

const fmtMoney = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(n || 0));

export default function Impayes() {
  const [elevesDettes, setElevesDettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('reste');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await API.get('/stats/intendant', { headers });
      setElevesDettes(res.data.elevesDettes || []);
    } catch (err) {
      console.error('Erreur chargement impayés:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtrage & tri
  const filtered = elevesDettes
    .filter(e => {
      const q = search.toLowerCase();
      return !q || `${e.nom} ${e.prenom} ${e.matricule} ${e.classe || ''}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1;
      if (typeof a[sortField] === 'string') return a[sortField].localeCompare(b[sortField]) * v;
      return ((a[sortField] || 0) - (b[sortField] || 0)) * v;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <Layout title="Élèves en impayé">
      <style>{`
        .th-sort { cursor: pointer; user-select: none; }
        .th-sort:hover { color: #6366f1 !important; }
        .tr-row:hover td { background: #f8fafc !important; }
      `}</style>
      
      <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>⚠️ Liste des élèves avec impayés</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{filtered.length} élève(s) concerné(s) - Données réelles de la base</div>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher un élève…"
              style={{
                paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13,
                outline: 'none', width: 220, color: '#1e293b',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Chargement des données...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <CheckCircle size={32} color="#10b981" style={{ display: 'block', margin: '0 auto 12px' }} />
            {search ? 'Aucun résultat pour cette recherche.' : 'Aucun impayé enregistré dans la base de données ! 🎉'}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {[
                      { label: 'Élève', field: 'nom' },
                      { label: 'Classe', field: 'classe' },
                      { label: 'Scolarité', field: 'scolariteTotale' },
                      { label: 'Payé', field: 'totalPaye' },
                      { label: 'Reste dû', field: 'reste' },
                      { label: 'Parent', field: 'parentNom' },
                      { label: 'Téléphone', field: null },
                    ].map(col => (
                      <th key={col.label}
                        className={col.field ? 'th-sort' : ''}
                        onClick={col.field ? () => toggleSort(col.field) : undefined}
                        style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {col.label} {col.field && <SortIcon field={col.field} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((e) => {
                    const pourcentagePaye = e.scolariteTotale > 0 ? Math.round((e.totalPaye / e.scolariteTotale) * 100) : 0;
                    const isUrgent = e.reste > 50000;
                    return (
                      <tr key={e.matricule} className="tr-row" style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: isUrgent ? '#fef2f2' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isUrgent ? '#dc2626' : '#d97706', flexShrink: 0 }}>
                              {(e.prenom || 'E')[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{e.prenom} {e.nom}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>{e.matricule}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{e.classe || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{fmtMoney(e.scolariteTotale)}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 99, minWidth: 60 }}>
                              <div style={{ width: `${pourcentagePaye}%`, height: '100%', background: '#10b981', borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{pourcentagePaye}%</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{fmtMoney(e.totalPaye)}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            fontWeight: 800, fontSize: 13,
                            color: isUrgent ? '#dc2626' : '#f59e0b',
                            padding: '3px 8px', borderRadius: 8,
                            background: isUrgent ? '#fef2f2' : '#fef3c7',
                          }}>
                            {fmtMoney(e.reste)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          {e.parentNom ? `${e.parentNom} ${e.parentPrenom || ''}`.trim() : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {e.mobile ? (
                            <a href={`tel:${e.mobile}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6366f1', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>
                              <Phone size={13} />
                              {e.mobile}
                            </a>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#475569', opacity: page === 1 ? 0.4 : 1, fontSize: 13 }}>← Précédent</button>
                <span style={{ fontSize: 13, color: '#64748b' }}>Page <strong>{page}</strong> / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#475569', opacity: page === totalPages ? 0.4 : 1, fontSize: 13 }}>Suivant →</button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
