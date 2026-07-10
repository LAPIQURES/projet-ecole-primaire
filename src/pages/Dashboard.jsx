import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import {
  Users,
  UserCheck,
  BookOpen,
  ArrowRight,
  Search,
  Mic,
  Bell,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import {
  getElevesAPI,
  getClassesAPI,
  getEnseignantsAPI,
  getSallesAPI,
  getStatsAPI,
  getPaiementsMensuelAPI,
  getInscriptionsMensuelAPI,
  getRapportsElevesAPI,
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const BLUE = '#0062ff';
const ORANGE = '#ffa000';
const BG_APP = '#f4f6fb';
const CARD = '#ffffff';

const parseMonth = (yyyyMm) => {
  if (!yyyyMm || typeof yyyyMm !== 'string' || !yyyyMm.includes('-')) return null;
  const [y, m] = yyyyMm.split('-').map((n) => parseInt(n, 10));
  if (!y || !m) return null;
  return new Date(Date.UTC(y, m - 1, 1));
};

const toMonthShortFr = (yyyyMm, fallback) => {
  const d = parseMonth(yyyyMm);
  if (!d) return fallback || '';
  const s = d.toLocaleDateString('fr-FR', { month: 'short' });
  return s.replace('.', '');
};

const mergeMonthlySeries = (paiements, inscriptions) => {
  const map = new Map();

  (Array.isArray(paiements) ? paiements : []).forEach((r) => {
    const key = r.mois;
    if (!key) return;
    map.set(key, {
      key,
      mois: r.mois,
      moisCourt: toMonthShortFr(r.mois, null),
      paiements: Number(r.total) || 0,
      nbPaiements: Number(r.nbPaiements) || 0,
      inscriptions: 0,
    });
  });

  (Array.isArray(inscriptions) ? inscriptions : []).forEach((r) => {
    const key = r.mois;
    if (!key) return;
    const existing = map.get(key);
    const base = existing || {
      key,
      mois: r.mois,
      moisCourt: toMonthShortFr(r.mois, null),
      paiements: 0,
      nbPaiements: 0,
      inscriptions: 0,
    };
    base.inscriptions = Number(r.total) || 0;
    map.set(key, base);
  });

  return Array.from(map.values()).sort((a, b) => (a.mois).localeCompare(b.mois));
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [eleves, setEleves] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [elevesRecents, setElevesRecents] = useState([]);
  const [paiementsMensuel, setPaiementsMensuel] = useState([]);
  const [inscriptionsMensuel, setInscriptionsMensuel] = useState([]);
  const [rapportsRecents, setRapportsRecents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClasse, setSelectedClasse] = useState('Toutes les classes');

  // Barre de recherche dynamique
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const searchRef = useRef(null);

  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const now = new Date();
    const isSameMonth = now.getFullYear() === calendarMonth.getFullYear() && now.getMonth() === calendarMonth.getMonth();
    setSelectedDay(isSameMonth ? now.getDate() : null);
  }, [calendarMonth]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [eleveRes, classRes, ensRes, salleRes, statsRes, pRes, iRes, rRes] = await Promise.allSettled([
        getElevesAPI(),
        getClassesAPI(),
        getEnseignantsAPI(),
        getSallesAPI(),
        getStatsAPI(),
        getPaiementsMensuelAPI(),
        getInscriptionsMensuelAPI(),
        getRapportsElevesAPI(),
      ]);

      const elevesData = eleveRes.status === 'fulfilled' && Array.isArray(eleveRes.value.data) ? eleveRes.value.data : [];
      const classesData = classRes.status === 'fulfilled' && Array.isArray(classRes.value.data) ? classRes.value.data : [];
      const enseignantsData = ensRes.status === 'fulfilled' && Array.isArray(ensRes.value.data) ? ensRes.value.data : [];
      const sallesData = salleRes.status === 'fulfilled' && Array.isArray(salleRes.value.data) ? salleRes.value.data : [];

      setEleves(elevesData);
      setElevesRecents(elevesData.slice(0, 5));
      setEnseignants(enseignantsData);
      setClasses(classesData);
      setSalles(sallesData);

      const fallbackStats = {
        totalEleves: elevesData.length,
        totalEnseignants: enseignantsData.length,
        totalClasses: classesData.length,
        totalSalles: sallesData.length,
        paiementsMois: 0,
        impayesCount: 0,
        capaciteMax: sallesData.reduce((sum, s) => sum + (Number(s.capacite) || 0), 0),
      };

      setStats(fallbackStats);

      if (statsRes.status === 'fulfilled') {
        const d = statsRes.value?.data;
        if (d?.stats) {
          setStats((prev) => ({ ...prev, ...d.stats, totalSalles: sallesData.length }));
        }
        if (Array.isArray(d?.elevesRecents)) setElevesRecents(d.elevesRecents);
      }

      setPaiementsMensuel(pRes.status === 'fulfilled' && Array.isArray(pRes.value.data) ? pRes.value.data : []);
      setInscriptionsMensuel(iRes.status === 'fulfilled' && Array.isArray(iRes.value.data) ? iRes.value.data : []);

      const rows = rRes.status === 'fulfilled' && Array.isArray(rRes.value.data) ? rRes.value.data : [];
      setRapportsRecents(rows.slice(0, 3));

      setEvents([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const elevesActifs = useMemo(() => eleves.filter((e) => Number(e.actif) === 1), [eleves]);

  const classesOptions = useMemo(() => {
    const uniq = Array.from(new Set(elevesActifs.map((e) => e.classe).filter(Boolean)));
    uniq.sort((a, b) => String(a).localeCompare(String(b), 'fr'));
    const opts = ['Toutes les classes', 'Classe 7'];
    uniq.forEach((c) => {
      if (!opts.includes(c)) opts.push(c);
    });
    return opts;
  }, [elevesActifs]);

  const elevesFiltres = useMemo(() => {
    if (selectedClasse === 'Toutes les classes') return elevesActifs;
    if (selectedClasse === 'Classe 7') return elevesActifs.filter((e) => String(e.classe || '').includes('7'));
    return elevesActifs.filter((e) => String(e.classe || '') === selectedClasse);
  }, [elevesActifs, selectedClasse]);

  // Répartition garçons/filles/indéterminé depuis la BD (liste élèves)
  const boysCount = elevesFiltres.filter((e) => String(e.sexe) === '1').length;
  const girlsCount = elevesFiltres.filter((e) => String(e.sexe) === '2').length;
  const unknownCount = elevesFiltres.filter((e) => !['1', '2'].includes(String(e.sexe))).length;
  const totalGender = elevesFiltres.length;

  const genderData = [
    { name: 'Filles', value: girlsCount, color: BLUE },
    { name: 'Garçons', value: boysCount, color: ORANGE },
    ...(unknownCount > 0 ? [{ name: 'Non renseigné', value: unknownCount, color: '#cbd5e1' }] : [])
  ];

  const monthlySeries = useMemo(
    () => mergeMonthlySeries(paiementsMensuel, inscriptionsMensuel),
    [paiementsMensuel, inscriptionsMensuel]
  );

  const calendarTitle = useMemo(() => {
    const s = calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [calendarMonth]);

  const daysInMonth = useMemo(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    return new Date(y, m + 1, 0).getDate();
  }, [calendarMonth]);

  const startOffset = useMemo(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    return new Date(y, m, 1).getDay(); // 0=dimanche
  }, [calendarMonth]);

  // Recherche dynamique sur élèves, enseignants, classes, salles
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }
    const val = searchValue.trim().toLowerCase();
    const results = [];
    // Élèves
    eleves.forEach(e => {
      if ((e.nom && e.nom.toLowerCase().includes(val)) || (e.prenom && e.prenom.toLowerCase().includes(val)) || (e.matricule && String(e.matricule).includes(val))) {
        results.push({
          type: 'eleve',
          typeLabel: 'Élève',
          label: `${e.prenom || ''} ${e.nom || ''} (${e.matricule || ''})`,
          key: `eleve-${e.matricule}`,
          color: ORANGE
        });
      }
    });
    // Enseignants
    enseignants.forEach(e => {
      if ((e.nom && e.nom.toLowerCase().includes(val)) || (e.prenom && e.prenom.toLowerCase().includes(val))) {
        results.push({
          type: 'enseignant',
          typeLabel: 'Enseignant',
          label: `${e.prenom || ''} ${e.nom || ''}`,
          key: `ens-${e.id || e.nom}`,
          color: BLUE
        });
      }
    });
    // Classes
    classes.forEach(c => {
      if ((c.nom && c.nom.toLowerCase().includes(val)) || (c.code && String(c.code).toLowerCase().includes(val))) {
        results.push({
          type: 'classe',
          typeLabel: 'Classe',
          label: `${c.nom || ''} (${c.code || ''})`,
          key: `classe-${c.id || c.nom}`,
          color: ORANGE
        });
      }
    });
    // Salles
    salles.forEach(s => {
      if ((s.nom && s.nom.toLowerCase().includes(val)) || (s.code && String(s.code).toLowerCase().includes(val))) {
        results.push({
          type: 'salle',
          typeLabel: 'Salle',
          label: `${s.nom || ''} (${s.code || ''})`,
          key: `salle-${s.id || s.nom}`,
          color: BLUE
        });
      }
    });
    setSearchResults(results);
  }, [searchValue, eleves, enseignants, classes, salles]);

  return (
    <Layout title="" subtitle="">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '16px 28px',
        margin: '-28px -28px 24px',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Tableau de bord</h1>
        </div>


        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: '#f4f6fb',
          borderRadius: '30px',
          padding: '8px 20px',
          width: '380px',
          border: '1px solid #e2e8f0',
          gap: '12px',
          zIndex: 20
        }}>
          <Search size={18} color="#94a3b8" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Rechercher..."
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '13.5px',
              color: '#334155'
            }}
          />
          <Mic
            size={18}
            color="#94a3b8"
            style={{ cursor: 'pointer' }}
            onClick={() => searchRef.current?.focus()}
            title="Rechercher"
          />
          {/* Résultats dynamiques */}
          {showSearchResults && searchValue.trim() && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              width: '100%',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
              zIndex: 100,
              maxHeight: '320px',
              overflowY: 'auto',
              padding: '8px 0'
            }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>Aucun résultat</div>
              ) : (
                searchResults.map((item, idx) => (
                  <div
                    key={item.key || idx}
                    style={{
                      padding: '10px 18px',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      color: '#1e293b',
                      borderBottom: idx !== searchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                      fontWeight: 500
                    }}
                    onMouseDown={() => {
                      if (item.type === 'eleve') navigate('/eleves');
                      else if (item.type === 'enseignant') navigate('/enseignants');
                      else if (item.type === 'classe') navigate('/classes');
                      else if (item.type === 'salle') navigate('/salles');
                      setShowSearchResults(false);
                    }}
                  >
                    <span style={{ color: item.color, fontWeight: 700, marginRight: 8 }}>{item.typeLabel}:</span> {item.label}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Header Icons & Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{ position: 'relative', cursor: 'pointer', color: '#64748b' }}
            onClick={() => navigate('/messages')}
            title="Messages"
          >
            <MessageSquare size={20} />
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: BLUE, width: '6px', height: '6px', borderRadius: '50%' }} />
          </div>

          {/* Bulletin generation panel was moved to the Bulletins page */}
          <div
            style={{ position: 'relative', cursor: 'pointer', color: '#64748b' }}
            onClick={() => navigate('/settings')}
            title="Paramètres"
          >
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '-6px', right: '-4px', background: ORANGE, width: '12px', height: '12px', borderRadius: '50%', color: '#fff', fontSize: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>6</span>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

          {/* User profile details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{user?.nom || 'Brandon Septimus'}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Administrateur</div>
            </div>
            <div
              onClick={() => navigate('/settings')}
              title="Paramètres"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0062ff, #ffa000)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                boxShadow: '0 4px 10px rgba(0,98,255,0.2)',
                cursor: 'pointer',
              }}
            >
              {(user?.nom || 'B').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with 2 Columns (Image 4 format) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '24px',
        background: '#f4f6fb',
        padding: '4px',
        minHeight: 'calc(100vh - 120px)',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        
        {/* Left main area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Metric Cards Row (4 cards with rounded corners) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Élèves', value: loading ? '—' : (stats?.totalEleves ?? 0).toLocaleString(), color: ORANGE, icon: Users, action: '/eleves' },
              { label: 'Enseignants', value: loading ? '—' : (stats?.totalEnseignants ?? 0).toLocaleString(), color: BLUE, icon: UserCheck, action: '/enseignants' },
              { label: 'Classes', value: loading ? '—' : (stats?.totalClasses ?? 0).toLocaleString(), color: ORANGE, icon: BookOpen, action: '/classes' },
              { label: 'Salles', value: loading ? '—' : (stats?.totalSalles ?? 0).toLocaleString(), color: BLUE, icon: Award, action: '/salles' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate(card.action)}
                  style={{
                    background: CARD,
                    borderRadius: '20px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px',
                    border: '1px solid #edf2f7',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.01)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{card.value}</h4>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '6px', display: 'inline-block' }}>{card.label}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '12px',
                        background: CARD,
                        border: '1.5px solid ' + card.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                      }}>
                        <Icon size={16} />
                      </div>

                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: CARD,
                        border: '1.5px solid ' + card.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                      }}>
                        <ArrowRight size={14} style={{ transform: 'rotate(-45deg)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Second Row: Students Ratio (Donut) & Earnings Graph (Spline) */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
            
            {/* Students Gender Distribution Card */}
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Élèves</h3>
                <select
                  value={selectedClasse}
                  onChange={(e) => setSelectedClasse(e.target.value)}
                  style={{ border: 'none', background: BG_APP, fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '12px', outline: 'none' }}
                >
                  {classesOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Pie/Donut Chart */}
              <div style={{ width: '100%', height: '170px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text with total count */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Total</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{totalGender}</div>
                </div>
              </div>

              {/* Legend with exact numbers */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px', borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: BLUE }} />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Filles</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{girlsCount}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ORANGE }} />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Garçons</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{boysCount}</div>
                </div>
                {unknownCount > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Non renseigné</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{unknownCount}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Earnings Spline Area Chart Card */}
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Paiements & inscriptions</h3>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ORANGE }} />
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Paiements</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: BLUE }} />
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Inscriptions</span>
                    </div>
                  </div>
                </div>
                <select style={{ border: 'none', background: BG_APP, fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '12px', outline: 'none' }}>
                  <option>6 derniers mois</option>
                </select>
              </div>

              <div style={{ width: '100%', height: '180px' }}>
                {loading ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>Chargement...</div>
                ) : monthlySeries.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>Aucune donnée disponible</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPaiements" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ORANGE} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BLUE} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="moisCourt" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '600' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '600' }} />
                      <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="paiements" name="Paiements" stroke={ORANGE} strokeWidth={3} fillOpacity={1} fill="url(#colorPaiements)" />
                      <Area type="monotone" dataKey="inscriptions" name="Inscriptions" stroke={BLUE} strokeWidth={2.5} fillOpacity={1} fill="url(#colorInscriptions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* Third Row: Attendance & Student Activities */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Attendance Bar Chart Card */}
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Activité mensuelle</h3>
                <select style={{ border: 'none', background: BG_APP, fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '12px', outline: 'none' }}>
                  <option>Mensuel</option>
                </select>
              </div>

              <div style={{ width: '100%', height: '200px' }}>
                {loading ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>Chargement...</div>
                ) : monthlySeries.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94a3b8' }}>Aucune donnée disponible</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="moisCourt" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '600' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '600' }} />
                      <Tooltip />
                      <Bar dataKey="inscriptions" name="Inscriptions" fill={BLUE} radius={[10, 10, 0, 0]} maxBarSize={16} />
                      <Bar dataKey="nbPaiements" name="Nombre de paiements" fill={ORANGE} radius={[10, 10, 0, 0]} maxBarSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Student Activities Card */}
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Rapports récents</h3>
                <span
                  style={{ cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold' }}
                  onClick={() => navigate('/rapports')}
                  title="Voir les rapports"
                >
                  ...
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>Chargement...</div>
                ) : rapportsRecents.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>Aucune activité</div>
                ) : (
                  rapportsRecents.map((r, idx) => {
                    const color = idx % 2 === 0 ? ORANGE : BLUE;
                    const date = r.event_date || r.created_at;
                    return (
                      <div key={r.idRap || idx} style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: CARD,
                          border: '1.5px solid ' + color,
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Award size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.libelle || 'Rapport'}</h4>
                          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', lineHeight: '1.4' }}>{(r.commentaire || `Élève #${r.matricule}`)}</p>
                          <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                            {date ? new Date(date).toLocaleString('fr-FR') : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar Column - Calendar and Events (Image 4 format) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Calendar Card */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{calendarTitle}</span>
              <div style={{ display: 'flex', gap: '12px', color: '#64748b' }}>
                <ChevronLeft
                  size={16}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  title="Mois précédent"
                />
                <ChevronRight
                  size={16}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  title="Mois suivant"
                />
              </div>
            </div>

            {/* Days list */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '6px', marginBottom: '10px' }}>
              {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((d, i) => (
                <span key={i} style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8' }}>{d}</span>
              ))}
            </div>

            {/* Calendar Numbers grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
              {Array.from({ length: startOffset }).map((_, i) => (
                <span key={`offset-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const now = new Date();
                const isToday = now.getFullYear() === calendarMonth.getFullYear() && now.getMonth() === calendarMonth.getMonth() && now.getDate() === day;
                const isSelected = day === selectedDay;

                return (
                  <span
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      height: '28px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      background: isSelected ? BLUE : 'transparent',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: !isSelected && isToday ? '1.5px solid ' + ORANGE : '1.5px solid transparent',
                    }}
                    title={isToday ? "Aujourd'hui" : ''}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Événements à venir</h3>
              <span
                style={{ cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold' }}
                onClick={() => navigate('/emploi-du-temps')}
                title="Ouvrir l'emploi du temps"
              >
                ...
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>Chargement...</div>
              ) : events.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>Aucun événement</div>
              ) : (
                events.map((ev, idx) => (
                  <div key={idx} style={{
                    background: CARD,
                    borderLeft: '4.5px solid ' + (ev.color || ORANGE),
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '10px', color: ev.color || ORANGE, fontWeight: '800', textTransform: 'uppercase' }}>{ev.date}</span>
                    <h4 style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', margin: 0, lineHeight: '1.3' }}>{ev.title}</h4>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '600' }}>{ev.sub}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Activité récente</h3>
              <span style={{ fontSize: '11px', color: BLUE, fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/eleves')}>Voir tout</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {loading ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>Chargement...</div>
              ) : elevesRecents.length > 0 ? (
                elevesRecents.map((el, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                      {el.photoURL ? (
                        <img src={el.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0062ff, #ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '700' }}>
                          {el.prenom?.[0]}{el.nom?.[0]}
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {el.prenom} {el.nom}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                        Inscrit en {el.classe || 'Classe'}
                      </div>
                    </div>
                    <span style={{ fontSize: '9px', color: '#cbd5e1', fontWeight: '600' }}>
                      {el.created_at ? new Date(el.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>Aucun élève récent</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}
