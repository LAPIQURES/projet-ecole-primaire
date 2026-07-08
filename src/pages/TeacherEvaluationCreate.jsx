import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';
import { getTeacherClassesSallesAPI, createEvaluationProgrammeAPI } from '../services/api';

export default function TeacherEvaluationCreate() {
  const [form, setForm] = useState({
    classe: '',
    salle: '',
    cours: '',
    date: '',
    type: 'evaluation'
  });
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getTeacherClassesSallesAPI();
      const data = res.data;
      setClasses(data.classes || []);
      setSalles(data.salles || []);
      setCours(data.cours || []);
    } catch (err) {
      console.error('Erreur chargement données', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.classe || !form.salle || !form.cours || !form.date) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const parsedClasse = Number.isFinite(Number(form.classe)) ? parseInt(form.classe, 10) : null;
      const parsedSalle = Number.isFinite(Number(form.salle)) ? parseInt(form.salle, 10) : null;
      const parsedCours = Number.isFinite(Number(form.cours)) ? parseInt(form.cours, 10) : null;

      if (!parsedSalle) {
        setError('Veuillez sélectionner une salle valide');
        setLoading(false);
        return;
      }

      await createEvaluationProgrammeAPI({
        libelle: `Évaluation ${form.type === 'evaluation' ? 'de cours' : form.type}`,
        classe: parsedClasse,
        idSalle: parsedSalle,
        cours_id: parsedCours,
        date: form.date,
        type: form.type,
        description: 'Programmée par l’enseignant'
      });

      setSuccess('Évaluation créée avec succès');
      setForm({ classe: '', salle: '', cours: '', date: '', type: 'evaluation' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout title="Évaluations" subtitle="Programmer une nouvelle évaluation">
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

      {success && (
        <div style={{
          marginBottom: '20px',
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

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        maxWidth: '600px'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Classe *
            </label>
            <select
              name="classe"
              value={form.classe}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
                    <option value="">Sélectionner une classe</option>
              {classes.map((c) => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Salle *
            </label>
            <select
              name="salle"
              value={form.salle}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="">Sélectionner une salle</option>
              {salles.map(s => (
                <option key={s.idSalle} value={s.idSalle}>
                  {s.libelleSalle || s.libelle}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Cours *
            </label>
            <select
              name="cours"
              value={form.cours}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="">Sélectionner un cours</option>
              {cours.map((c) => (
                <option key={c.idCours} value={c.idCours}>
                  {c.libelleCours}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Date de l'évaluation *
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Type d'évaluation
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="evaluation">Évaluation</option>
              <option value="interrogation">Interrogation</option>
              <option value="examen">Examen</option>
              <option value="controle">Contrôle</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: loading ? '#d1d5db' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'default' : 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {loading ? 'Création...' : 'Créer l\'évaluation'}
          </button>
        </form>
      </div>
    </TeacherLayout>
  );
}
