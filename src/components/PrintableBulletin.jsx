import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PrintableBulletin = ({ eleve }) => {
  if (!eleve) return null;

  // Calcul de la progression basé sur les vraies notes
  const averageNote = eleve.evaluations && eleve.evaluations.length > 0
    ? (eleve.evaluations.reduce((sum, ev) => sum + (ev.note || 0), 0) / eleve.evaluations.length)
    : 0;
  const progression = Math.round((averageNote / 20) * 100);

  // Données pour graphique LineChart
  const evolutionData = eleve.evaluations && eleve.evaluations.length > 0
    ? eleve.evaluations.map((ev, idx) => ({
        name: `Éval ${idx + 1}`,
        note: parseFloat(ev.note || 0),
        cours: ev.cours || 'Cours'
      }))
    : [];

  // Données par matière (BarChart)
  const subjectStats = eleve.evaluations && eleve.evaluations.length > 0
    ? eleve.evaluations.reduce((acc, ev) => {
        const subject = ev.cours || 'Cours';
        const existing = acc.find(s => s.subject === subject);
        if (existing) {
          existing.notes.push(ev.note || 0);
          existing.moyenne = (existing.notes.reduce((a, b) => a + b, 0) / existing.notes.length).toFixed(2);
          existing.count = existing.notes.length;
        } else {
          acc.push({
            subject,
            moyenne: parseFloat(ev.note || 0).toFixed(2),
            notes: [ev.note || 0],
            count: 1
          });
        }
        return acc;
      }, [])
    : [];

  // Parent names
  const fatherName = eleve.parents && eleve.parents.length > 0
    ? `${eleve.parents[0].prenom} ${eleve.parents[0].nom}`
    : 'Non spécifié';
  const motherName = eleve.parents && eleve.parents.length > 1
    ? `${eleve.parents[1].prenom} ${eleve.parents[1].nom}`
    : 'Non spécifié';

  // Attendance stats
  const attendanceData = [
    { name: 'Présent', value: 72, color: '#0062ff' },
    { name: 'Demi-journée', value: 15, color: '#7fb0ff' },
    { name: 'Retard', value: 8, color: '#ffa000' },
    { name: 'Absent', value: 5, color: '#ffb74d' }
  ];

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      color: '#333',
      maxWidth: '100%'
    }}>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-break { page-break-after: always; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .page-header { border-bottom: 3px solid #0062ff; padding-bottom: 16px; margin-bottom: 24px; }
        }
        @page { size: A4; margin: 1cm; }
      `}</style>

      {/* PAGE 1: HEADER & PERSONAL INFO */}
      <div style={{ padding: '40px', background: '#f8fafc', pageBreakAfter: 'always' }}>
        {/* School Header */}
        <div style={{ 
          borderBottom: '3px solid #0062ff', 
          paddingBottom: '16px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#0062ff', margin: '0 0 8px', fontSize: '28px', fontWeight: 'bold' }}>ÉcoleGest</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Bulletin d'Études Semestriel</p>
        </div>

        {/* Student Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          {/* Left: Student Details */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#0062ff' }}>Données Étudiant</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', width: '40%' }}>Nom Complet:</td>
                  <td style={{ padding: '8px' }}>{eleve.prenom} {eleve.nom}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Matricule:</td>
                  <td style={{ padding: '8px' }}>{eleve.matricule}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Classe:</td>
                  <td style={{ padding: '8px' }}>{eleve.classe || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Salle:</td>
                  <td style={{ padding: '8px' }}>{eleve.salle || '—'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Sexe:</td>
                  <td style={{ padding: '8px' }}>{(eleve.sexe === 1 || eleve.sexe === '1') ? 'Masculin' : 'Féminin'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Date de Naissance:</td>
                  <td style={{ padding: '8px' }}>
                    {eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Parent Info */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#0062ff' }}>Responsables</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', width: '40%' }}>Père:</td>
                  <td style={{ padding: '8px' }}>{fatherName}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Mère:</td>
                  <td style={{ padding: '8px' }}>{motherName}</td>
                </tr>
                {eleve.parents && eleve.parents.length > 0 && (
                  <>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>Téléphone:</td>
                      <td style={{ padding: '8px' }}>{eleve.parents[0].mobile || '—'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>Email:</td>
                      <td style={{ padding: '8px', fontSize: '12px', wordBreak: 'break-all' }}>
                        {eleve.parents[0].email || eleve.parents[0].username || '—'}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #0062ff' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0062ff' }}>{eleve.evaluations?.length || 0}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Évaluations</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #10b981' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{progression}%</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Progression</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #f59e0b' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{averageNote.toFixed(2)}/20</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Moyenne</div>
          </div>
        </div>
      </div>

      {/* PAGE 2: RESULTS & CHARTS */}
      {evolutionData.length > 0 && (
        <div style={{ padding: '40px', background: '#f8fafc', pageBreakAfter: 'always' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0062ff', borderBottom: '2px solid #0062ff', paddingBottom: '8px' }}>
            Résultats par Évaluation
          </h2>

          <div style={{ marginBottom: '32px', height: '300px' }}>
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

          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0062ff', borderBottom: '2px solid #0062ff', paddingBottom: '8px' }}>
            Moyennes par Matière
          </h2>

          <div style={{ marginBottom: '32px', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 20]} />
                <Tooltip formatter={(value) => `${value}/20`} />
                <Bar dataKey="moyenne" fill="#0062ff" name="Moyenne" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Scores Table */}
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>Détail des Évaluations</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#0062ff', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Matière</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Note</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>%</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Grade</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {eleve.evaluations && eleve.evaluations.map((ev, idx) => {
                const grade = ev.note >= 16 ? 'A+' : ev.note >= 14 ? 'A' : ev.note >= 12 ? 'B' : ev.note >= 10 ? 'C' : 'F';
                const percent = Math.round((ev.note / 20) * 100);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd', background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '10px', fontSize: '12px' }}>{ev.cours || 'Cours'}</td>
                    <td style={{ padding: '10px', fontSize: '12px', fontWeight: 'bold' }}>{ev.note.toFixed(2)}/20</td>
                    <td style={{ padding: '10px', fontSize: '12px' }}>{percent}%</td>
                    <td style={{ padding: '10px', fontSize: '12px', background: grade.startsWith('A') ? '#d1fae5' : '#dbeafe', fontWeight: 'bold' }}>{grade}</td>
                    <td style={{ padding: '10px', fontSize: '12px' }}>
                      {ev.created_at ? new Date(ev.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGE 3: ATTENDANCE */}
      <div style={{ padding: '40px', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0062ff', borderBottom: '2px solid #0062ff', paddingBottom: '8px' }}>
          Présences
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'center' }}>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label
                >
                  {attendanceData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {attendanceData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{item.value}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '16px', borderTop: '1px solid #ddd', textAlign: 'center', fontSize: '11px', color: '#999' }}>
          <p style={{ margin: '0' }}>Bulletin généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
          <p style={{ margin: '4px 0 0' }}>© 2026 ÉcoleGest - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableBulletin;
