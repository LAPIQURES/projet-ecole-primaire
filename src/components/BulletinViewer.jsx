import React, { useState, useEffect } from 'react';
import { Download, X, ChevronDown, ChevronUp } from 'lucide-react';

const BulletinViewer = ({ matricule, onClose }) => {
  const [bulletins, setBulletins] = useState([]);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [bulletinDetail, setBulletinDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBulletins();
  }, [matricule]);

  const loadBulletins = async () => {
    try {
      const response = await fetch(`/api/bulletins/eleve/${matricule}`);
      if (!response.ok) throw new Error('Erreur chargement bulletins');
      const data = await response.json();
      setBulletins(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const loadBulletinDetail = async (idBulletin) => {
    try {
      const response = await fetch(`/api/bulletins/${idBulletin}`);
      if (!response.ok) throw new Error('Erreur chargement détail');
      const data = await response.json();
      setBulletinDetail(data);
      setSelectedBulletin(idBulletin);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'publié': return '#10b981';
      case 'finalisé': return '#f59e0b';
      case 'brouillon': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const handlePrint = () => {
    if (bulletinDetail) {
      window.print();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>📋 Bulletins</h2>
          <button onClick={onClose} style={{
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px'
          }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              Chargement des bulletins...
            </div>
          ) : bulletins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              Aucun bulletin disponible pour cet élève
            </div>
          ) : (
            <div>
              {/* Liste des bulletins */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {bulletins.map((bulletin) => (
                  <div
                    key={bulletin.idBulletin}
                    onClick={() => loadBulletinDetail(bulletin.idBulletin)}
                    style={{
                      padding: '16px',
                      border: selectedBulletin === bulletin.idBulletin ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: selectedBulletin === bulletin.idBulletin ? '#eff6ff' : '#f9fafb',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {bulletin.trimestre}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      {bulletin.annee}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: getStatusColor(bulletin.statut),
                      color: 'white',
                      display: 'inline-block'
                    }}>
                      {bulletin.statut}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6', marginTop: '8px' }}>
                      Moy: {bulletin.moyenneGenerale || 'N/A'}/20
                    </div>
                  </div>
                ))}
              </div>

              {/* Détail du bulletin sélectionné */}
              {bulletinDetail && (
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  background: '#f9fafb',
                  marginTop: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 4px'
                      }}>
                        Bulletin - {bulletinDetail.elevePrenom} {bulletinDetail.eleveNom}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {bulletinDetail.trimestre} {bulletinDetail.annee} | {bulletinDetail.classe || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={handlePrint}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      <Download size={16} /> Imprimer
                    </button>
                  </div>

                  {/* Statistiques */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Moyenne</div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: '#3b82f6' }}>
                        {bulletinDetail.moyenneGenerale || 0}/20
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Rang</div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: '#059669' }}>
                        {bulletinDetail.rang || '—'}{bulletinDetail.rang === 1 ? 'er' : bulletinDetail.rang ? 'ème' : ''} <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '400' }}>/ {bulletinDetail.effectifClasse || '—'}</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Moy. Classe</div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: '#d97706' }}>
                        {bulletinDetail.moyenneClasse || '—'}/20
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Statut</div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: getStatusColor(bulletinDetail.statut)
                      }}>
                        {bulletinDetail.statut}
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Matières</div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: '#10b981' }}>
                        {bulletinDetail.details?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Tableau des notes */}
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase'
                          }}>Matière</th>
                          <th style={{
                            padding: '12px',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase'
                          }}>Note</th>
                          <th style={{
                            padding: '12px',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase'
                          }}>Coeff</th>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase'
                          }}>Appréciation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulletinDetail.details && bulletinDetail.details.map((detail, idx) => (
                          <tr key={idx} style={{
                            borderBottom: idx < bulletinDetail.details.length - 1 ? '1px solid #f3f4f6' : 'none',
                            background: idx % 2 === 0 ? '#ffffff' : '#fafbfc'
                          }}>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#1f2937' }}>
                              {detail.libelleCours}
                            </td>
                            <td style={{
                              padding: '12px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: detail.note >= 10 ? '#10b981' : detail.note >= 7 ? '#f59e0b' : '#ef4444'
                            }}>
                              {detail.note}/20
                            </td>
                            <td style={{
                              padding: '12px',
                              textAlign: 'center',
                              fontSize: '13px',
                              color: '#6b7280'
                            }}>
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
                      marginTop: '20px',
                      padding: '16px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        ✓ Appréciation générale
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: '1.6'
                      }}>
                        {bulletinDetail.appreciation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulletinViewer;
