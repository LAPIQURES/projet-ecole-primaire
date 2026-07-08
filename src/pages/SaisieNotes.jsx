import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  getElevesAPI,
  getClassesAPI,
  getSallesAPI,
  getTrimestresAPI,
  getAnneesAPI,
  createEvaluationAPI
} from '../services/api';
import { Save, AlertCircle } from 'lucide-react';

const SaisieNotes = () => {
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedSalle, setSelectedSalle] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedTrimes, setSelectedTrimes] = useState('');
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRefs();
  }, []);

  useEffect(() => {
    if (selectedClasse || selectedSalle) {
      loadEleves();
    }
  }, [selectedClasse, selectedSalle]);

  const loadRefs = async () => {
    try {
      const [cRes, sRes, aRes, tRes] = await Promise.all([
        getClassesAPI(),
        getSallesAPI(),
        getAnneesAPI(),
        getTrimestresAPI()
      ]);
      setClasses(Array.isArray(cRes.data) ? cRes.data : []);
      setSalles(Array.isArray(sRes.data) ? sRes.data : []);
      setAnnees(Array.isArray(aRes.data) ? aRes.data : (aRes.data?.annees || []));
      setTrimestres(Array.isArray(tRes.data) ? tRes.data : (tRes.data?.trimestres || []));
    } catch (err) {
      setError('Erreur chargement références');
      console.error(err);
    }
  };

  const loadEleves = async () => {
    setLoading(true);
    try {
      const { data } = await getElevesAPI();
      let filtered = Array.isArray(data) ? data : (data.eleves || []);
      
      // Filtrer par classe si sélectionnée
      if (selectedClasse) {
        filtered = filtered.filter(e => String(e.idClasse) === String(selectedClasse) || String(e.classe) === String(selectedClasse));
      }
      
      // Filtrer par salle si sélectionnée
      if (selectedSalle) {
        filtered = filtered.filter(e => String(e.idSalle) === String(selectedSalle) || String(e.salle) === String(selectedSalle));
      }
      
      setEleves(filtered);
      
      // Initialiser les notes vides
      const notesObj = {};
      filtered.forEach(e => {
        notesObj[e.matricule] = '';
      });
      setNotes(notesObj);
    } catch (err) {
      setError('Erreur chargement élèves');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteChange = (matricule, value) => {
    setNotes({ ...notes, [matricule]: value });
  };

  const handleSave = async () => {
    if (!selectedAnnee || !selectedTrimes) {
      setError('Année et trimestre requis');
      return;
    }

    if (eleves.length === 0) {
      setError('Sélectionnez une classe ou une salle');
      return;
    }

    const notesData = eleves
      .filter(e => notes[e.matricule] && notes[e.matricule].trim() !== '')
      .map(e => ({
        matricule: e.matricule,
        idCours: selectedClasse ? 1 : null, // À améliorer - utiliser le premier cours de la classe
        note: parseFloat(notes[e.matricule]),
        appreciation: generateAppreciation(parseFloat(notes[e.matricule]))
      }));

    if (notesData.length === 0) {
      setError('Entrez au moins une note');
      return;
    }

    setLoading(true);
    setError('');
    let successCount = 0;
    
    try {
      for (const note of notesData) {
        try {
          await createEvaluationAPI(note);
          successCount++;
        } catch (err) {
          console.error(`Erreur pour ${note.matricule}:`, err);
        }
      }
      
      setSuccess(`${successCount}/${notesData.length} note(s) sauvegardée(s)`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Réinitialiser
      setNotes({});
      loadEleves();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAppreciation = (note) => {
    if (note >= 18) return 'Excellent';
    if (note >= 16) return 'Très bon';
    if (note >= 14) return 'Bon';
    if (note >= 12) return 'Passable';
    if (note >= 10) return 'Acceptable';
    return 'Insuffisant';
  };

  const filteredSalles = selectedClasse
    ? salles.filter(s => String(s.idClasse) === String(selectedClasse))
    : salles;

  return (
    <Layout title="Saisie des Notes">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>📝 Saisie des Notes</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0' }}>
            Entrez les notes des élèves pour générer des bulletins
          </p>
        </div>

        {success && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 16px',
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '13px'
          }}>
            ✓ {success}
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: '16px',
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

        {/* Filtres */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
              Classe
            </label>
            <select
              value={selectedClasse}
              onChange={(e) => {
                setSelectedClasse(e.target.value);
                setSelectedSalle('');
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                width: '100%'
              }}
            >
              <option value="">-- Sélectionner classe --</option>
              {classes.map(c => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
              Salle
            </label>
            <select
              value={selectedSalle}
              onChange={(e) => setSelectedSalle(e.target.value)}
              disabled={!selectedClasse}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                width: '100%',
                opacity: !selectedClasse ? 0.5 : 1
              }}
            >
              <option value="">-- Sélectionner salle --</option>
              {filteredSalles.map(s => (
                <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
              Année *
            </label>
            <select
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                width: '100%'
              }}
            >
              <option value="">-- Sélectionner année --</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle || a.annee}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
              Trimestre *
            </label>
            <select
              value={selectedTrimes}
              onChange={(e) => setSelectedTrimes(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                width: '100%'
              }}
            >
              <option value="">-- Sélectionner trimestre --</option>
              {trimestres.map(t => (
                <option key={t.idTrimes} value={t.idTrimes}>{t.libelle || `Trimestre ${t.ordre}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau des élèves */}
        {eleves.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '40px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            Sélectionnez une classe ou une salle pour afficher les élèves
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    Matricule
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    Nom et Prénom
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    Note (0-20)
                  </th>
                </tr>
              </thead>
              <tbody>
                {eleves.map((eleve, idx) => (
                  <tr key={eleve.matricule} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {eleve.matricule}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>
                      {eleve.prenom} {eleve.nom}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={notes[eleve.matricule] || ''}
                        onChange={(e) => handleNoteChange(eleve.matricule, e.target.value)}
                        placeholder="0"
                        style={{
                          width: '80px',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          textAlign: 'center',
                          fontSize: '13px'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{
              padding: '16px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '10px 18px',
                  background: loading ? '#fbbf24' : '#0062ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} /> {loading ? 'Sauvegarde...' : 'Sauvegarder les notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SaisieNotes;
