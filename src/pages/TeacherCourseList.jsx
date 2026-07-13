import React, { useState, useEffect } from 'react';
import { AlertCircle, Filter } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';
import { getTeacherCoursesAPI } from '../services/api';

export default function TeacherCourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
    setLoading(true);
    try {
      const res = await getTeacherCoursesAPI();
      const data = res.data;
      setCourses(Array.isArray(data) ? data : []);
      
      // Extraire les classes uniques
      const uniqueClasses = [...new Set(data.map(c => c.classe || c.libelle))];
      setClasses(uniqueClasses);
      
      if (uniqueClasses.length > 0) setSelectedClass(uniqueClasses[0]);
    } catch (err) {
      setError(err.message || 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = selectedClass 
    ? courses.filter(c => (c.classe || c.libelle) === selectedClass)
    : courses;

  const courseStats = {
    total: filteredCourses.length,
    byRoom: [...new Set(filteredCourses.map(c => c.salle || c.libelleSalle))].length,
    hours: filteredCourses.length > 0 ? `${Math.min(...filteredCourses.map(c => c.heure || '07:00'))} - ${Math.max(...filteredCourses.map(c => c.fin_heure || '17:00'))}` : '—'
  };

  if (loading) {
    return (
      <TeacherLayout title="Mes cours">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          Chargement de vos cours...
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="Mes cours" subtitle={`${courseStats.total} cours planifiés`}>
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '13px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>Aucun cours assigné</div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0062ff' }}>
                {courseStats.total}
              </div>
              <div style={{ fontSize: '12px', color: '#0b5ed7', marginTop: '4px' }}>Cours cette semaine</div>
            </div>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>
                {courseStats.byRoom}
              </div>
              <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>Salles différentes</div>
            </div>
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400e' }}>
                {courseStats.hours}
              </div>
              <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px' }}>Plage horaire</div>
            </div>
          </div>

          {/* Filtre par classe */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <Filter size={16} color="#6b7280" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <option value="">Tous les cours</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tableau des cours */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Cours</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Classe</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Salle</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Horaire</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Élèves</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, idx) => (
                  <tr key={idx} style={{
                    borderBottom: '1px solid #e5e7eb',
                    background: idx % 2 === 0 ? '#fff' : '#f9fafb'
                  }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#0f172a' }}>
                      {course.libelleCours || course.cours || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                      {course.classe || course.libelle || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: '#eff6ff',
                        color: '#0062ff',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {course.salle || course.libelleSalle || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4b5563', fontWeight: '500' }}>
                      {course.heure || '07:00'} - {course.fin_heure || '17:00'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600' }}>
                      {course.nbEleves || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </TeacherLayout>
  );
}
