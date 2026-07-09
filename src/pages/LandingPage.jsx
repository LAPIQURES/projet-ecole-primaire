import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, BarChart2, MessageSquare, Shield,
  BookOpen, Star, ArrowRight, ChevronDown, CheckCircle,
  Calendar, FileText, Bell, Award
} from 'lucide-react';

const features = [
  {
    icon: Users,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    title: 'Gestion des élèves',
    desc: 'Inscriptions, suivi des présences, bulletins et discipline centralisés en un seul endroit.',
  },
  {
    icon: BarChart2,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    title: 'Tableaux de bord avancés',
    desc: 'Statistiques en temps réel pour la direction, l\'intendance et les enseignants.',
  },
  {
    icon: MessageSquare,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Messagerie intégrée',
    desc: 'Communication directe et sécurisée entre parents, enseignants et administration.',
  },
  {
    icon: BookOpen,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    title: 'Emploi du temps',
    desc: 'Planification et consultation de l\'emploi du temps par classe, salle et enseignant.',
  },
  {
    icon: FileText,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.1)',
    title: 'Bulletins & Notes',
    desc: 'Saisie des notes, génération automatique de bulletins et suivi des évaluations.',
  },
  {
    icon: Shield,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    title: 'Accès sécurisé',
    desc: 'Rôles et permissions distincts : Admin, Directeur, Intendant, Enseignant, Parent.',
  },
];

const stats = [
  { value: '500+', label: 'Élèves gérés', icon: Users, color: '#6366f1' },
  { value: '50+', label: 'Enseignants', icon: GraduationCap, color: '#10b981' },
  { value: '98%', label: 'Satisfaction', icon: Star, color: '#f59e0b' },
  { value: '24/7', label: 'Disponibilité', icon: Bell, color: '#8b5cf6' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to appropriate dashboard
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.role) {
      if (user.role === 'enseignant') navigate('/enseignant/dashboard');
      else if (user.role === 'parent') navigate('/parent/dashboard');
      else if (user.role === 'directeur') navigate('/directeur/dashboard');
      else if (user.role === 'intendant') navigate('/intendant/dashboard');
      else navigate('/dashboard');
    }

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    setTimeout(() => setVisible(true), 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#0a0f1e', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .nav-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: white; }
        .btn-primary { 
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-weight: 700;
          transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 60px rgba(99,102,241,0.5); }
        .btn-outline {
          background: transparent; border: 1.5px solid rgba(255,255,255,0.25); border-radius: 12px;
          color: white; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600;
          transition: all 0.2s;
        }
        .btn-outline:hover { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.05); }
        .feature-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px;
          transition: all 0.3s; cursor: default;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.07); border-color: rgba(99,102,241,0.3);
          transform: translateY(-4px); box-shadow: 0 20px 60px rgba(99,102,241,0.1);
        }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px 32px; text-align: center; }
        .hero-badge { animation: float 4s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #6366f1, #38bdf8);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '18px 40px',
        background: scrolled ? 'rgba(10,15,30,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>École <span className="gradient-text">Plus</span></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#fonctionnalites" className="nav-link">Fonctionnalités</a>
          <a href="#chiffres" className="nav-link">Chiffres</a>
          <a href="#contact" className="nav-link">Contact</a>
          <button className="btn-primary" onClick={() => navigate('/login')} style={{ padding: '10px 22px', fontSize: 14 }}>
            Se connecter <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/classroom.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.25)',
        }} />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,15,30,0.95) 40%, rgba(99,102,241,0.15) 100%)',
        }} />
        {/* Glowing orbs */}
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', animation: 'pulse 4s ease infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />

        <div style={{
          position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '120px 40px 80px',
          width: '100%',
          opacity: visible ? 1 : 0, animation: visible ? 'fadeUp 0.9s ease forwards' : 'none',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 32,
          }}>
            <Award size={14} color="#a78bfa" />
            <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>Plateforme de gestion scolaire tout-en-un</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 24px', maxWidth: 750, letterSpacing: '-2px' }}>
            L'école de demain,<br />
            <span className="gradient-text">gérée aujourd'hui.</span>
          </h1>

          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.65)', maxWidth: 560, lineHeight: 1.7, marginBottom: 48, fontWeight: 400 }}>
            École Plus centralise la gestion scolaire complète : élèves, enseignants, paiements, bulletins et emplois du temps — en un seul outil puissant et intuitif.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
              style={{ padding: '16px 36px', fontSize: 16 }}
            >
              Accéder à l'espace école <ArrowRight size={18} />
            </button>
            <button
              className="btn-outline"
              onClick={() => document.getElementById('fonctionnalites')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '16px 28px', fontSize: 15 }}
            >
              Découvrir les fonctionnalités
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 24, marginTop: 56, flexWrap: 'wrap' }}>
            {['Données sécurisées', 'Accès multi-rôles', 'Temps réel'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.5 }}>
          <span style={{ fontSize: 11, color: 'white', fontWeight: 500, letterSpacing: 1 }}>DÉFILER</span>
          <ChevronDown size={18} color="white" style={{ animation: 'float 2s ease infinite' }} />
        </div>
      </section>

      {/* STATS */}
      <section id="chiffres" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon size={22} color={s.color} />
                </div>
                <div style={{ fontSize: 40, fontWeight: 900, background: `linear-gradient(135deg, white, rgba(255,255,255,0.6))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section id="fonctionnalites" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 99, padding: '5px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Fonctionnalités</span>
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1.5px' }}>
            Tout ce dont votre école<br />
            <span className="gradient-text">a besoin</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Un écosystème complet pour administrer, enseigner et communiquer efficacement.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feature-card">
                <div style={{ width: 52, height: 52, borderRadius: 16, background: f.bg, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: 'white' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* IMAGE + CTA SECTION */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          borderRadius: 32, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 480,
        }}>
          {/* Left: image */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src="/images/classroom.png"
              alt="Salle de classe"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(30,27,75,0.9) 100%)' }} />
          </div>

          {/* Right: CTA */}
          <div style={{ padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 99, display: 'inline-block', padding: '4px 14px', marginBottom: 24, width: 'fit-content' }}>
              <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Pour les parents</span>
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 900, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-1px' }}>
              Suivez la scolarité de<br />
              <span className="gradient-text">vos enfants</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32 }}>
              Notes, bulletins, présences, emploi du temps, paiements de scolarité... Tout accessible depuis votre espace parent dédié.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
              {['Consulter les bulletins de notes', 'Voir l\'emploi du temps hebdomadaire', 'Payer les frais de scolarité en ligne', 'Contacter les enseignants'].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
              style={{ padding: '14px 28px', fontSize: 15, width: 'fit-content' }}
            >
              Accéder à mon espace <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '50px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>École Plus</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Plateforme de gestion scolaire</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32 }}>
            {['Politique de confidentialité', 'Conditions d\'utilisation', 'Support'].map((l) => (
              <span key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.2s' }}>{l}</span>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} École Plus · Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
