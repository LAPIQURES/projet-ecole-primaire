import React, { useEffect, useState, useCallback } from 'react';
import IntendantLayout from '../components/IntendantLayout';
import {
  CreditCard, Users, TrendingUp, AlertCircle, CheckCircle, Download,
  Search, RefreshCw, Send, X, Bell, FileText, Plus, Eye, Printer,
  Clock, DollarSign, BarChart2,
} from 'lucide-react';
import {
  getElevesAPI, getClassesAPI, getPaiementsAPI, createPaiementAPI,
  getMessagesAPI, sendMessageAPI, getMessageContactsAPI, getTranchesAPI,
} from '../services/api';

const GREEN = '#28a745';

const StatCard = ({ icon: Icon, label, value, sub, color = GREEN, onClick }) => (
  <div onClick={onClick} style={{
    background: '#fff', borderRadius: 14, padding: '18px 20px',
    border: '1px solid #b7e4c7', cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(40,167,69,0.06)',
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'none')}
  >
    <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: '#0f2d1a' }}>{value}</div>
    <div style={{ fontSize: 13, color: '#3d7a52', fontWeight: 600, marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{sub}</div>}
  </div>
);

export default function DashboardIntendant() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date();
  const heure = now.getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const [loading, setLoading] = useState(true);
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Paiement form
  const [showPaiForm, setShowPaiForm] = useState(false);
  const [paiForm, setPaiForm] = useState({ matricule: '', idAca: '', idTranche: '', montant: '', idMode: 1, commentaire: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [paiError, setPaiError] = useState('');
  const [paiSuccess, setPaiSuccess] = useState('');

  // Notification form
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifTarget, setNotifTarget] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, cRes, pRes, tRes, cntRes] = await Promise.allSettled([
        getElevesAPI(),
        getClassesAPI(),
        getPaiementsAPI(),
        getTranchesAPI(),
        getMessageContactsAPI(),
      ]);
      if (eRes.status === 'fulfilled') setEleves(Array.isArray(eRes.value?.data) ? eRes.value.data : []);
      if (cRes.status === 'fulfilled') setClasses(Array.isArray(cRes.value?.data) ? cRes.value.data : []);
      if (pRes.status === 'fulfilled') setPaiements(Array.isArray(pRes.value?.data) ? pRes.value.data : []);
      if (tRes.status === 'fulfilled') setTranches(Array.isArray(tRes.value?.data) ? tRes.value.data : []);
      if (cntRes.status === 'fulfilled') setContacts(Array.isArray(cntRes.value?.data) ? cntRes.value.data : []);
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Computed stats
  const totalEncaisse = paiements.reduce((s, p) => s + (Number(p.montant) || 0), 0);
  const elevesAvecPaiement = new Set(paiements.map(p => p.matricule)).size;
  const elevesSansPaiement = eleves.filter(e => !paiements.find(p => p.matricule === e.matricule)).length;
  const tauxRecouvrement = eleves.length > 0 ? Math.round((elevesAvecPaiement / eleves.length) * 100) : 0;

  const filteredEleves = eleves.filter(e => {
    const q = search.toLowerCase();
    return !q || (e.nom + ' ' + e.prenom + ' ' + e.matricule).toLowerCase().includes(q);
  });

  const savePaiement = async () => {
    if (!paiForm.matricule || !paiForm.montant) { setPaiError('Élève et montant requis'); return; }
    setSaving(true); setPaiError('');
    try {
      await createPaiementAPI(paiForm);
      setPaiSuccess('Paiement enregistré avec succès !');
      setPaiForm({ matricule: '', idAca: '', idTranche: '', montant: '', idMode: 1, commentaire: '', url: '' });
      setTimeout(() => { setPaiSuccess(''); setShowPaiForm(false); }, 2000);
      load();
    } catch (e) { setPaiError(e.response?.data?.error || 'Erreur enregistrement'); }
    finally { setSaving(false); }
  };

  const sendNotif = async () => {
    if (!notifTarget || !notifMsg) return;
    setNotifSending(true);
    try {
      await sendMessageAPI({ to: notifTarget, subject: 'Retard de paiement — École Alanya', content: notifMsg, type: 'notification' });
      setShowNotifModal(false); setNotifTarget(''); setNotifMsg('');
    } catch (e) {}
    finally { setNotifSending(false); }
  };

  const printRecu = (paiement) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Reçu de paiement</title><style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        h2 { color: #28a745; }
        .info { margin: 8px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #999; }
      </style></head><body>
        <h2>École Alanya — Reçu de Paiement</h2>
        <p class="info"><strong>Matricule :</strong> ${paiement.matricule || '—'}</p>
        <p class="info"><strong>Élève :</strong> ${paiement.elevenom || paiement.elevePrenom || '—'}</p>
        <p class="info"><strong>Date :</strong> ${paiement.datePaie ? new Date(paiement.datePaie).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
        <p class="info"><strong>Tranche :</strong> ${paiement.tranche || '—'}</p>
        <p class="info"><strong>Mode de paiement :</strong> ${paiement.mode || 'Espèces'}</p>
        <p class="amount">${Number(paiement.montant || 0).toLocaleString('fr-FR')} FCFA</p>
        <p class="info"><strong>Commentaire :</strong> ${paiement.commentaire || '—'}</p>
        <div class="footer">Document généré le ${new Date().toLocaleString('fr-FR')} — École Alanya</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <IntendantLayout title="Gestion Financière" subtitle="Paiements · Inscriptions · Reçus">
      {/* Welcome */}
      <div style={{
        background: `linear-gradient(135deg, ${GREEN} 0%, #20c997 100%)`,
        borderRadius: 18, padding: '22px 28px', marginBottom: 24, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{salut}, {user.nom || 'Monsieur l\'Intendant'} 💼</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowPaiForm(true)}
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Enregistrer un paiement
            </button>
            <button
              onClick={() => setShowNotifModal(true)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Bell size={14} /> Notifier un retard
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', opacity: 0.9 }}>
          <div style={{ fontSize: 34, fontWeight: 900 }}>{totalEncaisse.toLocaleString('fr-FR')}</div>
          <div style={{ fontSize: 12 }}>FCFA encaissés</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #b7e4c7', paddingBottom: 0 }}>
        {[
          { id: 'dashboard', label: '📊 Vue générale' },
          { id: 'paiements', label: '💳 Paiements' },
          { id: 'impayes', label: '⚠️ Impayés' },
          { id: 'eleves', label: '👤 Élèves' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? GREEN : '#6b7280',
              fontWeight: activeTab === tab.id ? 700 : 500, fontSize: 13,
              borderBottom: activeTab === tab.id ? `2px solid ${GREEN}` : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard tab */}
      {activeTab === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            <StatCard icon={DollarSign} label="Total encaissé" value={`${totalEncaisse.toLocaleString('fr-FR')} F`} color={GREEN} sub="Tous paiements" />
            <StatCard icon={Users} label="Élèves à jour" value={elevesAvecPaiement} color="#3b82f6" sub={`sur ${eleves.length} élèves`} />
            <StatCard icon={AlertCircle} label="Impayés" value={elevesSansPaiement} color="#ef4444" sub="Aucun paiement" />
            <StatCard icon={TrendingUp} label="Taux de recouvrement" value={`${tauxRecouvrement}%`} color="#f59e0b" sub="Paiements effectués" />
            <StatCard icon={CreditCard} label="Paiements enregistrés" value={paiements.length} color="#8b5cf6" sub="Total transactions" />
          </div>

          {/* Progress bar */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #b7e4c7', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f2d1a' }}>Taux de recouvrement global</h3>
              <span style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>{tauxRecouvrement}%</span>
            </div>
            <div style={{ height: 14, background: '#f3f4f6', borderRadius: 7, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${tauxRecouvrement}%`, background: `linear-gradient(90deg, ${GREEN}, #20c997)`, borderRadius: 7, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              <span>{elevesAvecPaiement} élèves ont payé</span>
              <span>{elevesSansPaiement} élèves n'ont pas payé</span>
            </div>
          </div>

          {/* Derniers paiements */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #b7e4c7' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f2d1a' }}>Derniers paiements enregistrés</h3>
            {paiements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>Aucun paiement enregistré</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f0faf3' }}>
                      {['Matricule', 'Montant', 'Mode', 'Date', 'Commentaire', 'Reçu'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.slice(0, 10).map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{p.matricule}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: GREEN, fontSize: 14 }}>{Number(p.montant || 0).toLocaleString('fr-FR')} F</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#374151' }}>{p.mode || 'Espèces'}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#374151' }}>{p.datePaie ? new Date(p.datePaie).toLocaleDateString('fr-FR') : '—'}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>{p.commentaire || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            onClick={() => printRecu(p)}
                            style={{ padding: '5px 10px', background: '#f0faf3', border: `1px solid ${GREEN}`, borderRadius: 6, cursor: 'pointer', color: GREEN, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                          >
                            <Printer size={11} /> Imprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Paiements tab */}
      {activeTab === 'paiements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par matricule, nom..." style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #b7e4c7', borderRadius: 10, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={load} style={{ padding: '10px 14px', background: '#f0faf3', border: '1px solid #b7e4c7', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <RefreshCw size={13} /> Actualiser
              </button>
              <button onClick={() => setShowPaiForm(true)} style={{ padding: '10px 16px', background: GREEN, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Nouveau paiement
              </button>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #b7e4c7', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0faf3' }}>
                  {['#', 'Matricule', 'Montant', 'Mode', 'Date', 'Commentaire', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paiements.filter(p => !search || (p.matricule + '').toLowerCase().includes(search.toLowerCase())).slice(0, 30).map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0faf3', background: i % 2 === 0 ? '#fff' : '#fafffe' }}>
                    <td style={{ padding: '11px 14px', color: '#9ca3af', fontSize: 12 }}>#{p.idPaie}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#374151' }}>{p.matricule}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: GREEN }}>{Number(p.montant || 0).toLocaleString('fr-FR')} F</td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>{p.mode || p.idMode || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#6b7280' }}>{p.datePaie ? new Date(p.datePaie).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#6b7280' }}>{p.commentaire || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => printRecu(p)} style={{ padding: '5px 10px', background: '#f0faf3', border: `1px solid ${GREEN}`, borderRadius: 6, cursor: 'pointer', color: GREEN, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Printer size={11} /> Reçu
                      </button>
                    </td>
                  </tr>
                ))}
                {paiements.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Aucun paiement enregistré</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Impayés tab */}
      {activeTab === 'impayes' && (
        <div>
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#d97706" />
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
              {elevesSansPaiement} élèves n'ont effectué aucun paiement · Taux de recouvrement : {tauxRecouvrement}%
            </span>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #b7e4c7', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0faf3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f2d1a' }}>Élèves sans paiement ({elevesSansPaiement})</h3>
              <button
                onClick={() => setShowNotifModal(true)}
                style={{ padding: '8px 14px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Bell size={13} /> Notifier tous les parents
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff8e1' }}>
                  {['Matricule', 'Nom & Prénom', 'Classe', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eleves.filter(e => !paiements.find(p => p.matricule === e.matricule)).map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #fef9e7' }}>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#9ca3af' }}>{e.matricule}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: 13, color: '#1e1b4b' }}>{e.prenom} {e.nom}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#6b7280' }}>{e.classe || '—'}</td>
                    <td style={{ padding: '11px 14px', display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => { setPaiForm(f => ({ ...f, matricule: e.matricule })); setShowPaiForm(true); }}
                        style={{ padding: '5px 10px', background: '#f0faf3', border: `1px solid ${GREEN}`, borderRadius: 6, cursor: 'pointer', color: GREEN, fontSize: 11, fontWeight: 600 }}
                      >
                        + Paiement
                      </button>
                      <button
                        onClick={() => { setNotifTarget(e.matricule); setNotifMsg(`Bonjour, nous vous rappelons que le paiement de scolarité pour ${e.prenom} ${e.nom} (Matricule: ${e.matricule}) est en retard. Merci de régulariser rapidement. — École Alanya`); setShowNotifModal(true); }}
                        style={{ padding: '5px 10px', background: '#fff8e1', border: '1px solid #fde68a', borderRadius: 6, cursor: 'pointer', color: '#d97706', fontSize: 11, fontWeight: 600 }}
                      >
                        <Bell size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
                {elevesSansPaiement === 0 && (
                  <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>
                    <CheckCircle size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Tous les élèves ont effectué au moins un paiement !
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Élèves tab */}
      {activeTab === 'eleves' && (
        <div>
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève..." style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #b7e4c7', borderRadius: 10, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #b7e4c7', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0faf3' }}>
                  {['Matricule', 'Nom & Prénom', 'Classe', 'Total payé', 'Statut paiement', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEleves.slice(0, 50).map((e, i) => {
                  const elevesPaies = paiements.filter(p => p.matricule === e.matricule);
                  const totalPaye = elevesPaies.reduce((s, p) => s + (Number(p.montant) || 0), 0);
                  const hasPaid = elevesPaies.length > 0;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f0faf3' }}>
                      <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#9ca3af' }}>{e.matricule}</td>
                      <td style={{ padding: '11px 14px', fontWeight: 600, fontSize: 13, color: '#1e1b4b' }}>{e.prenom} {e.nom}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#6b7280' }}>{e.classe || '—'}</td>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: GREEN, fontSize: 13 }}>{totalPaye.toLocaleString('fr-FR')} F</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, fontWeight: 600, background: hasPaid ? '#dcfce7' : '#fee2e2', color: hasPaid ? '#16a34a' : '#dc2626' }}>
                          {hasPaid ? `${elevesPaies.length} paiement(s)` : 'Aucun paiement'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <button
                          onClick={() => { setPaiForm(f => ({ ...f, matricule: e.matricule })); setShowPaiForm(true); }}
                          style={{ padding: '5px 10px', background: '#f0faf3', border: `1px solid ${GREEN}`, borderRadius: 6, cursor: 'pointer', color: GREEN, fontSize: 11, fontWeight: 600 }}
                        >
                          + Paiement
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredEleves.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Aucun élève trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Payment Modal */}
      {showPaiForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 480, position: 'relative' }}>
            <button onClick={() => { setShowPaiForm(false); setPaiError(''); setPaiSuccess(''); }} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 18px', color: GREEN, fontSize: 17, fontWeight: 700 }}>💳 Enregistrer un paiement</h3>

            {paiSuccess && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>{paiSuccess}</div>}
            {paiError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{paiError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Matricule élève *', key: 'matricule', type: 'text', placeholder: 'Ex: 20250001' },
                { label: 'Montant (FCFA) *', key: 'montant', type: 'number', placeholder: '0' },
                { label: 'Tranche', key: 'idTranche', type: 'text', placeholder: '1, 2, 3...' },
                { label: 'Mode de paiement', key: 'idMode', type: 'select', options: [{ v: 1, l: 'Espèces' }, { v: 2, l: 'Mobile Money' }, { v: 3, l: 'Chèque' }, { v: 4, l: 'Virement' }] },
              ].map(({ label, key, type, placeholder, options }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
                  {type === 'select' ? (
                    <select value={paiForm[key]} onChange={e => setPaiForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}>
                      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={paiForm[key]} onChange={e => setPaiForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Commentaire</label>
              <textarea value={paiForm.commentaire} onChange={e => setPaiForm(f => ({ ...f, commentaire: e.target.value }))} placeholder="Commentaire optionnel..." rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>

            <button onClick={savePaiement} disabled={saving} style={{ width: '100%', marginTop: 16, padding: '12px', background: GREEN, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </button>
          </div>
        </div>
      )}

      {/* Notification modal */}
      {showNotifModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 460, position: 'relative' }}>
            <button onClick={() => setShowNotifModal(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 18px', color: '#d97706', fontSize: 17, fontWeight: 700 }}>🔔 Notification de retard de paiement</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Destinataire (matricule ou "all")</label>
              <input value={notifTarget} onChange={e => setNotifTarget(e.target.value)} placeholder="Matricule ou 'all' pour tous" style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Message</label>
              <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={4} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <button onClick={sendNotif} disabled={notifSending} style={{ width: '100%', padding: '12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              {notifSending ? 'Envoi...' : '📤 Envoyer la notification'}
            </button>
          </div>
        </div>
      )}
    </IntendantLayout>
  );
}
