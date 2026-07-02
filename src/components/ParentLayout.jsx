import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Calendar, MessageSquare, CreditCard, LogOut, GraduationCap, User } from 'lucide-react';

const parentMenu = [
  { name: 'Tableau de bord', icon: Home, path: '/parent/dashboard' },
  { name: 'Mon enfant', icon: User, path: '/parent/enfant' },
  { name: 'Notes & Bulletins', icon: FileText, path: '/parent/bulletins' },
  { name: 'Emploi du temps', icon: Calendar, path: '/parent/emploi-du-temps' },
  { name: 'Paiements', icon: CreditCard, path: '/parent/paiements' },
  { name: 'Messages', icon: MessageSquare, path: '/parent/messages' },
];

export default function ParentLayout({ children, title = 'Tableau de bord', subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ff', fontFamily: "'Segoe UI', sans-serif" }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: 260, height: '100vh', background: '#1e1b4b', zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '24px 20px', borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={22} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>École Plus</div>
              <div style={{ color: '#c4b5fd', fontSize: '11px' }}>Espace Parent</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>
              {(user.prenom || 'P')[0]}{(user.nom || '')[0]}
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{user.prenom} {user.nom}</div>
              <div style={{ color: '#c4b5fd', fontSize: '11px' }}>Parent · {user.elevePrenom} {user.eleveNom}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {parentMenu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '2px', textDecoration: 'none', background: active ? 'rgba(139,92,246,0.2)' : 'transparent', color: active ? '#a78bfa' : '#c4b5fd', borderLeft: active ? '3px solid #8b5cf6' : '3px solid transparent' }}
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
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e1b4b' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '12px', color: '#8b5cf6' }}>{subtitle}</div>}
          </div>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
            {(user.prenom || 'P')[0]}
          </div>
        </div>

        <div style={{ padding: '28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}