import React, { useState, useEffect } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import {
  getAnneesAPI,
  getTrimestresAPI,
  getClassesAPI,
  getSallesAPI,
  generateClassBulletinsAPI
} from '../services/api';

const Bulletins = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    idAnnee: '',
    idTrimes: '',
    idClasse: '',
    idSalle: ''
  });
  const [annees, setAnnees] = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const filteredSalles = formData.idClasse
    ? salles.filter((s) => String(s.idClasse) === String(formData.idClasse))
    : salles;

  useEffect(() => {
    loadAnnees();
    loadClassesAndSalles();
  }, []);

  const loadAnnees = async () => {
    try {
      const { data: anneesData } = await getAnneesAPI();
      setAnnees(anneesData.annees || anneesData || []);
      const { data: trimestresData } = await getTrimestresAPI();
      setTrimestres(trimestresData || []);
    } catch (err) {
      console.error('Erreur chargement années/trimestres:', err);
      setError('Impossible de charger les années ou trimestres');
    }
  };

  const loadClassesAndSalles = async () => {
    try {
      const [{ data: classesData }, { data: sallesData }] = await Promise.all([
        getClassesAPI(),
        getSallesAPI()
      ]);
      setClasses(classesData || []);
      setSalles(sallesData || []);
    } catch (err) {
      console.error('Erreur chargement classes/salles:', err);
      setError('Impossible de charger les classes ou les salles');
    }
  };

  const handlePrintClass = async () => {
    if (!formData.idAnnee || !formData.idTrimes || (!formData.idClasse && !formData.idSalle)) {
      setError('Sélectionnez une année, un trimestre et une classe ou une salle.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await generateClassBulletinsAPI({
        idClasse: formData.idClasse || null,
        idSalle: formData.idSalle || null,
        idAnnee: formData.idAnnee,
        idTrimes: formData.idTrimes
      });

      const html = response.data;
      const w = window.open('', '_blank');
      if (!w) {
        throw new Error('Impossible d’ouvrir une nouvelle fenêtre pour l’impression.');
      }

      w.document.write(html);
      w.document.close();
      w.focus();
      setSuccess('Bulletins générés. Utilisez le dialogue d’impression du navigateur.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Erreur impression classe', err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de la génération des bulletins');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Bulletins scolaires">
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px', color: '#111827' }}>Bulletins scolaires</h1>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
            Impression des bulletins pour une classe ou une salle entière. La génération de bulletins individuels a été retirée.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#14532d' }}>
            {success}
          </div>
        )}

        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '28px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>Générer le bulletin de classe / salle</h2>

          <form onSubmit={(e) => { e.preventDefault(); handlePrintClass(); }}>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Année scolaire</label>
                <select
                  value={formData.idAnnee}
                  onChange={(e) => setFormData({ ...formData, idAnnee: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#f8fafc', fontSize: '14px' }}
                >
                  <option value="">Sélectionnez</option>
                  {annees.map((annee) => (
                    <option key={annee.idAnnee} value={annee.idAnnee}>{annee.libelle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Trimestre</label>
                <select
                  value={formData.idTrimes}
                  onChange={(e) => setFormData({ ...formData, idTrimes: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#f8fafc', fontSize: '14px' }}
                >
                  <option value="">Sélectionnez</option>
                  {trimestres.map((trim) => (
                    <option key={trim.idTrimes} value={trim.idTrimes}>{trim.libelle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Classe</label>
                <select
                  value={formData.idClasse}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newFiltered = value ? salles.filter((s) => String(s.idClasse) === String(value)) : salles;
                    const keepSalle = newFiltered.some((s) => String(s.idSalle) === String(formData.idSalle));
                    setFormData({
                      ...formData,
                      idClasse: value,
                      idSalle: keepSalle ? formData.idSalle : ''
                    });
                  }}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#f8fafc', fontSize: '14px' }}
                >
                  <option value="">Aucun</option>
                  {classes.map((classe) => (
                    <option key={classe.idClasse} value={classe.idClasse}>{classe.libelle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Salle</label>
                <select
                  value={formData.idSalle}
                  onChange={(e) => {
                    const value = e.target.value;
                    const salle = salles.find((s) => String(s.idSalle) === String(value));
                    setFormData({
                      ...formData,
                      idSalle: value,
                      idClasse: salle ? String(salle.idClasse) : formData.idClasse
                    });
                  }}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#f8fafc', fontSize: '14px' }}
                >
                  <option value="">Aucune</option>
                  {filteredSalles.map((salle) => (
                    <option key={salle.idSalle} value={salle.idSalle}>{salle.libelle}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading ? '#94a3b8' : '#2563eb',
                  color: 'white',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                <Download size={18} />
                {loading ? 'Génération...' : 'Imprimer les bulletins'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Bulletins;
