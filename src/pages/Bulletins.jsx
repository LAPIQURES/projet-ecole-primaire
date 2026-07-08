import React, { useState, useEffect } from 'react';
import { Plus, Download, Eye, Trash2, Check, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import {
  getElevesAPI,
  getAnneesAPI,
  getTrimestresAPI,
  getClassesAPI,
  getSallesAPI,
  getBulletinsByEleveAPI,
  getBulletinDetailAPI,
  createBulletinAPI,
  publishBulletinAPI,
  deleteBulletinAPI,
  generateClassBulletinsAPI
} from '../services/api';

const Bulletins = () => {
  const [bulletins, setBulletins] = useState([]);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [bulletinDetail, setBulletinDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '',
    idAnnee: '',
    idTrimes: '',
    appreciationGeneral: ''
  });
  const [annees, setAnnees] = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Salles filtrées en fonction de la classe sélectionnée
  const filteredSalles = formData.idClasse
    ? salles.filter(s => String(s.idClasse) === String(formData.idClasse))
    : salles;

  useEffect(() => {
    loadEleves();
    loadAnnees();
    loadClassesAndSalles();
  }, []);

  const loadEleves = async () => {
    try {
      const { data } = await getElevesAPI();
      setEleves(Array.isArray(data) ? data : (data.eleves || []));
    } catch (error) {
      console.error('Erreur chargement élèves:', error);
      setError('Erreur chargement des élèves');
      setEleves([]);
    }
  };

  const loadAnnees = async () => {
    try {
      const { data: anneesData } = await getAnneesAPI();
      setAnnees(anneesData.annees || anneesData || []);
      // Charger les trimestres séparément
      try {
        const { data: trimestresData } = await getTrimestresAPI();
        setTrimestres(trimestresData || []);
      } catch (err) {
        console.error('Erreur chargement trimestres:', err);
        setTrimestres(anneesData.trimestres || []);
      }
    } catch (error) {
      console.error('Erreur chargement années:', error);
    }
  };

  const loadClassesAndSalles = async () => {
    try {
      const [{ data: classesData }, { data: sallesData }] = await Promise.all([getClassesAPI(), getSallesAPI()]);
      setClasses(classesData || []);
      setSalles(sallesData || []);
    } catch (err) {
      console.error('Erreur chargement classes/salles', err);
    }
  };

  const handleEleveSelect = async (matricule) => {
    setSelectedEleve(matricule);
    setLoading(true);
    setError(''); // Effacer les erreurs précédentes
    try {
      const { data } = await getBulletinsByEleveAPI(matricule);
      setBulletins(data || []);
    } catch (error) {
      console.error('Erreur chargement bulletins:', error);
      // Ne pas afficher d'erreur si c'est juste qu'il n'y a pas de bulletins
      setBulletins([]);
    }
    setLoading(false);
  };

  const handleViewBulletin = async (idBulletin) => {
    setLoading(true);
    try {
      const { data } = await getBulletinDetailAPI(idBulletin);
      setBulletinDetail(data);
      setSelectedBulletin(idBulletin);
    } catch (error) {
      console.error('Erreur chargement détail bulletin:', error);
      setError('Erreur chargement du bulletin');
    }
    setLoading(false);
  };

  const handleCreateBulletin = async (e) => {
    e.preventDefault();
    if (!formData.matricule || !formData.idAnnee || !formData.idTrimes) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data } = await createBulletinAPI(formData);
      setSuccess('Bulletin créé avec succès');
      handleEleveSelect(formData.matricule);
      setFormData({ matricule: '', idAnnee: '', idTrimes: '', appreciationGeneral: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur création bulletin:', error);
      setError(error.response?.data?.error || 'Erreur création bulletin');
    }
    setLoading(false);
  };

  const handlePrintClass = async () => {
    try {
      if (!formData.idAnnee || !formData.idTrimes || (!formData.idClasse && !formData.idSalle)) {
        setError('Sélectionnez année, trimestre et une classe ou une salle');
        return;
      }
      setError('');
      const response = await generateClassBulletinsAPI({
        idClasse: formData.idClasse || null,
        idSalle: formData.idSalle || null,
        idAnnee: formData.idAnnee,
        idTrimes: formData.idTrimes
      });
      const html = response.data;
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      w.focus();
    } catch (err) {
      console.error('Erreur impression classe', err);
      setError(err.response?.data?.error || 'Erreur impression classe');
    }
  };

  const handlePublishBulletin = async (idBulletin, statut) => {
    try {
      await publishBulletinAPI(idBulletin, statut);
      setSuccess(`Bulletin ${statut}`);
      handleEleveSelect(selectedEleve);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur publication bulletin:', error);
      setError(error.response?.data?.error || 'Erreur publication bulletin');
    }
  };

  const handleDeleteBulletin = async (idBulletin) => {
    if (!window.confirm('Confirmer la suppression?')) return;
    try {
      await deleteBulletinAPI(idBulletin);
      setSuccess('Bulletin supprimé');
      handleEleveSelect(selectedEleve);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur suppression bulletin:', error);
      setError(error.response?.data?.error || 'Erreur suppression bulletin');
    }
  };

  return (
    <Layout title="Gestion des Bulletins">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>📋 Bulletins Scolaires</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0' }}>Créez et gérez les bulletins des élèves</p>
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Formulaire de création */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px' }}>
              ➕ Créer un Bulletin
            </h3>
            <form onSubmit={handleCreateBulletin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Élève *
                </label>
                <select
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {eleves.map((eleve) => (
                    <option key={eleve.matricule} value={eleve.matricule}>
                      {eleve.prenom} {eleve.nom} ({eleve.classe || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Année Académique *
                </label>
                <select
                  value={formData.idAnnee}
                  onChange={(e) => setFormData({ ...formData, idAnnee: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {annees.map((annee) => (
                    <option key={annee.idAnnee} value={annee.idAnnee}>
                      {annee.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Trimestre/Séquence *
                </label>
                <select
                  value={formData.idTrimes}
                  onChange={(e) => setFormData({ ...formData, idTrimes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {trimestres.map((trimestre) => (
                    <option key={trimestre.idTrimes} value={trimestre.idTrimes}>
                      {trimestre.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Classe
                </label>
                <select
                  value={formData.idClasse || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Vérifier si la salle actuelle appartient toujours à la nouvelle classe
                    const newFiltered = val ? salles.filter(s => String(s.idClasse) === String(val)) : salles;
                    const keepSalle = newFiltered.some(s => String(s.idSalle) === String(formData.idSalle));
                    setFormData({ ...formData, idClasse: val, idSalle: keepSalle ? formData.idSalle : '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {classes.map((cl) => (
                    <option key={cl.idClasse} value={cl.idClasse}>{cl.libelle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Salle
                </label>
                <select
                  value={formData.idSalle || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const sel = salles.find(s => String(s.idSalle) === String(val));
                    setFormData({ ...formData, idSalle: val, idClasse: sel ? String(sel.idClasse) : formData.idClasse });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {filteredSalles.map((s) => (
                    <option key={s.idSalle} value={s.idSalle}>{s.libelle} ({s.idClasse || '—'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Appréciation Générale
                </label>
                <textarea
                  value={formData.appreciationGeneral}
                  onChange={(e) => setFormData({ ...formData, appreciationGeneral: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Ajouter une appréciation générale..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} /> {loading ? 'Création...' : 'Créer Bulletin'}
              </button>
            </form>
          </div>

          {/* Liste des élèves */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px' }}>
              👥 Sélectionner un Élève
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {eleves.slice(0, 50).map((eleve) => (
                <button
                  key={eleve.matricule}
                  onClick={() => handleEleveSelect(eleve.matricule)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    marginBottom: '8px',
                    border: selectedEleve === eleve.matricule ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: selectedEleve === eleve.matricule ? '#eff6ff' : '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>
                    {eleve.prenom} {eleve.nom}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {eleve.classe || 'N/A'} • {eleve.matricule}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bulletins de l'élève sélectionné */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px' }}>
              📄 Bulletins
            </h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Chargement...</div>
            ) : bulletins.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Aucun bulletin
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {bulletins.map((bulletin) => (
                  <div
                    key={bulletin.idBulletin}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      border: selectedBulletin === bulletin.idBulletin ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      background: selectedBulletin === bulletin.idBulletin ? '#eff6ff' : '#f9fafb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937', marginBottom: '4px' }}>
                          {bulletin.trimestre}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          {bulletin.annee}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: bulletin.statut === 'publié' ? '#d1fae5' : bulletin.statut === 'finalisé' ? '#fef3c7' : '#f3f4f6',
                          color: bulletin.statut === 'publié' ? '#065f46' : bulletin.statut === 'finalisé' ? '#92400e' : '#4b5563',
                          display: 'inline-block',
                          fontWeight: '500'
                        }}>
                          {bulletin.statut}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6', marginTop: '4px' }}>
                          Moy: {bulletin.moyenneGenerale || 'N/A'}/20
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleViewBulletin(bulletin.idBulletin)}
                          style={{
                            padding: '6px 8px',
                            background: '#eff6ff',
                            color: '#3b82f6',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBulletin(bulletin.idBulletin)}
                          style={{
                            padding: '6px 8px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Détail du bulletin sélectionné */}
        {bulletinDetail && (
          <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  Bulletin - {bulletinDetail.elevePrenom} {bulletinDetail.eleveNom}
                </h2>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  Classe: {bulletinDetail.classe || 'N/A'} • {bulletinDetail.trimestre} {bulletinDetail.annee}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {bulletinDetail.statut === 'brouillon' && (
                  <>
                    <button
                      onClick={() => handlePublishBulletin(bulletinDetail.idBulletin, 'finalisé')}
                      style={{
                        background: '#fbbf24',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Finaliser
                    </button>
                    <button
                      onClick={() => handlePublishBulletin(bulletinDetail.idBulletin, 'publié')}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={14} /> Publier
                    </button>
                  </>
                )}
                <button style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Download size={14} /> Imprimer
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>Moyenne</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#3b82f6' }}>
                  {bulletinDetail.moyenneGenerale || 0}/20
                </div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>Statut</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: bulletinDetail.statut === 'publié' ? '#10b981' : bulletinDetail.statut === 'finalisé' ? '#f59e0b' : '#6b7280'
                }}>
                  {bulletinDetail.statut}
                </div>
              </div>
              <div style={{ background: '#faf5ff', padding: '16px', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '12px', color: '#6b21a8', fontWeight: '600', marginBottom: '4px' }}>Matières</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#8b5cf6' }}>
                  {bulletinDetail.details?.length || 0}
                </div>
              </div>
            </div>

            {/* Tableau des notes */}
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Matière</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Note</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Coeff</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  {bulletinDetail.details && bulletinDetail.details.map((detail, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1f2937' }}>{detail.libelleCours}</td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: detail.note >= 10 ? '#10b981' : detail.note >= 7 ? '#f59e0b' : '#ef4444'
                      }}>
                        {detail.note || 0}/20
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                        {detail.coefficient || 1}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>
                        {detail.appreciation || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Appréciation générale */}
            {bulletinDetail.appreciation && (
              <div style={{
                padding: '16px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                  ✓ Appréciation générale
                </div>
                <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
                  {bulletinDetail.appreciation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bulletins;
