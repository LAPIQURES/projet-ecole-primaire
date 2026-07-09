import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  CreditCard, AlertTriangle, TrendingUp, TrendingDown,
  Users, Phone, Search, RefreshCw, Activity,
  CheckCircle, DollarSign, Percent, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts';
import API from '../services/api';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));
const fmtMoney = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'HTG', maximumFractionDigits: 0 }).format(Number(n || 0));

function KpiCard({ label, value, icon: Icon, color, sub, badge, badgeColor }) {
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '22px 24px',
      boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.4s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={color} />
        </div>
        {badge !== undefined && (
          <div style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            background: badgeColor ? `${badgeColor}20` : '#f1f5f9',
            color: badgeColor || '#64748b',
          }}>{badge}</div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 16px', color: 'white', fontSize: 13 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>{p.name}: <strong>{fmt(p.value)}</strong></div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardIntendant() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const now = new Date();
  const heure = now.getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const [data, setData] = useState(null);
  const [paiementsMensuel, setPaiementsMensuel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('reste');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [intRes, mensuelRes] = await Promise.all([
        API.get('/stats/intendant', { headers }),
        API.get('/stats/paiements-mensuel', { headers }),
      ]);
      setData(intRes.data);
      setPaiementsMensuel(mensuelRes.data || []);
    } catch (err) {
      setError('Impossible de charger les données financières.');
      console.error('DashboardIntendant error:', err?.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const elevesDettes = data?.elevesDettes || [];
  const paiementsRecents = data?.paiementsRecents || [];
  const repartitionModes = data?.repartitionModes || [];

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
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const tauxRecouvrement = data
    ? Math.round((data.encaissements / (data.encaissements + data.totalDettes)) * 100) || 0
    : 0;

  return (
    <Layout title="Tableau de bord — Intendant">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .th-sort { cursor: pointer; user-select: none; }
        .th-sort:hover { color: #6366f1 !important; }
        .tr-row:hover td { background: #f8fafc !important; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            {salutation}, {user.login || 'Intendant'} 👋
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Tableau de bord de trésorerie — {now.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => load(true)} disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569',
          }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', color: '#dc2626', marginBottom: 24, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ─── Bannière Hero ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #10b981 60%, #34d399 100%)',
        borderRadius: 24, padding: '28px 32px', marginBottom: 28,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 12px 40px rgba(16,185,129,0.3)', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Trésorerie — Année en cours</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 8 }}>
            {loading ? '...' : fmtMoney(data?.encaissements)}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Total encaissé cette année</div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Ce mois', value: loading ? '—' : fmtMoney(data?.encaissementsMois) },
            { label: 'Élèves en dette', value: loading ? '—' : data?.dettesCount },
            { label: 'Taux recouvrement', value: loading ? '—' : `${tauxRecouvrement}%` },
          ].map(item => (
            <div key={item.label} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 12, backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{item.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <Activity size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 12 }}>Chargement des données financières…</div>
        </div>
      ) : (
        <>
          {/* ─── KPIs ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <KpiCard label="Encaissements (année)" value={fmtMoney(data?.encaissements)} icon={DollarSign} color="#10b981" sub="Total perçu" badge="Année" badgeColor="#10b981" />
            <KpiCard label="Encaissements (mois)" value={fmtMoney(data?.encaissementsMois)} icon={TrendingUp} color="#6366f1" sub="Ce mois-ci" />
            <KpiCard label="Total des dettes" value={fmtMoney(data?.totalDettes)} icon={TrendingDown} color="#ef4444" sub="Restes à payer cumulés" badge={`${data?.dettesCount} élèves`} badgeColor="#ef4444" />
            <KpiCard label="Taux de recouvrement" value={`${tauxRecouvrement}%`} icon={Percent} color="#f59e0b" sub="Encaissé / Scolarité totale" />
          </div>

          {/* ─── Graphiques ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* Courbe paiements */}
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>📈 Évolution des encaissements (6 mois)</div>
              {paiementsMensuel.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={paiementsMensuel}>
                    <defs>
                      <linearGradient id="gradPaie" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" name="Encaissé (HTG)" stroke="#10b981" strokeWidth={2.5} fill="url(#gradPaie)" dot={{ r: 4, fill: '#10b981' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>Aucun paiement trouvé pour les 6 derniers mois</div>
              )}
            </div>

            {/* Pie chart modes */}
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>💳 Modes de paiement</div>
              {repartitionModes.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={repartitionModes} dataKey="total" nameKey="modePaiement" cx="50%" cy="50%" outerRadius={70} label={({ modePaiement, percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {repartitionModes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => fmtMoney(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                    {repartitionModes.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                          <span style={{ color: '#475569' }}>{m.modePaiement || 'Non spécifié'}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{fmtMoney(m.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>Aucune donnée</div>
              )}
            </div>
          </div>

          {/* ─── Derniers paiements reçus ─── */}
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9', marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>✅ Derniers paiements reçus</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {paiementsRecents.length === 0
                ? <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucun paiement enregistré</div>
                : paiementsRecents.map((p) => (
                  <div key={p.idPaie} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 12, gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={16} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{p.prenom} {p.nom} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {p.matricule}</span></div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(p.datePaie).toLocaleDateString('fr-FR')} · {p.modePaiement || 'Non spécifié'}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{fmtMoney(p.montant)}</div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* ─── Tableau des impayés ─── */}
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>⚠️ Élèves en impayé</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{filtered.length} élève(s) concerné(s)</div>
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

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <CheckCircle size={32} color="#10b981" style={{ display: 'block', margin: '0 auto 12px' }} />
                {search ? 'Aucun résultat pour cette recherche.' : 'Aucun impayé enregistré ! 🎉'}
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
        </>
      )}
    </Layout>
  );
}
