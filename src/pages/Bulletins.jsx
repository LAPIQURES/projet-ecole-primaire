import React, { useState, useEffect } from 'react';
import { Plus, Download, Eye, Trash2, Check, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};


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
  const [eleves, setEleves] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadEleves();
    loadAnnees();
  }, []);

  const loadEleves = async () => {
    try {
      const response = await authFetch('/api/eleves');
      const data = await response.json();
      setEleves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement élèves:', error);
      setError('Erreur chargement des élèves');
    }
  };

  const loadAnnees = async () => {
    try {
      const response = await authFetch('/api/years');
      const data = await response.json();
      setAnnees(data.annees || data || []);
      setTrimestres(data.trimestres || []);
    } catch (error) {
      console.error('Erreur chargement années:', error);
    }
  };

  const handleEleveSelect = async (matricule) => {
    setSelectedEleve(matricule);
    setLoading(true);
    try {
      const response = await authFetch(`/api/bulletins/eleve/${matricule}`);
      const data = await response.json();
      setBulletins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement bulletins:', error);
    }
    setLoading(false);
  };

  const handleViewBulletin = async (idBulletin) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/bulletins/${idBulletin}`);
      const data = await response.json();
      setBulletinDetail(data);
      setSelectedBulletin(idBulletin);
    } catch (error) {
      console.error('Erreur chargement détail bulletin:', error);
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
      const response = await authFetch('/api/bulletins/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Bulletin créé avec succès');
        handleEleveSelect(formData.matricule);
        setFormData({ matricule: '', idAnnee: '', idTrimes: '', appreciationGeneral: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur création bulletin');
      }
    } catch (error) {
      console.error('Erreur création bulletin:', error);
      setError('Erreur création bulletin: ' + error.message);
    }
    setLoading(false);
  };

  const handlePublishBulletin = async (idBulletin, statut) => {
    try {
      const response = await authFetch(`/api/bulletins/${idBulletin}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut })
      });
      if (response.ok) {
        setSuccess(`Bulletin ${statut}`);
        handleEleveSelect(selectedEleve);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Erreur publication bulletin:', error);
      setError('Erreur publication bulletin');
    }
  };

  const handleDeleteBulletin = async (idBulletin) => {
    if (!window.confirm('Confirmer la suppression?')) return;
    try {
      const response = await authFetch(`/api/bulletins/${idBulletin}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Bulletin supprimé');
        handleEleveSelect(selectedEleve);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Erreur suppression bulletin:', error);
      setError('Erreur suppression bulletin');
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
