import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, GraduationCap, ArrowRight, MessageSquare, Users, FileText, Shield } from 'lucide-react'
import { loginAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return }
    setIsLoading(true); setError('')
    try {
      const res = await loginAPI(email, password)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      if (rememberMe) localStorage.setItem('email', email)
      setSuccessMessage('Connexion réussie ! Redirection...')
        setTimeout(() => {
        const r = res.data.user?.role || 'admin'
        if (r === 'enseignant') navigate('/enseignant/dashboard')
        else if (r === 'parent') navigate('/parent/dashboard')
        else if (r === 'directeur') navigate('/directeur/dashboard')
        else if (r === 'intendant') navigate('/intendant/dashboard')
        else navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiant ou mot de passe incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    if (!forgotEmail) { setError('Veuillez entrer votre email'); return }
    setSuccessMessage('Un lien a été envoyé à ' + forgotEmail)
    setTimeout(() => { setShowForgotPassword(false); setForgotEmail(''); setSuccessMessage('') }, 3000)
  }

  const placeholder = 'Nom d\'utilisateur, email ou matricule'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#eef2f7', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .inp {
          width: 100%; padding: 10px 14px 10px 42px;
          border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: 13.5px; color: #1e293b; outline: none;
          transition: all 0.2s; background: #fff; box-sizing: border-box;
        }
        .inp:focus { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,0.1); }
        .inp::placeholder { color: #b0bec5; font-style: italic; }
        .inp.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); animation: shake 0.4s ease; }
        .btn-main {
          width: 100%; padding: 11px; border: none; border-radius: 8px;
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          color: white; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-main:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(29,78,216,0.35); }
        .btn-main:disabled { opacity: 0.65; cursor: not-allowed; }
        .tab { padding: 7px 16px; border: 1.5px solid #e2e8f0; border-radius: 6px; background: white; font-size: 12.5px; cursor: pointer; transition: all 0.2s; color: #64748b; font-family: 'Segoe UI', sans-serif; }
        .tab.active { background: #1d4ed8; color: white; border-color: #1d4ed8; font-weight: 600; }
        .tab:not(.active):hover { border-color: #1d4ed8; color: #1d4ed8; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#1e293b', padding: '9px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', background: '#1d4ed8', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={17} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>École Plus</span>
          <span style={{ color: '#475569', fontSize: '12px' }}>/ Portail Académique</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>État du système</button>
          <button style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', cursor: 'pointer' }}>Contact</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', overflow: 'hidden' }}>
        <div style={{
          width: '100%', maxWidth: '960px',
          background: 'white', borderRadius: '16px',
          boxShadow: '0 8px 48px rgba(30,64,175,0.13), 0 2px 12px rgba(0,0,0,0.07)',
          display: 'flex', overflow: 'hidden',
          height: '100%', maxHeight: '580px',
          animation: 'fadeUp 0.5s ease forwards'
        }}>

          {/* LEFT — Form avec box shadow à droite */}
          <div style={{
            flex: '0 0 440px',
            padding: '32px 36px',
            overflow: 'hidden',
            boxShadow: '4px 0 24px rgba(30,64,175,0.10)',
            position: 'relative',
            zIndex: 2,
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>

            {/* School identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '42px', height: '42px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={22} color="#1d4ed8" />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>École Plus</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Portail scolaire sécurisé</div>
              </div>
            </div>

            {!showForgotPassword ? (
              <>
                <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#0f172a', marginBottom: '3px' }}>
                  Connexion automatique au bon espace
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                  L'application détecte votre profil avec votre identifiant et votre mot de passe, puis vous dirige vers le tableau de bord correspondant.
                </p>

                {error && (
                  <div style={{ marginBottom: '12px', padding: '9px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#dc2626' }}>{error}</span>
                  </div>
                )}
                {successMessage && (
                  <div style={{ marginBottom: '12px', padding: '9px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <CheckCircle size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#15803d' }}>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                      Nom d'utilisateur ou matricule
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input className={`inp ${error ? 'error' : ''}`} type="text" value={email}
                        onChange={e => { setEmail(e.target.value); setError('') }} placeholder={placeholder} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>
                      Mot de passe
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input className={`inp ${error ? 'error' : ''}`} type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => { setPassword(e.target.value); setError('') }} placeholder="••••••••" style={{ paddingRight: '42px' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '12px', color: '#475569' }}>
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor: '#1d4ed8', width: '13px', height: '13px' }} />
                      Se souvenir de moi
                    </label>
                    <button type="button" onClick={() => setShowForgotPassword(true)}
                      style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <button type="submit" disabled={isLoading} className="btn-main">
                    {isLoading
                      ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Connexion...</>
                      : <>SE CONNECTER <ArrowRight size={15} /></>}
                  </button>
                </form>

                {/* Option 'Créer un compte' retirée */}

                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={11} color="#16a34a" />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Chiffrement conforme au RGPD</span>
                  <span style={{ fontSize: '11px', color: '#1d4ed8', marginLeft: 'auto', cursor: 'pointer' }}>Aide et assistance</span>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Mot de passe oublié</h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
                {successMessage && (
                  <div style={{ marginBottom: '14px', padding: '9px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <CheckCircle size={14} color="#16a34a" />
                    <span style={{ fontSize: '12px', color: '#15803d' }}>{successMessage}</span>
                  </div>
                )}
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Adresse email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input className="inp" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="votre.email@exemple.com" />
                    </div>
                  </div>
                  <button type="submit" className="btn-main">Envoyer le lien <ArrowRight size={15} /></button>
                  <button type="button" onClick={() => setShowForgotPassword(false)}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#475569', fontSize: '13px', cursor: 'pointer', fontFamily: 'Segoe UI, sans-serif' }}>
                    ← Retour à la connexion
                  </button>
                </form>
              </>
            )}
          </div>

          {/* RIGHT — Image réduite + features */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Image — hauteur réduite */}
            <div style={{ flex: '0 0 55%', position: 'relative', overflow: 'hidden' }}>
              <img src="/images/school.jpeg" alt="École"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 100%)' }} />
            </div>

            {/* Features — fond bleu foncé élégant, hauteur augmentée */}
            <div style={{ flex: 1, background: 'white', padding: '16px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
              {[
                { icon: <MessageSquare size={16} color="#93c5fd" />, bg: 'rgba(147,197,253,0.1)', border: 'rgba(147,197,253,0.2)', title: 'Messagerie sécurisée', desc: 'Communication directe entre enseignants et parents' },
                { icon: <Users size={16} color="#93c5fd" />, bg: 'rgba(147,197,253,0.1)', border: 'rgba(147,197,253,0.2)', title: 'Présence en temps réel', desc: 'Enregistrements et suivi instantanés' },
                { icon: <FileText size={16} color="#93c5fd" />, bg: 'rgba(147,197,253,0.1)', border: 'rgba(147,197,253,0.2)', title: 'Notes et bulletins', desc: 'Accès sécurisé aux bulletins et aux progrès' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#1e293b' }}>{f.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1e293b', padding: '10px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ color: '#475569', fontSize: '11px' }}>École Plus · Tous droits réservés</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Politique de confidentialité', 'Conditions', 'Accessibilité'].map(l => (
            <button key={l} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '11px', cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
