import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Eye, ChevronLeft, Calendar, MapPin, User, BookOpen, AlertCircle, CheckCircle, TrendingUp, TrendingDown, FileText, Activity, Bus, Heart, Shield, Mail, Phone, Printer, Share2, MessageSquare, FileCheck } from 'lucide-react';
import { getElevesAPI, createEleveAPI, updateEleveAPI, deleteEleveAPI, getEleveByIdAPI, getSallesAPI } from '../services/api';
import API from '../services/api';
import Layout from '../components/Layout';
import { getInitials } from '../utils/avatar';
import BulletinViewer from '../components/BulletinViewer';
import PrintableBulletin from '../components/PrintableBulletin';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = { blue:'#3b82f6', green:'#10b981', purple:'#8b5cf6', amber:'#f59e0b', red:'#ef4444', slate:'#64748b' };

const s = {
  page: { background:'#f8fafc', minHeight:'100vh', fontFamily:"'Segoe UI',sans-serif", padding:'28px' },
  card: { background:'white', borderRadius:'14px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' },
  btn: (color, outline) => ({ padding:'9px 18px', background: outline ? 'white' : color, color: outline ? color : 'white', border: `1.5px solid ${color}`, borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.15s' }),
  inp: { width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'13.5px', outline:'none', boxSizing:'border-box', color:'#1e293b', transition:'border-color 0.15s' },
  label: { fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.3px' },
  badge: (ok) => ({ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background: ok ? '#f0fdf4' : '#fef2f2', color: ok ? '#16a34a' : '#dc2626', border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}` }),
  tab: (active) => ({ padding:'8px 16px', border:'none', borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent', background:'none', color: active ? '#3b82f6' : '#64748b', fontWeight: active ? '700' : '400', cursor:'pointer', fontSize:'13px', transition:'all 0.15s' }),
};

function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth: wide ? '780px' : '580px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
          <div>
            <h3 style={{ fontSize:'17px', fontWeight:'700', color:'#0f172a', margin:0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize:'12px', color:'#94a3b8', margin:'2px 0 0' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={16}/></button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>
  );
}

// Mini bar chart pour les notes
function NoteBar({ note, max=20, color='#3b82f6' }) {
  const pct = Math.min((note/max)*100, 100);
  const c = note >= 10 ? '#0062ff' : note >= 7 ? '#ffa000' : '#ff6d00';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <div style={{ flex:1, height:'8px', background:'#f1f5f9', borderRadius:'4px', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:c, borderRadius:'4px', transition:'width 0.5s' }}/>
      </div>
      <span style={{ fontSize:'13px', fontWeight:'700', color:c, minWidth:'30px' }}>{note}/20</span>
    </div>
  );
}

function AvatarCircle({ photoURL, prenom, nom, size = 38, fallbackFontSize = 13, dashed = false }) {
  const initials = getInitials(prenom, nom);
  const hasPhoto = Boolean(photoURL && String(photoURL).trim());

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#f1f5f9',
        border: dashed ? '2.5px dashed #0062ff' : '2px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {hasPhoto ? (
        <img src={photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0062ff,#ffa000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: fallbackFontSize }}>
          {initials}
        </div>
      )}
    </div>
  );
}

// Fiche détaillée élève - Données cohérentes avec la BD
function FicheEleve({ eleve, onClose, onEdit, salles }) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showBulletin, setShowBulletin] = useState(false);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date());
  const [parents, setParents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load real parents and attendance data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load real parents
        const parentsRes = await API.get(`/api/eleves/${eleve.matricule}/parents`);
        setParents(parentsRes.data || []);

        // Load attendance for current month
        const month = attendanceMonth.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
        const attendanceRes = await API.get(`/eleves/${eleve.matricule}/attendance`, {
          params: { month }
        });
        setAttendance(attendanceRes.data || []);
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    if (eleve?.matricule) {
      loadData();
    }
  }, [eleve.matricule, attendanceMonth]);

  // Parents - utiliser les vraies données depuis ParentEleve
  const fatherName = parents && parents.length > 0
    ? `${parents[0].prenom || ''} ${parents[0].nom || ''}`.trim()
    : '—';
  const motherName = parents && parents.length > 1
    ? `${parents[1].prenom || ''} ${parents[1].nom || ''}`.trim()
    : '—';
  const parentMobile = parents && parents.length > 0
    ? parents[0].mobile
    : '—';
  const parentEmail = parents && parents.length > 0
    ? (parents[0].email || parents[0].mobile || `${(eleve.prenom || 'student').toLowerCase()}${(eleve.nom || '').toLowerCase()}@gmail.com`)
    : `${(eleve.prenom || 'student').toLowerCase()}${(eleve.nom || '').toLowerCase()}@gmail.com`;

  // Classe et salle - récupérées depuis eleve
  const classe = eleve.classe || '—';
  const salle = eleve.salle || '—';

  // Calcul de la progression basé sur les vraies notes
  const averageNote = eleve.evaluations && eleve.evaluations.length > 0
    ? (eleve.evaluations.reduce((sum, ev) => sum + (ev.note || 0), 0) / eleve.evaluations.length)
    : 0;
  const progression = Math.round((averageNote / 20) * 100);

  // Données pour graphique LineChart - évolution par évaluation
  const evolutionData = eleve.evaluations && eleve.evaluations.length > 0
    ? eleve.evaluations.map((ev, idx) => ({
        name: `Éval ${idx + 1}`,
        note: parseFloat(ev.note || 0).toFixed(1),
        cours: ev.cours || 'Cours'
      }))
    : [];

  // Évaluations mappées en résultats cohérents avec la BD
  const exams = eleve.evaluations && eleve.evaluations.length > 0
    ? eleve.evaluations.map((ev, idx) => {
        const grade = ev.note >= 16 ? 'A+' : ev.note >= 14 ? 'A' : ev.note >= 12 ? 'B' : ev.note >= 10 ? 'C' : 'F';
        return {
          id: `#eval${ev.idEval || idx + 1}`,
          type: ev.session || 'Évaluation',
          subject: ev.cours || 'Cours',
          note: ev.note != null ? `${ev.note}/20` : '—',
          grade: grade,
          percent: `${Math.round((Number(ev.note) / 20) * 100)}%`,
          date: ev.created_at ? new Date(ev.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
        };
      })
    : [];

  // Attendance stats for selected month (Real data from Frequente table)
  const getAttendanceStats = () => {
    if (!attendance || attendance.length === 0) {
      return [
        { name: 'Pas de données', value: 0, color: '#c7d2e0' }
      ];
    }

    const absent = attendance.filter(a => a.status === 'Absent').length;
    const present = attendance.filter(a => a.status === 'Présent').length;
    
    const data = [
      { name: 'Présent', value: present, color: '#0062ff' },
      { name: 'Absent', value: absent, color: '#ffb74d' }
    ];

    return data.filter((s) => s.value > 0);
  };

  const attendanceData = getAttendanceStats();
  const presentCount = attendance.filter((a) => a.status === 'Présent').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;
  const attendanceTotal = attendance.length;
  const presentPercent = attendanceTotal > 0 ? Math.round((presentCount / attendanceTotal) * 100) : 0;
  const recentAbsences = attendance
    .filter((a) => a.status === 'Absent')
    .slice(0, 8);

  const handlePrint = () => {
    // Create a new window for printing the bulletin
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('printable-bulletin');
    if (printContent && printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div style={{ background: '#f4f6fb', padding: '24px', fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onClose} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 18px', color: '#1e293b', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <ChevronLeft size={16} /> Retour
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowBulletin(true)} style={{ background: '#10b981', border: 'none', borderRadius: '12px', padding: '10px 20px', color: '#ffffff', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
            <FileCheck size={16} /> Voir Bulletin
          </button>
          <button onClick={() => onEdit(eleve)} style={{ background: '#0062ff', border: 'none', borderRadius: '12px', padding: '10px 20px', color: '#ffffff', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,98,255,0.25)' }}>
            Modifier
          </button>
        </div>
      </div>

      {/* Main Grid Layout - Split exactly like Image 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Bio Card & Personal Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Bio */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px 28px', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 12px 36px rgba(15,23,42,0.03)' }}>
            {/* Profile Avatar with concentric dashed ring */}
            <div style={{ display: 'inline-block', position: 'relative', padding: '6px', borderRadius: '50%', border: '2.5px dashed #3b82f6', marginBottom: '20px' }}>
              <AvatarCircle photoURL={eleve.photoURL} prenom={eleve.prenom} nom={eleve.nom} size={84} fallbackFontSize={24} dashed />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              {eleve.prenom} {eleve.nom}
            </h3>
            <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '700', marginBottom: '8px', background: '#eff6ff', display: 'inline-block', padding: '4px 12px', borderRadius: '20px' }}>
              Matricule: {eleve.matricule}
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 24px', fontWeight: '500' }}>Parent: {fatherName}</p>

            {/* Personal Details list inside Bio Card */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Détails personnels</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Sexe', value: (eleve.sexe === 1 || eleve.sexe === '1') ? 'Masculin' : 'Féminin' },
                  { label: 'Nom du père', value: fatherName },
                  { label: 'Nom de la mère', value: motherName },
                  { label: 'Date de naissance', value: eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Classe', value: classe },
                  { label: 'Salle', value: salle },
                  { label: "Date d'admission", value: eleve.created_at ? new Date(eleve.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Lieu de naissance', value: eleve.lieuNaissance ? `${eleve.lieuNaissance}` : '—' }
                ].map((detail, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f7fafc', fontSize: '13px' }}>
                    <span style={{ color: '#718096', fontWeight: '500' }}>{detail.label}:</span>
                    <span style={{ color: '#2d3748', fontWeight: '600' }}>{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Icons at the bottom of Bio Card */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
              <button onClick={handlePrint} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #edf2f7', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#0062ff'} onMouseLeave={e => e.currentTarget.style.borderColor = '#edf2f7'}><Printer size={16} /></button>
              <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #edf2f7', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', cursor: 'pointer' }}><MapPin size={16} /></button>
              <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #edf2f7', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', cursor: 'pointer' }}><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/></svg></button>
              <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #edf2f7', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', cursor: 'pointer' }}><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.95 4.57a10 10 0 01-2.82.77 4.96 4.96 0 002.16-2.72c-.95.55-2 .95-3.12 1.18a4.92 4.92 0 00-8.38 4.48c-4.1-.2-7.74-2.17-10.18-5.17a4.9 4.9 0 001.52 6.57 4.9 4.9 0 01-2.23-.61v.06a4.92 4.92 0 003.95 4.83 4.9 4.9 0 01-2.22.08 4.92 4.92 0 004.6 3.42A9.9 9.9 0 010 19.54a13.9 13.9 0 007.55 2.21c9.05 0 14-7.5 14-14v-.64a10 10 0 002.4-2.54z"/></svg></button>
              <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #edf2f7', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', cursor: 'pointer' }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></button>
            </div>
          </div>

          {/* About Student Card */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 12px 36px rgba(15,23,42,0.03)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biographie</h4>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0 }}>
              Élève en {eleve.classe || 'classe non spécifiée'}, inscrit le {eleve.created_at ? new Date(eleve.created_at).toLocaleDateString('fr-FR') : '—'}. 
              Le suivi de ses évaluations et de ses présences permet d'accompagner sa progression académique tout au long de l'année.
            </p>
          </div>
        </div>

        {/* Center Column: Quick Cards, Attendance Pie Chart & All Exam Results Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Metric Cards (Row 1) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: '0 12px 36px rgba(15,23,42,0.03)' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Évaluations</span>
                <h4 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0', letterSpacing: '-1px' }}>{eleve.evaluations?.length || 0}</h4>
              </div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.1)' }}>
                <Activity size={24} strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: '0 12px 36px rgba(15,23,42,0.03)' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progression</span>
                <h4 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0', letterSpacing: '-1px' }}>{progression}%</h4>
              </div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: progression >= 70 ? '#f0fdf4' : '#fff7ed', color: progression >= 70 ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: progression >= 70 ? '0 4px 12px rgba(16,185,129,0.1)' : '0 4px 12px rgba(245,158,11,0.1)' }}>
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Evolution Chart - LineChart */}
          {evolutionData.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1a202c', margin: '0 0 16px' }}>Évolution des notes</h4>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip formatter={(value) => `${value}/20`} />
                    <Legend />
                    <Line type="monotone" dataKey="note" stroke="#0062ff" strokeWidth={2} dot={{ fill: '#0062ff', r: 5 }} name="Note" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Attendance Donut Chart Card - DYNAMIC BY MONTH */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1a202c', margin: 0 }}>Présences</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() - 1))}
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#666' }}
                >&lt;</button>
                <span style={{ fontSize: '12px', color: '#718096', fontWeight: '600', minWidth: '100px', textAlign: 'center' }}>
                  {attendanceMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() + 1))}
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#666' }}
                >&gt;</button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'center' }}>
              {/* Doughnut Chart */}
              <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#1a202c' }}>{attendanceTotal > 0 ? `${presentPercent}%` : '—'}</div>
                  <div style={{ fontSize: '10px', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Taux présence</div>
                </div>
              </div>
              
              {/* Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {attendanceData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: '#1a202c', fontWeight: '700' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Absences Card */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1a202c', margin: 0 }}>Dernières absences</h4>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{absentCount} absence(s)</span>
            </div>
            {attendanceTotal === 0 ? (
              <div style={{ color: '#94a3b8', padding: '18px 0' }}>Aucune présence enregistrée ce mois-ci.</div>
            ) : recentAbsences.length === 0 ? (
              <div style={{ color: '#94a3b8', padding: '18px 0' }}>Aucune absence détectée ce mois-ci.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {recentAbsences.map((item, idx) => (
                  <div key={idx} style={{ padding: '14px 16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #eef2f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{item.date}</span>
                      <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>Absent</span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#475569' }}>{item.salle || 'Salle inconnue'}</div>
                    {item.commentaire && <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>{item.commentaire}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Exam Results Table Card */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #edf2f7', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1a202c', margin: 0 }}>Résultats d'évaluations</h4>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}>...</button>
            </div>
            
            {exams.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>Aucune évaluation enregistrée</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #edf2f7' }}>
                    {['Id', 'Type', 'Matière', 'Note', 'Grade', '%', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '14px 8px', fontSize: '13px', color: '#718096', fontWeight: '500' }}>{exam.id}</td>
                      <td style={{ padding: '14px 8px', fontSize: '13px', color: '#2d3748', fontWeight: '600' }}>{exam.type}</td>
                      <td style={{ padding: '14px 8px', fontSize: '13px', color: '#718096', fontWeight: '500' }}>{exam.subject}</td>
                      <td style={{ padding: '14px 8px', fontSize: '13px', color: '#1f2937', fontWeight: '700' }}>{exam.note}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', background: exam.grade.startsWith('A') ? '#ecfdf5' : '#eff6ff', color: exam.grade.startsWith('A') ? '#059669' : '#2563eb' }}>
                          {exam.grade}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px', fontSize: '13px', color: '#2d3748', fontWeight: '700' }}>{exam.percent}</td>
                      <td style={{ padding: '14px 8px', fontSize: '13px', color: '#718096', fontWeight: '500' }}>{exam.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* Right Column: Calendar Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 4: Event Calendar */}
          <div style={{ background: '#3b3d54', borderRadius: '20px', padding: '24px', color: '#ffffff', border: '1px solid #2d2f44', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calendrier</h4>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff' }}>...</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700' }}>
                {calendarMonth.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >&lt;</button>
                <button 
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >&gt;</button>
              </div>
            </div>


            {/* Days of Week */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '8px', marginBottom: '12px' }}>
              {['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'].map(d => (
                <span key={d} style={{ fontSize: '10px', fontWeight: '700', color: '#a0aec0' }}>{d}</span>
              ))}
            </div>

            {/* Calendar Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
              {(() => {
                const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                const lastDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
                const today = new Date();
                const isCurrentMonth = today.getMonth() === calendarMonth.getMonth() && today.getFullYear() === calendarMonth.getFullYear();
                const todayDate = isCurrentMonth ? today.getDate() : -1;
                
                const days = [];
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(<span key={`empty-${i}`} />);
                }
                for (let i = 1; i <= daysInMonth; i++) {
                  const isToday = i === todayDate;
                  days.push(
                    <span
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: isToday ? '#ff9e7d' : 'transparent',
                        color: isToday ? '#3b3d54' : '#ffffff',
                        boxShadow: isToday ? '0 4px 10px rgba(255,158,125,0.4)' : 'none'
                      }}
                    >
                      {i < 10 ? `0${i}` : i}
                    </span>
                  );
                }
                return days;
              })()}
            </div>
          </div>
          
        </div>

      </div>

      {/* Hidden Printable Bulletin for Print View */}
      <div id="printable-bulletin" style={{ display: 'none' }}>
        <PrintableBulletin eleve={eleve} attendance={attendance} />
      </div>

      {/* BulletinViewer Modal */}
      {showBulletin && <BulletinViewer matricule={eleve.matricule} onClose={() => setShowBulletin(false)} />}
    </div>
  );
}

export default function Eleves() {
  const [eleves, setEleves] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', sexe: '1', dateNaissance: '', lieuNaissance: '', langue: 'Francais', idSalle: '', photoURL: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([getElevesAPI(), getSallesAPI()]);
      const rawEleves = Array.isArray(eRes.data) ? eRes.data : [];
      const uniqueEleves = [];
      const seen = new Set();
      rawEleves.forEach((el) => {
        const key = String(el.matricule);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueEleves.push(el);
        }
      });
      setEleves(uniqueEleves);
      setSalles(sRes.data || []);
    } catch(e) { setError('Erreur: ' + (e.response?.data?.error || e.message)); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ nom: '', prenom: '', sexe: '1', dateNaissance: '', lieuNaissance: '', langue: 'Francais', idSalle: '', photoURL: '' }); setError(''); setShowModal(true); };
  const openEdit = (el) => { setEditing(el); setForm({ nom: el.nom, prenom: el.prenom, sexe: String(el.sexe || 1), dateNaissance: el.dateNaissance?.split('T')[0] || '', lieuNaissance: el.lieuNaissance || '', langue: el.langue || 'Francais', idSalle: el.idSalle || '', photoURL: el.photoURL || '' }); setError(''); setSelected(null); setShowModal(true); };

  const openDetail = async (el) => {
    try {
      const res = await getEleveByIdAPI(el.matricule);
      setSelected(res.data);
    } catch(e) { setSelected(el); }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom) { setError('Nom et prénom requis'); return; }
    setError('');
    setIsSaving(true);
    try {
      if (editing) {
        await updateEleveAPI(editing.matricule, { ...form, actif: editing.actif });
        setSuccess('Élève modifié !');
      } else {
        await createEleveAPI(form);
        setSuccess('Élève créé !');
      }
      setShowModal(false);
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch(e) {
      setError(e.response?.data?.error || 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (el) => {
    const action = el.actif ? 'désactiver' : 'réactiver';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${el.prenom} ${el.nom} ?`)) return;
    try {
      if (el.actif) await API.delete(`/eleves/${el.matricule}`);
      else await API.put(`/eleves/${el.matricule}/activate`);
      setSuccess(`Élève ${el.actif ? 'désactivé' : 'réactivé'} !`);
      load(); setTimeout(() => setSuccess(''), 3000);
    } catch(e) { setError(e.response?.data?.error || 'Erreur'); }
  };

  const filtered = eleves.filter(e => {
    const matchSearch = `${e.nom} ${e.prenom} ${e.matricule} ${e.classe || ''} ${e.salle || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || (filterStatut === 'actif' ? e.actif : !e.actif);
    return matchSearch && matchStatut;
  });

  // Show detail page
  if (selected) return (
    <Layout title={`Élève: ${selected.prenom} ${selected.nom}`} subtitle={selected.matricule}>
      {showModal && <Modal title={`Modifier: ${editing?.prenom} ${editing?.nom}`} onClose={() => setShowModal(false)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div><label style={s.label}>Prénom *</label><input style={s.inp} value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
          <div><label style={s.label}>Nom *</label><input style={s.inp} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
          <div><label style={s.label}>Date de naissance</label><input style={s.inp} type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} /></div>
          <div><label style={s.label}>Lieu de naissance</label><input style={s.inp} value={form.lieuNaissance} onChange={e => setForm({ ...form, lieuNaissance: e.target.value })} /></div>
          <div><label style={s.label}>Sexe</label><select style={s.inp} value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })}><option value="1">Masculin</option><option value="2">Féminin</option></select></div>
          <div><label style={s.label}>Langue</label><select style={s.inp} value={form.langue} onChange={e => setForm({ ...form, langue: e.target.value })}><option value="Francais">Français</option><option value="Anglais">Anglais</option><option value="Bilingue">Bilingue</option></select></div>
          <div style={{ gridColumn: '1/-1' }}><label style={s.label}>Salle</label><select style={s.inp} value={form.idSalle} onChange={e => setForm({ ...form, idSalle: e.target.value })}><option value="">-- Sélectionner --</option>{salles.map(sl => <option key={sl.idSalle} value={sl.idSalle}>{sl.libelle} {sl.classe ? `(${sl.classe})` : ''}</option>)}</select></div>
          <div style={{ gridColumn: '1/-1' }}><label style={s.label}>Photo URL</label><input style={s.inp} value={form.photoURL} onChange={e => setForm({ ...form, photoURL: e.target.value })} placeholder="https://exemple.com/photo.jpg" /></div>
        </div>
        {error && <div style={{ marginTop: '12px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowModal(false)} style={s.btn('#64748b', true)}>Annuler</button>
          <button onClick={handleSubmit} style={s.btn('#3b82f6')}>Modifier</button>
        </div>
      </Modal>}
      <div style={{ ...s.card, overflow: 'hidden', background: '#f4f6fb', border: 'none', boxShadow: 'none' }}>
        <FicheEleve eleve={selected} onClose={() => setSelected(null)} onEdit={(el) => { openEdit(el); }} salles={salles} />
      </div>
    </Layout>
  );

  return (
    <Layout title="Élèves">
      <style>{`.row-hover:hover{background:#f8fafc!important;cursor:pointer} .btn-act:hover{opacity:0.8}`}</style>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Élèves</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{eleves.length} élève(s) · {eleves.filter(e => e.actif).length} actif(s)</p>
        </div>
        <button onClick={openAdd} style={s.btn('#0062ff')}><Plus size={15} /> Nouvel élève</button>
      </div>

      {success && <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle size={14} />{success}</div>}
      {error && !showModal && <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}

      {/* Filters */}
      <div style={{ ...s.card, padding: '14px 16px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
          <Search size={16} color="#94a3b8" />
          <input style={{ ...s.inp, border: 'none', padding: '0' }} placeholder="Rechercher par nom, prénom, matricule, salle..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all', 'Tous'], ['actif', 'Actifs'], ['inactif', 'Inactifs']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatut(v)} style={{ padding: '6px 12px', border: `1.5px solid ${filterStatut === v ? '#0062ff' : '#e2e8f0'}`, borderRadius: '20px', background: filterStatut === v ? '#eff6ff' : 'white', color: filterStatut === v ? '#0062ff' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={s.card}>
        {loading ? <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>
          : filtered.length === 0 ? <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}><Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>Aucun élève trouvé</p></div>
            : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                  {['Élève', 'Matricule', 'Classe / Salle', 'Parent', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((el, i) => (
                  <tr key={el.matricule} className="row-hover" style={{ borderBottom: '1px solid #edf2f7', background: i % 2 === 0 ? 'white' : '#fcfdfe' }}>
                    <td style={{ padding: '12px 16px' }} onClick={() => openDetail(el)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Circular Image avatar fallback to Initials */}
                        <AvatarCircle photoURL={el.photoURL} prenom={el.prenom} nom={el.nom} size={38} fallbackFontSize={13} />
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{el.prenom} {el.nom}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{(el.sexe === 1 || el.sexe === '1') ? 'M' : 'F'} · {el.langue || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }} onClick={() => openDetail(el)}>{el.matricule}</td>
                    <td style={{ padding: '12px 16px' }} onClick={() => openDetail(el)}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{el.classe || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{el.salle || 'Salle non assignée'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }} onClick={() => openDetail(el)}>
                      {el.parentNom ? `${el.parentPrenom} ${el.parentNom}` : '—'}
                      {el.parentMobile && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{el.parentMobile}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }} onClick={() => openDetail(el)}><span style={s.badge(el.actif)}>{el.actif ? 'Actif' : 'Inactif'}</span></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-act" onClick={() => openDetail(el)} style={{ padding: '6px', background: '#eff6ff', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#0062ff' }} title="Voir fiche"><Eye size={13} /></button>
                        <button className="btn-act" onClick={() => openEdit(el)} style={{ padding: '6px', background: '#f0fdf4', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }} title="Modifier"><Edit2 size={13} /></button>
                        <button className="btn-act" onClick={() => handleToggle(el)} style={{ padding: '6px', background: el.actif ? '#fef2f2' : '#f0fdf4', border: 'none', borderRadius: '6px', cursor: 'pointer', color: el.actif ? '#ef4444' : '#10b981' }} title={el.actif ? 'Désactiver' : 'Réactiver'}>
                          {el.actif ? <Trash2 size={13} /> : <CheckCircle size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      {showModal && (
        <Modal title={editing ? `Modifier: ${editing.prenom} ${editing.nom}` : 'Nouvel élève'} subtitle="Remplissez les informations de l'élève" onClose={() => setShowModal(false)}>
          {error && <div style={{ marginBottom: '14px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={s.label}>Prénom *</label><input style={s.inp} value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" /></div>
            <div><label style={s.label}>Nom *</label><input style={s.inp} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom de famille" /></div>
            <div><label style={s.label}>Date de naissance</label><input style={s.inp} type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} /></div>
            <div><label style={s.label}>Lieu de naissance</label><input style={s.inp} value={form.lieuNaissance} onChange={e => setForm({ ...form, lieuNaissance: e.target.value })} placeholder="Ex: Yaoundé" /></div>
            <div><label style={s.label}>Sexe</label><select style={s.inp} value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })}><option value="1">Masculin</option><option value="2">Féminin</option></select></div>
            <div><label style={s.label}>Langue</label><select style={s.inp} value={form.langue} onChange={e => setForm({ ...form, langue: e.target.value })}><option value="Francais">Français</option><option value="Anglais">Anglais</option><option value="Bilingue">Bilingue</option></select></div>
            <div style={{ gridColumn: '1/-1' }}><label style={s.label}>Salle / Classe</label><select style={s.inp} value={form.idSalle} onChange={e => setForm({ ...form, idSalle: e.target.value })}><option value="">-- Sélectionner une salle --</option>{salles.map(sl => <option key={sl.idSalle} value={sl.idSalle}>{sl.libelle}{sl.classe ? ` (${sl.classe})` : ''}</option>)}</select></div>
            <div style={{ gridColumn: '1/-1' }}><label style={s.label}>Photo URL</label><input style={s.inp} value={form.photoURL} onChange={e => setForm({ ...form, photoURL: e.target.value })} placeholder="https://exemple.com/photo.jpg" /></div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowModal(false)} style={s.btn('#64748b', true)} disabled={isSaving}>Annuler</button>
            <button onClick={handleSubmit} style={s.btn('#0062ff')} disabled={isSaving}>{isSaving ? 'Enregistrement...' : editing ? 'Modifier' : "Enregistrer l'élève"}</button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
