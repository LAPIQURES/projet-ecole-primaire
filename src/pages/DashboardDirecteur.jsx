import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  Users, UserCheck, Building2, CreditCard, AlertTriangle,
  TrendingUp, BookOpen, Award, Activity, RefreshCw, Calendar,
  ChevronRight, BarChart2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import API from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));
const fmtMoney = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'HTG', maximumFractionDigits: 0 }).format(Number(n || 0));

function KpiCard({ label, value, icon: Icon, color, sub, trend }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: '22px 24px',
      boxShadow: '0 4px 24px rgba(15,23,42,0.07)',
      border: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      animation: 'fadeUp 0.4s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={color} />
        </div>
        {trend !== undefined && (
          <div style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
            background: trend >= 0 ? '#dcfce7' : '#fee2e2',
            color: trend >= 0 ? '#16a34a' : '#dc2626',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
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

export default function DashboardDirecteur() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const now = new Date();
  const heure = now.getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const [stats, setStats] = useState(null);
  const [elevesRecents, setElevesRecents] = useState([]);
  const [repartitionClasses, setRepartitionClasses] = useState([]);
  const [inscriptionsMensuel, setInscriptionsMensuel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, inscRes] = await Promise.all([
        API.get('/stats/directeur', { headers }),
        API.get('/stats/inscriptions-mensuel', { headers }),
      ]);
      setStats(statsRes.data.stats || null);
      setElevesRecents(statsRes.data.elevesRecents || []);
      setRepartitionClasses(statsRes.data.repartitionClasses || []);
      setInscriptionsMensuel(inscRes.data || []);
    } catch (err) {
      setError('Impossible de charger les statistiques. Vérifiez votre connexion.');
      console.error('DashboardDirecteur error:', err?.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tauxRemplissage = stats?.capaciteMax > 0
    ? Math.round((stats.totalEleves / stats.capaciteMax) * 100)
    : 0;

  return (
    <Layout title="Tableau de bord — Directeur">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .refresh-btn:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            {salutation}, {user.login || 'Directeur'} 👋
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          className="refresh-btn"
          onClick={() => load(true)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', color: '#dc2626', marginBottom: 24, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ─── Bannière Hero ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #6366f1 60%, #8b5cf6 100%)',
        borderRadius: 24, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 12px 40px rgba(99,102,241,0.3)', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            Année académique en cours
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 8 }}>
            Vue d'ensemble de l'École
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Élèves actifs', value: loading ? '—' : fmt(stats?.totalEleves) },
              { label: 'Enseignants', value: loading ? '—' : fmt(stats?.totalEnseignants) },
              { label: 'Taux remplissage', value: loading ? '—' : `${tauxRemplissage}%` },
            ].map(item => (
              <div key={item.label} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 12, backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{item.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Award size={36} color="white" />
        </div>
      </div>

      {/* ─── KPIs ─── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <Activity size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ marginTop: 12 }}>Chargement des statistiques…</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <KpiCard label="Élèves inscrits" value={fmt(stats?.totalEleves)} icon={Users} color="#6366f1" sub="Actifs cette année" trend={5} />
            <KpiCard label="Enseignants" value={fmt(stats?.totalEnseignants)} icon={UserCheck} color="#10b981" sub="Personnel actif" />
            <KpiCard label="Classes" value={fmt(stats?.totalClasses)} icon={Building2} color="#f59e0b" sub={`Capacité max : ${fmt(stats?.capaciteMax)}`} />
            <KpiCard label="Paiements ce mois" value={fmtMoney(stats?.paiementsMois)} icon={CreditCard} color="#06b6d4" sub="Encaissements du mois" trend={2} />
            <KpiCard label="Élèves en impayé" value={fmt(stats?.impayesCount)} icon={AlertTriangle} color="#ef4444" sub="Scolarité non soldée" />
            <KpiCard label="Rapports ce mois" value={fmt(stats?.rapportsMois)} icon={BookOpen} color="#8b5cf6" sub="Rapports disciplinaires" />
          </div>

          {/* ─── Graphiques ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
            {/* Inscriptions mensuelles */}
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <TrendingUp size={18} color="#6366f1" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Inscriptions (6 derniers mois)</span>
              </div>
              {inscriptionsMensuel.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={inscriptionsMensuel}>
                    <defs>
                      <linearGradient id="gradEleves" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" name="Inscriptions" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradEleves)" dot={{ r: 4, fill: '#6366f1' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>Aucune donnée disponible</div>
              )}
            </div>

            {/* Répartition effectifs par classe */}
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <BarChart2 size={18} color="#10b981" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Effectifs par classe</span>
              </div>
              {repartitionClasses.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={repartitionClasses} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <YAxis dataKey="libelle" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="effectif" name="Élèves" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>Aucune classe trouvée</div>
              )}
            </div>
          </div>

          {/* ─── Indicateur Taux de remplissage ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Taux de remplissage</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={tauxRemplissage > 85 ? '#ef4444' : tauxRemplissage > 60 ? '#f59e0b' : '#10b981'}
                      strokeWidth="3"
                      strokeDasharray={`${tauxRemplissage} ${100 - tauxRemplissage}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#1e293b' }}>
                    {tauxRemplissage}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}><strong>{fmt(stats?.totalEleves)}</strong> élèves inscrits</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>sur <strong>{fmt(stats?.capaciteMax)}</strong> places disponibles</div>
                  <div style={{ marginTop: 8, padding: '4px 10px', background: tauxRemplissage > 85 ? '#fef2f2' : '#f0fdf4', borderRadius: 8, fontSize: 12, fontWeight: 600, color: tauxRemplissage > 85 ? '#dc2626' : '#16a34a' }}>
                    {tauxRemplissage > 85 ? '⚠️ Proche de la saturation' : '✅ Capacité normale'}
                  </div>
                </div>
              </div>
            </div>

            {/* Élèves récents */}
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Dernières inscriptions</span>
                <Calendar size={16} color="#94a3b8" />
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {elevesRecents.length === 0
                  ? <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Aucun élève récent</div>
                  : elevesRecents.map((e) => (
                    <div key={e.matricule} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {(e.prenom || 'E')[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.prenom} {e.nom}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{e.classe || 'Classe non définie'} · {e.matricule}</div>
                      </div>
                      <ChevronRight size={14} color="#cbd5e1" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
