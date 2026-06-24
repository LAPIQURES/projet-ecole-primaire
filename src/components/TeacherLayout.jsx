import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Users, FileText, Calendar, MessageSquare, Settings, LogOut, GraduationCap } from 'lucide-react';

const teacherMenu = [
  { name: 'Tableau de bord', icon: Home, path: '/enseignant/dashboard' },
  { name: 'Mes cours', icon: BookOpen, path: '/enseignant/cours' },
  { name: 'Cahier d\'appel', icon: FileText, path: '/enseignant/cahier-appel' },
  { name: 'Mes élèves', icon: Users, path: '/enseignant/eleves' },
  { name: 'Évaluations', icon: FileText, path: '/enseignant/evaluations' },
  { name: 'Emploi du temps', icon: Calendar, path: '/enseignant/emploi-du-temps' },
  { name: 'Messages', icon: MessageSquare, path: '/enseignant/messages' },
  { name: 'Mon profil', icon: Settings, path: '/enseignant/profil' },
];

export default function TeacherLayout({ children, title = 'Tableau de bord', subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', fontFamily: "'Segoe UI', sans-serif" }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: 260, height: '100vh', background: '#064e3b', zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '24px 20px', borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={22} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>École Plus</div>
              <div style={{ color: '#6ee7b7', fontSize: '11px' }}>Espace Enseignant</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #10b981, #34d399)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>
              {(user.prenom || 'E')[0]}{(user.nom || '')[0]}
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{user.prenom} {user.nom}</div>
              <div style={{ color: '#6ee7b7', fontSize: '11px' }}>Enseignant</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {teacherMenu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '2px', textDecoration: 'none', background: active ? 'rgba(16,185,129,0.2)' : 'transparent', color: active ? '#34d399' : '#a7f3d0', borderLeft: active ? '3px solid #10b981' : '3px solid transparent' }}
              >
                <item.icon size={18} />
                <span style={{ fontSize: '13.5px', fontWeight: active ? '600' : '400' }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: 'none' }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', cursor: 'pointer', fontSize: '13.5px' }}>
            <LogOut size={18} />Déconnexion
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 260, minHeight: '100vh' }}>
        <div style={{ background: 'white', borderBottom: 'none', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, borderRadius: '18px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#064e3b' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '12px', color: '#059669' }}>{subtitle}</div>}
          </div>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
            {(user.prenom || 'E')[0]}
          </div>
        </div>

        <div style={{ padding: '28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}