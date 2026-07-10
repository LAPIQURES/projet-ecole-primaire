import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertCircle, TrendingDown, Calendar, User } from 'lucide-react';
import API from '../services/api';

const s = {
  page: { background:'#f8fafc', minHeight:'100vh', padding:'24px', fontFamily:"'Segoe UI',sans-serif" },
  card: { background:'white', borderRadius:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9', padding:'20px', marginBottom:'20px' },
  btn: (variant='primary') => {
    const styles = {
      primary: { background:'#3b82f6', color:'white', border:'none' },
      secondary: { background:'#f1f5f9', color:'#374151', border:'1px solid #e2e8f0' },
      danger: { background:'#ef4444', color:'white', border:'none' }
    };
    return { padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', display:'inline-flex', alignItems:'center', gap:'6px', transition:'all 0.15s', ...styles[variant] };
  },
  inp: { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'13px', outline:'none', boxSizing:'border-box' },
  table: { width:'100%', borderCollapse:'collapse', marginTop:'16px' },
  th: { background:'#f8fafc', padding:'12px', textAlign:'left', fontSize:'12px', fontWeight:'700', color:'#374151', borderBottom:'1px solid #e2e8f0' },
  td: { padding:'12px', borderBottom:'1px solid #f1f5f9', fontSize:'13px' }
};

export default function DisciplineModule() {
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'all' // 'all', 'absent', 'present'
  });

  useEffect(() => {
    loadAbsences();
  }, [filters]);

  const loadAbsences = async () => {
    setLoading(true);
    try {
      const response = await API.get('/discipline/absences/list', {
        params: {
          month: filters.month,
          year: filters.year
        }
      });
      setAbsences(response.data || []);
      applyFilters(response.data || []);
    } catch (error) {
      console.error('Error loading absences:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = data;

    if (filters.status !== 'all') {
      filtered = filtered.filter(a => 
        filters.status === 'absent' ? a.status === 'Absent' : a.status === 'Présent'
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.eleveNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.elevePrenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.matricule?.toString().includes(searchTerm)
      );
    }

    setFilteredAbsences(filtered);
  };

  useEffect(() => {
    applyFilters(absences);
  }, [searchTerm, filters.status]);

  const absentCount = absences.filter(a => a.status === 'Absent').length;
  const presentCount = absences.filter(a => a.status === 'Présent').length;

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div style={s.page}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize:'24px', fontWeight:'700', color:'#0f172a', margin:0 }}>⚠️ Module Discipline - Absences</h1>
          <p style={{ margin:'8px 0 0', color:'#475569', fontSize:'14px', maxWidth:'760px' }}>
            Cette page affiche uniquement les absences et les problèmes de discipline.
            Les notes et évaluations enregistrées sont consultables dans <strong>Notes & Bulletins</strong>.
          </p>
        </div>
        <button style={s.btn('secondary')} onClick={() => window.print()}><Download size={16} /> Exporter</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px', marginBottom:'24px' }}>
        <div style={{ ...s.card, borderLeft:'4px solid #ef4444' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'4px' }}>ABSENTS</div>
              <div style={{ fontSize:'28px', fontWeight:'700', color:'#ef4444' }}>{absentCount}</div>
            </div>
            <AlertCircle size={32} color="#ef4444" opacity={0.3} />
          </div>
        </div>

        <div style={{ ...s.card, borderLeft:'4px solid #10b981' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'4px' }}>PRÉSENTS</div>
              <div style={{ fontSize:'28px', fontWeight:'700', color:'#10b981' }}>{presentCount}</div>
            </div>
            <TrendingDown size={32} color="#10b981" opacity={0.3} style={{ transform:'rotate(180deg)' }} />
          </div>
        </div>

        <div style={{ ...s.card, borderLeft:'4px solid #8b5cf6' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'4px' }}>TAUX D'ABSENCE</div>
              <div style={{ fontSize:'28px', fontWeight:'700', color:'#8b5cf6' }}>
                {absences.length > 0 ? ((absentCount / absences.length) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <TrendingDown size={32} color="#8b5cf6" opacity={0.3} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={s.card}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'16px', alignItems:'end' }}>
          <div>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px' }}>RECHERCHE ÉLÈVE</label>
            <div style={{ position:'relative' }}>
              <Search size={16} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Nom, prénom ou matricule..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...s.inp, paddingLeft:'32px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px' }}>MOIS</label>
            <select 
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
              style={{ ...s.inp, cursor:'pointer' }}
            >
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px' }}>ANNÉE</label>
            <select 
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
              style={{ ...s.inp, cursor:'pointer' }}
            >
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px' }}>STATUT</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ ...s.inp, cursor:'pointer' }}
            >
              <option value="all">Tous</option>
              <option value="absent">Absents seulement</option>
              <option value="present">Présents seulement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={s.card}>
        {loading ? (
          <div style={{ textAlign:'center', color:'#94a3b8', padding:'40px' }}>Chargement...</div>
        ) : filteredAbsences.length > 0 ? (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>NOM & PRÉNOM</th>
                <th style={s.th}>MATRICULE</th>
                <th style={s.th}>CLASSE</th>
                <th style={{ ...s.th, width:'100px' }}>DATE</th>
                <th style={{ ...s.th, width:'80px' }}>STATUT</th>
                <th style={s.th}>SALLE</th>
                <th style={s.th}>REMARQUE</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsences.map((absence, idx) => (
                <tr key={idx} style={{ background: absence.status === 'Absent' ? '#fef2f2' : 'white' }}>
                  <td style={s.td}>
                    <strong>{absence.eleveNom} {absence.elevePrenom}</strong>
                  </td>
                  <td style={s.td}>
                    <code style={{ background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px', fontSize:'11px' }}>
                      {absence.matricule}
                    </code>
                  </td>
                  <td style={s.td}>
                    <span style={{ fontSize:'12px', fontWeight:'600', color:'#334155' }}>{absence.classe || '-'}</span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#64748b' }}>
                      <Calendar size={14} />
                      {new Date(absence.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      display:'inline-block',
                      padding:'4px 10px',
                      borderRadius:'4px',
                      fontSize:'12px',
                      fontWeight:'600',
                      background: absence.status === 'Absent' ? '#fecaca' : '#dcfce7',
                      color: absence.status === 'Absent' ? '#dc2626' : '#16a34a'
                    }}>
                      {absence.status}
                    </span>
                  </td>
                  <td style={s.td}>{absence.salle || '-'}</td>
                  <td style={s.td} title={absence.commentaire}>{absence.commentaire || 'RAS'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign:'center', color:'#94a3b8', padding:'40px' }}>
            Aucun enregistrement trouvé
          </div>
        )}
      </div>

      {/* Statistics by student */}
      {filteredAbsences.length > 0 && (
        <div style={s.card}>
          <h3 style={{ margin:'0 0 16px 0', fontSize:'16px', fontWeight:'700', color:'#0f172a' }}>📊 Top Absences</h3>
          {(() => {
            const byStudent = {};
            filteredAbsences.forEach(a => {
              const key = `${a.eleveNom} ${a.elevePrenom}`;
              byStudent[key] = (byStudent[key] || 0) + (a.status === 'Absent' ? 1 : 0);
            });
            return (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'12px' }}>
                {Object.entries(byStudent)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([name, count]) => (
                    <div key={name} style={{ background:'#fef2f2', border:'1px solid #fecaca', padding:'12px', borderRadius:'8px' }}>
                      <div style={{ fontWeight:'600', color:'#0f172a' }}>{name}</div>
                      <div style={{ fontSize:'20px', fontWeight:'700', color:'#ef4444', marginTop:'4px' }}>{count} absences</div>
                    </div>
                  ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
