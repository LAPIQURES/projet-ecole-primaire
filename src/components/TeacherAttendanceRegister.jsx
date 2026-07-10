import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, Save, Printer, Search, ChevronDown } from 'lucide-react';
import API, { getTeacherStudentsAPI } from '../services/api';

const s = {
  page: { background:'#f8fafc', minHeight:'100vh', padding:'24px', fontFamily:"'Segoe UI',sans-serif" },
  card: { background:'white', borderRadius:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9', padding:'20px', marginBottom:'20px' },
  btn: (variant='primary') => {
    const styles = {
      primary: { background:'#3b82f6', color:'white', border:'none' },
      secondary: { background:'#f1f5f9', color:'#374151', border:'1px solid #e2e8f0' },
      success: { background:'#10b981', color:'white', border:'none' },
      danger: { background:'#ef4444', color:'white', border:'none' }
    };
    return { padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', display:'inline-flex', alignItems:'center', gap:'6px', transition:'all 0.15s', ...styles[variant] };
  },
  inp: { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'13px', outline:'none', boxSizing:'border-box' },
  table: { width:'100%', borderCollapse:'collapse', marginTop:'16px' },
  th: { background:'#f8fafc', padding:'12px', textAlign:'left', fontSize:'12px', fontWeight:'700', color:'#374151', borderBottom:'1px solid #e2e8f0' },
  td: { padding:'12px', borderBottom:'1px solid #f1f5f9', fontSize:'13px' }
};

export default function TeacherAttendanceRegister() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('Toute la journée');

  const timeSlots = [
    'Toute la journée',
    '08h00 - 10h00',
    '10h00 - 12h00',
    '13h00 - 15h00',
    '15h00 - 17h00'
  ];

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass, date, timeSlot);
    }
  }, [date, timeSlot]);

  const loadClasses = async () => {
    try {
      const response = await API.get('/enseignants/me/classes-salles');
      const teacherClasses = Array.isArray(response.data?.classes) ? response.data.classes : [];
      setClasses(teacherClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async (idClasse, targetDate = date, targetTimeSlot = timeSlot) => {
    try {
      const response = await getTeacherStudentsAPI();
      const allStudents = Array.isArray(response.data) ? response.data : [];
      const selectedClassObj = classes.find((c) => String(c.idClasse) === String(idClasse));
      const classStudents = selectedClassObj
        ? allStudents.filter((s) => String(s.idClasse) === String(idClasse) || String(s.classe) === String(selectedClassObj.libelle))
        : allStudents;
      setStudents(classStudents);
      
      // Fetch existing attendance for this date
      try {
        const absRes = await API.get('/discipline/absences/list', { params: { date: targetDate } });
        const records = absRes.data || [];
        const init = {};
        classStudents.forEach((s) => {
          const record = records.find(r => 
            String(r.matricule) === String(s.matricule) && 
            (targetTimeSlot === 'Toute la journée' || r.commentaire?.includes(targetTimeSlot))
          );
          if (record && record.status === 'Absent') {
            init[s.matricule] = 'absent';
          } else {
            init[s.matricule] = 'present';
          }
        });
        setAttendance(init);
      } catch (err) {
        console.error('Error loading existing attendance:', err);
        const initFallback = {};
        classStudents.forEach((s) => { initFallback[s.matricule] = 'present'; });
        setAttendance(initFallback);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
      setAttendance({});
    }
  };

  const handleClassChange = (e) => {
    const idClasse = e.target.value;
    setSelectedClass(idClasse);
    if (idClasse) {
      loadStudents(idClasse);
    } else {
      setStudents([]);
      setAttendance({});
    }
  };

  const toggleAttendance = (matricule) => {
    setAttendance(prev => ({
      ...prev,
      [matricule]: prev[matricule] === 'present' ? 'absent' : 'present'
    }));
    setSaved(false);
  };

  const saveAttendance = async () => {
    if (!selectedClass || students.length === 0) {
      alert('Sélectionnez une classe avec des élèves');
      return;
    }

    setLoading(true);
    try {
      const entries = Object.entries(attendance);
      for (const [matricule, status] of entries) {
        await API.post('/eleves/mark-attendance', {
          matricule,
          commentaire: status === 'absent' ? `Absent - ${timeSlot}` : `RAS - ${timeSlot}`,
          date: date || new Date().toISOString().split('T')[0],
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      const apiError = error?.response?.data?.error || error.message || 'Erreur lors de l\'enregistrement';
      alert(apiError);
    } finally {
      setLoading(false);
    }
  };

  const absent = Object.values(attendance).filter(s => s === 'absent').length;
  const present = Object.values(attendance).filter(s => s === 'present').length;

  const handlePrint = () => {
    if (!selectedClass) { alert("Sélectionnez une classe avant d'imprimer"); return; }
    const classLabel = (classes.find(c => String(c.idClasse) === String(selectedClass)) || {}).libelle || `Classe ${selectedClass}`;
    const absentees = students.filter(s => attendance[s.matricule] === 'absent');

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Fiche d'absence - ${classLabel} - ${date}</title>
          <style>
            body{ font-family: Arial, Helvetica, sans-serif; color:#0f172a; margin:20px }
            .header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:18px }
            h1{ font-size:20px; margin:0 }
            .meta{ font-size:14px; color:#374151 }
            table{ width:100%; border-collapse:collapse; margin-top:14px }
            th, td{ border:1px solid #e6edf3; padding:8px; text-align:left }
            th{ background:#f8fafc; font-weight:700 }
            .empty{ color:#94a3b8; text-align:center; padding:18px }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Fiche d'absence</h1>
              <div class="meta">Classe: <strong>${classLabel}</strong></div>
              <div class="meta">Date: <strong>${date}</strong> | Heure: <strong>${timeSlot}</strong></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:12px;color:#64748b">Plateforme École - Gestion Académique</div>
            </div>
          </div>
          ${absentees.length === 0 ? `<div class="empty">Aucun élève absent pour cette date.</div>` : `
            <table>
              <thead>
                <tr><th>#</th><th>Nom & Prénom</th><th>Matricule</th><th>Commentaire</th></tr>
              </thead>
              <tbody>
                ${absentees.map((a, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${(a.nom || '') + ' ' + (a.prenom || '')}</td>
                    <td>${a.matricule}</td>
                    <td>Absent</td>
                  </tr>
                `).join('\n')}
              </tbody>
            </table>
          `}
        </body>
      </html>`;

    const w = window.open('', '_blank');
    if (!w) { alert("Impossible d'ouvrir la fenêtre d'impression (popup bloquée ?)"); return; }
    w.document.open('text/html', 'replace');
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.focus();
      setTimeout(() => { w.print(); }, 100);
    };
  };

  return (
    <div style={s.page}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'700', color:'#0f172a', margin:0 }}>📋 Cahier d'Appel</h1>
        <div style={{ display:'flex', gap:'8px' }}>
          <button style={s.btn('secondary')} onClick={() => handlePrint()}><Printer size={16} /> Imprimer</button>
          <button style={s.btn('success')} onClick={saveAttendance} disabled={loading}><Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>

      {saved && (
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'12px 16px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px', fontWeight:'600' }}>
          ✓ Présences enregistrées avec succès!
        </div>
      )}

      {/* Filters */}
      <div style={s.card}>
        <div style={{ display:'flex', gap:'16px', alignItems:'end', flexWrap:'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px' }}>CLASSE</label>
            <select value={selectedClass || ''} onChange={handleClassChange} style={{ ...s.inp, cursor:'pointer' }}>
              <option value="">-- Sélectionner une classe --</option>
              {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px' }}>DATE</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...s.inp }} />
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'6px' }}>TRANCHE D'HEURE</label>
            <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ ...s.inp, cursor:'pointer' }}>
              {timeSlots.map(ts => <option key={ts} value={ts}>{ts}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      {students.length > 0 && (
        <div style={s.card}>
          <div style={{ display:'flex', gap:'24px', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:'28px', fontWeight:'700', color:'#10b981' }}>{present}</div>
              <div style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>Présents</div>
            </div>
            <div>
              <div style={{ fontSize:'28px', fontWeight:'700', color:'#ef4444' }}>{absent}</div>
              <div style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>Absents</div>
            </div>
            <div style={{ marginLeft:'auto', fontSize:'12px', color:'#64748b' }}>
              Total: <strong style={{ color:'#0f172a' }}>{students.length}</strong> élèves
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      {selectedClass && students.length > 0 ? (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width:'40%' }}>NOM & PRÉNOM</th>
                <th style={s.th}>MATRICULE</th>
                <th style={s.th}>STATUT</th>
                <th style={s.th}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const isAbsent = attendance[student.matricule] === 'absent';
                return (
                  <tr key={student.matricule} style={{ background: isAbsent ? '#fef2f2' : 'white' }}>
                    <td style={s.td}>
                      <strong>{student.nom} {student.prenom}</strong>
                    </td>
                    <td style={s.td}>
                      <code style={{ background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px', fontSize:'11px' }}>{student.matricule}</code>
                    </td>
                    <td style={s.td}>
                      <span style={{ 
                        display:'inline-block',
                        padding:'4px 10px', 
                        borderRadius:'4px', 
                        fontSize:'12px', 
                        fontWeight:'600',
                        background: isAbsent ? '#fecaca' : '#dcfce7',
                        color: isAbsent ? '#dc2626' : '#16a34a'
                      }}>
                        {isAbsent ? 'Absent' : 'Présent'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button 
                        onClick={() => toggleAttendance(student.matricule)}
                        style={{ 
                          ...s.btn(isAbsent ? 'danger' : 'success'),
                          fontSize:'12px',
                          padding:'6px 12px'
                        }}
                      >
                        {isAbsent ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : selectedClass ? (
        <div style={{ ...s.card, textAlign:'center', color:'#94a3b8' }}>
          Aucun élève trouvé dans cette classe
        </div>
      ) : (
        <div style={{ ...s.card, textAlign:'center', color:'#94a3b8' }}>
          Sélectionnez une classe pour commencer
        </div>
      )}
    </div>
  );
}
