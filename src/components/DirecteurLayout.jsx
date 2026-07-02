import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Building2, CreditCard,
  MessageSquare, LogOut, Settings, ChevronLeft, ChevronRight,
  GraduationCap, ClipboardList, Calendar, Bell, BarChart2, Shield,
  BookOpen, Home,
} from 'lucide-react';

const VIOLET = '#6f42c1';
const VIOLET_LIGHT = '#f3eeff';
const VIOLET_BORDER = '#d4b8ff';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { name: 'Tableau de bord', icon: LayoutDashboard, path: '/directeur/dashboard' },
      { name: 'Statistiques', icon: BarChart2, path: '/directeur/statistiques' },
    ],
  },
  {
    label: 'Académique',
    items: [
      { name: 'Élèves', icon: Users, path: '/directeur/eleves' },
      { name: 'Enseignants', icon: UserCheck, path: '/directeur/enseignants' },
      { name: 'Classes', icon: Building2, path: '/directeur/classes' },
      { name: 'Salles', icon: Building2, path: '/directeur/salles' },
      { name: 'Emploi du temps', icon: Calendar, path: '/directeur/emploi-du-temps' },
    ],
  },
  {
    label: 'Suivi',
    items: [
      { name: 'Paiements', icon: CreditCard, path: '/directeur/paiements' },
      { name: 'Notes & Évals', icon: BookOpen, path: '/directeur/notes' },
      { name: 'Bulletins', icon: ClipboardList, path: '/directeur/bulletins' },
      { name: 'Discipline', icon: Shield, path: '/directeur/discipline' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'Messages', icon: MessageSquare, path: '/directeur/messages' },
      { name: 'Communiqués', icon: Bell, path: '/directeur/communiques' },
    ],
  },
  {
    label: 'Mon compte',
    items: [
      { name: 'Profil', icon: Settings, path: '/directeur/profil' },
    ],
  },
];

export default function DirecteurLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = `${(user.nom || 'D')[0]}${(user.prenom || '')[0] || ''}`.toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f0ff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: '#fff',
        borderRight: `1px solid ${VIOLET_BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '18px 12px' : '18px 20px', borderBottom: `1px solid ${VIOLET_BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: VIOLET }}>École Alanya</div>
              <div style={{ fontSize: 10, color: '#9b72ef', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Directeur</div>
            </div>
          )}
          {collapsed && <GraduationCap size={22} color={VIOLET} />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: VIOLET_LIGHT, border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: VIOLET, display: 'flex', alignItems: 'center' }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Avatar */}
        {!collapsed && (
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${VIOLET_BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${VIOLET}, #9b59b6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nom || 'Directeur'}</div>
                <div style={{ fontSize: 11, color: VIOLET, fontWeight: 600 }}>Direction</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div style={{ fontSize: 9, fontWeight: 900, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: 1.2, padding: '10px 20px 4px' }}>
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '10px 0' : '9px 20px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      margin: '1px 8px',
                      borderRadius: 8,
                      background: active ? VIOLET_LIGHT : 'transparent',
                      color: active ? VIOLET : '#5b5b8a',
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                    }}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon size={17} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 8px', borderTop: `1px solid ${VIOLET_BORDER}` }}>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: collapsed ? '10px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#dc2626', fontSize: 13, fontWeight: 600, borderRadius: 8,
            }}
          >
            <LogOut size={17} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 64, background: '#fff',
          borderBottom: `1px solid ${VIOLET_BORDER}`,
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: 16,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ flex: 1 }}>
            {title && <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: VIOLET }}>{title}</h1>}
            {subtitle && <div style={{ fontSize: 12, color: '#9b72ef', marginTop: 1 }}>{subtitle}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${VIOLET}, #9b59b6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {initials}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
