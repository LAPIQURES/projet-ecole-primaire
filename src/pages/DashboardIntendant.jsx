import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  CreditCard, AlertTriangle, TrendingUp, TrendingDown,
  Users, Activity, DollarSign, Percent, User, Lock
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts';
import API, { getProfileAPI, updateProfileAPI, changePasswordAPI } from '../services/api';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));
const fmtMoney = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(n || 0));

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

export default function DashboardIntendant({ defaultTab = 'overview' }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const now = new Date();
  const heure = now.getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const [data, setData] = useState(null);
  const [paiementsMensuel, setPaiementsMensuel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [profileForm, setProfileForm] = useState({ nom: '', prenom: '', email: '', mobile: '', username: '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [intRes, mensuelRes, profileRes] = await Promise.all([
        API.get('/stats/intendant', { headers }),
        API.get('/stats/paiements-mensuel', { headers }),
        getProfileAPI().catch(() => ({ data: {} })),
      ]);
      setData(intRes.data);
      setPaiementsMensuel(mensuelRes.data || []);
      if (profileRes.data) setProfileForm(profileRes.data);
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
  const repartitionModes = data?.repartitionModes || [];

  const tauxRecouvrement = data
    ? Math.round((data.encaissements / (data.encaissements + data.totalDettes)) * 100) || 0
    : 0;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfileAPI(profileForm);
      setProfileMsg({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || err.message });
    } finally { setSavingProfile(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setProfileMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    try {
      setSavingProfile(true);
      await changePasswordAPI({ oldPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setProfileMsg({ type: 'success', text: 'Mot de passe mis à jour !' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || err.message });
    } finally { setSavingProfile(false); }
  };

  const inpStyle = {
    padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#1e293b', background: '#fff',
  };

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
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', color: '#dc2626', marginBottom: 24, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: activeTab === 'overview' ? '#10b981' : '#f1f5f9',
            color: activeTab === 'overview' ? 'white' : '#64748b',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
          }}
        >
          <Activity size={16} /> Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('profil')}
          style={{
            padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: activeTab === 'profil' ? '#10b981' : '#f1f5f9',
            color: activeTab === 'profil' ? 'white' : '#64748b',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
          }}
        >
          <User size={16} /> Mon Profil
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
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
                    <Area type="monotone" dataKey="total" name="Encaissé (FCFA)" stroke="#10b981" strokeWidth={2.5} fill="url(#gradPaie)" dot={{ r: 4, fill: '#10b981' }} />
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
        </>
      )}
      </>
      ) : (
        /* ─── Profil ─── */
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
          {profileMsg.text && (
            <div style={{
              marginBottom: 20, padding: '14px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
              background: profileMsg.type === 'success' ? '#dcfce7' : '#fef2f2',
              color: profileMsg.type === 'success' ? '#15803d' : '#dc2626',
              border: `1px solid ${profileMsg.type === 'success' ? '#86efac' : '#fca5a5'}`
            }}>
              {profileMsg.type === 'success' ? '✅' : '❌'} {profileMsg.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            <form onSubmit={handleUpdateProfile} style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#10b98118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Informations Personnelles</h3>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Mettez à jour vos coordonnées</div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Nom</label>
                  <input type="text" value={profileForm.nom || ''} onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })} style={inpStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Prénom</label>
                  <input type="text" value={profileForm.prenom || ''} onChange={e => setProfileForm({ ...profileForm, prenom: e.target.value })} style={inpStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Email</label>
                  <input type="email" value={profileForm.email || ''} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} style={inpStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Mobile</label>
                  <input type="text" value={profileForm.mobile || ''} onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })} style={inpStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Nom d'utilisateur</label>
                  <input type="text" value={profileForm.username || ''} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} style={inpStyle} required />
                </div>
              </div>
              <button type="submit" disabled={savingProfile} style={{ marginTop: 24, width: '100%', padding: '12px 20px', background: savingProfile ? '#6ee7b7' : '#10b981', color: 'white', border: 'none', borderRadius: 12, cursor: savingProfile ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.2s' }}>
                {savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>

            <form onSubmit={handleUpdatePassword} style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(15,23,42,0.07)', border: '1px solid #f1f5f9', height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f59e0b18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Sécurité</h3>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Changer votre mot de passe</div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Mot de passe actuel</label>
                  <input type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} style={inpStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Nouveau mot de passe</label>
                  <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} style={inpStyle} required minLength={6} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
                  <input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} style={inpStyle} required minLength={6} />
                </div>
              </div>
              <button type="submit" disabled={savingProfile} style={{ marginTop: 24, width: '100%', padding: '12px 20px', background: savingProfile ? '#fcd34d' : '#f59e0b', color: 'white', border: 'none', borderRadius: 12, cursor: savingProfile ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.2s' }}>
                {savingProfile ? 'Modification...' : 'Mettre à jour le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
