import React, { useState, useEffect } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { getProfileAPI } from '../services/api';
import { AlertCircle, Edit2, Save } from 'lucide-react';

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getProfileAPI();
      setProfile(data);
      setFormData(data || {});
    } catch (err) {
      setError('Erreur chargement profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout title="Mon profil">
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Chargement...
        </div>
      </TeacherLayout>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <TeacherLayout title="Mon profil" subtitle="Informations personnelles">
      <div style={{ maxWidth: '800px' }}>
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

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              Informations générales
            </h3>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                padding: '8px 12px',
                background: editing ? '#fef3c7' : '#eff6ff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: editing ? '#92400e' : '#0062ff'
              }}
            >
              {editing ? <Save size={14} /> : <Edit2 size={14} />}
              {editing ? 'Enregistrer' : 'Modifier'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Prénom
              </label>
              <input
                type="text"
                value={formData.prenom || user.prenom || ''}
                disabled={!editing}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: editing ? '#fff' : '#f3f4f6',
                  opacity: editing ? 1 : 0.7
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Nom
              </label>
              <input
                type="text"
                value={formData.nom || user.nom || ''}
                disabled={!editing}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: editing ? '#fff' : '#f3f4f6',
                  opacity: editing ? 1 : 0.7
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email || user.email || ''}
                disabled={!editing}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: editing ? '#fff' : '#f3f4f6',
                  opacity: editing ? 1 : 0.7
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                Rôle
              </label>
              <input
                type="text"
                value={user.role || 'Enseignant'}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: '#f3f4f6',
                  opacity: 0.7
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginTop: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px' }}>
            Sécurité
          </h3>
          <button style={{
            padding: '10px 16px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            color: '#0062ff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            Changer le mot de passe
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
}
