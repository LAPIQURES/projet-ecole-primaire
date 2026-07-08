import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Calendar, Clock, DoorOpen } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';
import { getTeacherScheduleAPI } from '../services/api';

export default function TeacherSchedule() {
  const [emplois, setEmplois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getTeacherScheduleAPI();
      setEmplois(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const DAYS = [
    { value: 1, short: 'Lun', label: 'Lundi' },
    { value: 2, short: 'Mar', label: 'Mardi' },
    { value: 3, short: 'Mer', label: 'Mercredi' },
    { value: 4, short: 'Jeu', label: 'Jeudi' },
    { value: 5, short: 'Ven', label: 'Vendredi' },
  ];

  const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);

  const mySchedule = useMemo(() => {
    return Array.isArray(emplois) ? emplois : [];
  }, [emplois]);

  const myClasses = useMemo(() => {
    const classNames = new Set();
    for (const item of mySchedule) {
      if (item.classe) classNames.add(item.classe);
    }
    return Array.from(classNames);
  }, [mySchedule]);

  const mySalles = useMemo(() => {
    const salleNames = new Set();
    for (const item of mySchedule) {
      if (item.libelleSalle) salleNames.add(item.libelleSalle);
    }
    return Array.from(salleNames);
  }, [mySchedule]);

  const getScheduleForSlot = (day, hour) => {
    const normalizeDay = (d) => {
      if (d == null) return 0;
      const n = Number(d);
      if (!Number.isNaN(n)) return n;
      const s = String(d).toLowerCase().slice(0, 3);
      switch (s) {
        case 'lun': return 1;
        case 'mar': return 2;
        case 'mer': return 3;
        case 'jeu': return 4;
        case 'ven': return 5;
        default: return 0;
      }
    };

    return mySchedule.find((s) => {
      const dayNum = normalizeDay(s.jour ?? s.dayOfWeek ?? s.day ?? s.day_of_week);
      const schedHour = parseInt(String(s.heure || s.startTime || s.time || '').split(':')[0]);
      return dayNum === day && schedHour === hour;
    });
  };

  if (loading) {
    return (
      <TeacherLayout title="Emploi du temps" subtitle="Votre planning de la semaine">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #dbeafe', borderTopColor: '#0062ff', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Chargement de votre emploi du temps…
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="Emploi du temps" subtitle="Votre planning de la semaine">
      <style>{`
        .schedule-grid { display: grid; grid-template-columns: 80px repeat(5, 1fr); gap: 1px; background: #e2e8f0; padding: 1px; }
        .schedule-cell { background: white; padding: 12px; text-align: center; font-size: 12px; }
        .schedule-header { background: #0062ff; color: white; font-weight: 800; padding: 12px; }
        .schedule-hour { background: #f1f5f9; font-weight: 700; color: #64748b; }
        .schedule-empty { background: #fafbfc; }
        .schedule-item { background: linear-gradient(135deg, #0062ff, #0047a3); color: white; padding: 8px; border-radius: 6px; font-weight: 700; font-size: 11px; line-height: 1.3; }
        @media (max-width: 1024px) { .schedule-grid { grid-template-columns: 70px repeat(2, 1fr); } }
      `}</style>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {mySchedule.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Calendar size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <div style={{ fontSize: 14 }}>Aucun cours trouvé pour votre emploi du temps</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Résumé */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>TOTAL COURS</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{mySchedule.length}</div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>MES CLASSES</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0062ff' }}>{myClasses.length}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                {myClasses.join(', ') || '—'}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>MES SALLES</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffa000' }}>{mySalles.length}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                {mySalles.join(', ') || '—'}
              </div>
            </div>
          </div>

          {/* Grille hebdomadaire */}
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            <div className="schedule-grid">
              <div className="schedule-cell schedule-header">Heure</div>
              {DAYS.map((day) => (
                <div
                  key={day.value}
                  className="schedule-cell schedule-header"
                >
                  {day.short}
                </div>
              ))}

              {HOURS.map((hour) => (
                <React.Fragment key={`hour-${hour}`}>
                  <div className="schedule-cell schedule-hour">{String(hour).padStart(2, '0')}:00</div>
                  {DAYS.map((day) => {
                    const item = getScheduleForSlot(day.value, hour);
                    return (
                      <div
                        key={`${day.value}-${hour}`}
                        className={`schedule-cell ${item ? '' : 'schedule-empty'}`}
                      >
                        {item && (
                          <div className="schedule-item" title={item.libelleCours || item.subject || item.libelle || 'Cours'}>
                            <div style={{ fontWeight: 900, marginBottom: 4 }}>{item.libelleCours || item.subject || item.libelle || 'Cours'}</div>
                            <div style={{ fontSize: 10, opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <DoorOpen size={10} />
                              {item.libelleSalle || item.salle || 'Salle'}
                            </div>
                            {item.classe && (
                              <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>
                                {item.classe}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Détails des cours */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Détails de mes cours</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {mySchedule.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    background: 'white',
                    borderRadius: 10,
                    padding: 14,
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>COURS</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                      {item.libelleCours || item.subject || item.libelle || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>JOUR</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0062ff', marginTop: 4 }}>
                      {(() => {
                        const val = item.jour ?? item.dayOfWeek ?? item.day;
                        const n = Number(val);
                        if (!Number.isNaN(n)) return DAYS.find(d => d.value === n)?.label || '—';
                        const s = String(val || '').toLowerCase().slice(0,3);
                        const map = { lun: 'Lundi', mar: 'Mardi', mer: 'Mercredi', jeu: 'Jeudi', ven: 'Vendredi' };
                        return map[s] || (val ? String(val) : '—');
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>HEURE</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} />
                      {item.heure || item.startTime || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>CLASSE</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                      {item.classe || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>SALLE</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#ffa000', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <DoorOpen size={14} />
                      {item.libelleSalle || item.salle || '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
