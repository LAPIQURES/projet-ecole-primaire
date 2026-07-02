import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, User, Building, BookOpen } from 'lucide-react'
import { signupAPI } from '../services/api'

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState(null)
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', specialite: '', nomEnfant: '', etablissement: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const styles = {
    header: { background: '#374151', color: 'white', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    container: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)' },
    card: { width: '100%', maxWidth: 520, border: '1px solid #e6eef8', borderRadius: 12, padding: 20, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' },
    title: { fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#0f172a' },
    subtitle: { color: '#6b7280', marginBottom: 12 },
    roleBtn: (bg) => ({ width: '100%', padding: 16, border: '1px solid #e6eef8', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', background: bg }),
    input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', fontSize: 14, boxSizing: 'border-box' },
    btnPrimary: { flex: 1, padding: 12, background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
    btnOutline: { flex: 1, padding: 12, background: '#fff', color: '#1f2937', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' },
  }

  const handleRoleSelect = (selectedRole) => { setRole(selectedRole); setStep(2); setError('') }
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); setError('') }

  const validateStep2 = () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) { setError('Veuillez remplir tous les champs obligatoires'); return false }
    if (role === 'enseignant' && !formData.specialite) { setError('Veuillez spécifier votre spécialité'); return false }
    if (role === 'parent' && !formData.nomEnfant) { setError('Veuillez entrer le nom de votre enfant'); return false }
    if (role === 'administrateur' && !formData.etablissement) { setError('Veuillez entrer le nom de l\'établissement'); return false }
    return true
  }

  const validateStep3 = () => {
    if (!formData.password || !formData.confirmPassword) { setError('Veuillez remplir les champs mot de passe'); return false }
    if (formData.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return false }
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 2) { if (!validateStep2()) return; setStep(3); return }
    if (step === 3) {
      if (!validateStep3()) return
      setIsLoading(true)
      try {
        await signupAPI({ role, nom: formData.nom, prenom: formData.prenom, username: formData.email, email: formData.email, password: formData.password, mobile: formData.telephone, phone: formData.telephone, specialite: formData.specialite, nomEnfant: formData.nomEnfant, etablissement: formData.etablissement })
        setSuccessMessage(`Compte créé avec succès ! Vous pouvez maintenant vous connecter en tant que ${role}.`)
        setTimeout(() => navigate('/login'), 1600)
      } catch (err) { setError(err.response?.data?.error || 'Erreur lors de la création du compte') } finally { setIsLoading(false) }
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>← Retour</button>
          <span style={{ fontSize: 13, fontWeight: 600 }}>S'inscrire</span>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Français ▼</button>
      </div>

      <div style={styles.container}>
        <div style={styles.card}>
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={styles.title}>Créer un compte</div>
                <div style={styles.subtitle}>Sélectionnez votre profil</div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div onClick={() => handleRoleSelect('enseignant')} style={styles.roleBtn('#eef2ff')}>
                  <div style={{ width: 44, height: 44, background: '#eef2ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={20} color="#1e3a8a" /></div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Je suis Enseignant</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Gérez vos classes et évaluations</div>
                  </div>
                </div>

                <div onClick={() => handleRoleSelect('parent')} style={styles.roleBtn('#f5f3ff')}>
                  <div style={{ width: 44, height: 44, background: '#f5f3ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#6d28d9" /></div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Je suis Parent</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Suivez la scolarité de votre enfant</div>
                  </div>
                </div>

                <div onClick={() => handleRoleSelect('administrateur')} style={styles.roleBtn('#fff7ed')}>
                  <div style={{ width: 44, height: 44, background: '#fff7ed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building size={20} color="#ea580c" /></div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Je suis Administrateur</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Gérez l'établissement scolaire</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={styles.title}>Informations personnelles</div>
                <div style={styles.subtitle}>Complétez votre profil {role}</div>
              </div>

              {error && (
                <div style={{ marginBottom: 12, padding: 10, background: '#fff1f2', border: '1px solid #fecaca', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <div style={{ color: '#b91c1c' }}>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleInputChange} style={{ ...styles.input }} />
                  <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleInputChange} style={{ ...styles.input }} />
                </div>
                <input name="email" type="email" placeholder="Email scolaire" value={formData.email} onChange={handleInputChange} style={styles.input} />
                <input name="telephone" type="tel" placeholder="Téléphone" value={formData.telephone} onChange={handleInputChange} style={styles.input} />

                {role === 'enseignant' && <input name="specialite" placeholder="Votre spécialité" value={formData.specialite} onChange={handleInputChange} style={styles.input} />}
                {role === 'parent' && <input name="nomEnfant" placeholder="Nom de votre enfant" value={formData.nomEnfant} onChange={handleInputChange} style={styles.input} />}
                {role === 'administrateur' && <input name="etablissement" placeholder="Nom de l'établissement" value={formData.etablissement} onChange={handleInputChange} style={styles.input} />}

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={() => setStep(1)} style={styles.btnOutline}>Retour</button>
                  <button type="submit" style={styles.btnPrimary}>Continuer</button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={styles.title}>Créer vos identifiants</div>
                <div style={styles.subtitle}>Sécurisez votre compte</div>
              </div>

              {error && (
                <div style={{ marginBottom: 12, padding: 10, background: '#fff1f2', border: '1px solid #fecaca', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <div style={{ color: '#b91c1c' }}>{error}</div>
                </div>
              )}

              {successMessage && (
                <div style={{ marginBottom: 12, padding: 10, background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <CheckCircle size={16} color="#16a34a" />
                  <div style={{ color: '#065f46', fontWeight: 600 }}>{successMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Mot de passe</div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Au moins 6 caractères" style={{ paddingLeft: 40, ...styles.input }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>{showPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Confirmer le mot de passe</div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirmez votre mot de passe" style={{ paddingLeft: 40, ...styles.input }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={() => setStep(2)} style={styles.btnOutline}>Retour</button>
                  <button type="submit" disabled={isLoading} style={{ ...styles.btnPrimary, opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? 'Création...' : 'Créer mon compte'}
                  </button>
                </div>
              </form>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 12 }}>En créant un compte, vous acceptez nos <a href="#" style={{ color: '#1d4ed8' }}>conditions d'utilisation</a></p>
            </div>
          )}

          {step === 1 && (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 12 }}>
              Vous avez déjà un compte ? <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontWeight: 700, marginLeft: 6 }}>Se connecter</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
