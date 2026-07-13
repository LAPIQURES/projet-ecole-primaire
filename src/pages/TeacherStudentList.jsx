import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';
import { getElevesAPI, getTeacherStudentsAPI, getTeacherClassesSallesAPI, createEvaluationAPI } from '../services/api';

export default function TeacherStudentList() {
  const [students, setStudents] = useState([]);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [noteForm, setNoteForm] = useState({});

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    setError('');
    try {
      const [studentsRes, classesSallesRes] = await Promise.all([
        getTeacherStudentsAPI(),
        getTeacherClassesSallesAPI()
      ]);

      const teacherStudentData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setTeacherStudents(teacherStudentData);
      setStudents(teacherStudentData);

      const classesData = Array.isArray(classesSallesRes.data?.classes)
        ? classesSallesRes.data.classes
        : [];
      const roomsData = Array.isArray(classesSallesRes.data?.salles)
        ? classesSallesRes.data.salles
        : [];

      setClasses(classesData);
      setRooms(roomsData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async (classeId) => {
    try {
      const res = await getElevesAPI({ classe: classeId });
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading class students:', err);
      setStudents([]);
      setError(err.response?.data?.error || err.message || 'Erreur lors du chargement des élèves');
    }
  };

  const handleSaveNote = async (matricule) => {
    const noteValue = noteForm[matricule];
    if (!noteValue && noteValue !== 0) {
      setError('Entrez une note avant d’enregistrer');
      return;
    }

    const parsedNote = Number(noteValue);
    if (Number.isNaN(parsedNote) || parsedNote < 0 || parsedNote > 20) {
      setError('La note doit être un nombre entre 0 et 20');
      return;
    }

    try {
      await createEvaluationAPI({ matricule, note: parsedNote, appreciation: 'Enregistrée par l’enseignant' });
      setNoteForm({ ...noteForm, [matricule]: '' });
      setSuccess(`Note enregistrée pour ${matricule}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const filteredStudents = students.filter((student) => {
    if (selectedClass && String(student.idClasse) !== String(selectedClass)) return false;
    if (selectedRoom && (student.salle || student.libelleSalle || '') !== selectedRoom) return false;
    return true;
  });

  const groupedByClass = filteredStudents.reduce((acc, student) => {
    const classKey = student.classe || 'Non défini';
    if (!acc[classKey]) acc[classKey] = [];
    acc[classKey].push(student);
    return acc;
  }, {});

  return (
    <TeacherLayout>
      <div style={{ padding: '24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            Chargement...
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', color: '#065f46' }}>
            {success}
          </div>
        )}

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Classe
            </label>
            <select
              value={selectedClass}
              onChange={async (e) => {
                const value = e.target.value;
                setSelectedClass(value);
                setSelectedRoom('');
                if (value) {
                  await loadClassStudents(value);
                } else {
                  setStudents(teacherStudents);
                }
              }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Salle
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
            >
              <option value="">Toutes les salles</option>
              {rooms.map((room) => (
                <option key={room.idSalle} value={room.libelleSalle || room.libelle}>{room.libelleSalle || room.libelle}</option>
              ))}
            </select>
          </div>
        </div>

        {!loading && filteredStudents.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Aucun élève trouvé pour les filtres sélectionnés.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {Object.entries(groupedByClass).map(([className, list]) => (
              <div key={className} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', fontWeight: 700 }}>
                  {className} — {list.length} élève(s)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Élève</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Matricule</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Salle</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Saisir une note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((student, idx) => (
                      <tr key={student.matricule || idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '500', color: '#0f172a' }}>{student.prenom} {student.nom}</td>
                        <td style={{ padding: '12px 16px', color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>{student.matricule}</td>
                        <td style={{ padding: '12px 16px', color: '#4b5563' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', background: '#eff6ff', color: '#0062ff', borderRadius: '6px', fontSize: '12px' }}>
                            {student.salle || student.libelleSalle || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              placeholder="0-20"
                              value={noteForm[student.matricule] || ''}
                              onChange={(e) => setNoteForm({ ...noteForm, [student.matricule]: e.target.value })}
                              style={{ width: '60px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                            />
                            <button
                              onClick={() => handleSaveNote(student.matricule)}
                              style={{ padding: '6px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                            >
                              Enreg.
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
