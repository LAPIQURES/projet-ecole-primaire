import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, UserCheck, Calendar,
  CreditCard, MessageSquare, LogOut, Settings,
  ChevronLeft, ChevronRight, GraduationCap, ClipboardList,
  Building2, Bus, UserCog, FileText,
} from 'lucide-react';

const adminNavGroups = [
  {
    label: 'Principal',
    items: [
      { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    ],
  },
  {
    label: 'Académique',
    items: [
      { name: 'Élèves', icon: Users, path: '/eleves' },
      { name: 'Enseignants', icon: UserCheck, path: '/enseignants' },
      { name: 'Classes & Salles', icon: Building2, path: '/classes' },
      { name: 'Salles', icon: Building2, path: '/salles' },
      { name: 'Inscriptions', icon: BookOpen, path: '/inscriptions' },
      { name: 'Cours & Évaluations', icon: BookOpen, path: '/evaluations' },
      { name: 'Emploi du temps', icon: Calendar, path: '/emploi-du-temps' },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { name: 'Parents', icon: UserCog, path: '/parents' },
      { name: 'Personnel', icon: UserCog, path: '/personnel' },
      { name: 'Paiements', icon: CreditCard, path: '/paiements' },
      { name: 'Bus Scolaire', icon: Bus, path: '/bus' },
      { name: 'Bulletins', icon: ClipboardList, path: '/bulletins' },
      { name: 'Rapports', icon: ClipboardList, path: '/rapports' },
      { name: 'Discipline & Absences', icon: ClipboardList, path: '/discipline' },
      { name: 'Messages', icon: MessageSquare, path: '/messages' },
    ],
  },
  {
    label: 'Système',
    items: [
      { name: 'Paramètres', icon: Settings, path: '/settings' },
      { name: 'Audit', icon: ClipboardList, path: '/audit' },
    ],
  },
];

const directeurNavGroups = [
  {
    label: 'Principal',
    items: [
      { name: 'Tableau de bord Directeur', icon: LayoutDashboard, path: '/directeur/dashboard' },
      { name: 'Rapports', icon: FileText, path: '/rapports' },
    ],
  },
  {
    label: 'Académique',
    items: [
      { name: 'Élèves', icon: Users, path: '/eleves' },
      { name: 'Enseignants', icon: UserCheck, path: '/enseignants' },
    ],
  },
];

const intendantNavGroups = [
  {
    label: 'Trésorerie',
    items: [
      { name: 'Tableau de bord Intendant', icon: CreditCard, path: '/intendant/dashboard' },
      { name: 'Paiements', icon: CreditCard, path: '/paiements' },
      { name: 'Tranches', icon: ClipboardList, path: '/tranches' },
    ],
  },
  {
    label: 'Suivi',
    items: [
      { name: 'Elèves en impayé', icon: Users, path: '/paiements?filter=impayes' },
    ],
  },
];

const teacherNavGroups = [
  {
    label: 'Principal',
    items: [
      { name: 'Dashboard Enseignant', icon: LayoutDashboard, path: '/dashboard-enseignant' },
      { name: 'Messages', icon: MessageSquare, path: '/messages' },
      { name: 'Emploi du temps', icon: Calendar, path: '/emploi-du-temps' },
    ],
  },
  {
    label: 'Mon espace',
    items: [
      { name: 'Notes & évaluations', icon: BookOpen, path: '/evaluations' },
      { name: 'Paramètres', icon: Settings, path: '/settings' },
    ],
  },
];

const parentNavGroups = [
  {
    label: 'Principal',
    items: [
      { name: 'Dashboard Parent', icon: LayoutDashboard, path: '/parent/dashboard' },
      { name: 'Messages', icon: MessageSquare, path: '/parent/messages' },
    ],
  },
  {
    label: 'Suivi',
    items: [
      { name: 'Paiements', icon: CreditCard, path: '/parent/paiements' },
      { name: 'Rapports', icon: ClipboardList, path: '/parent/rapports' },
      { name: 'Paramètres', icon: Settings, path: '/parent/settings' },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const navGroups = user?.role === 'enseignant'
    ? teacherNavGroups
    : user?.role === 'parent'
      ? parentNavGroups
      : user?.role === 'directeur'
        ? directeurNavGroups
        : user?.role === 'intendant'
          ? intendantNavGroups
          : adminNavGroups;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sideW = collapsed ? 68 : 240;

  return (
    <aside style={{
      width: sideW, minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(0,98,255,0.95) 0%, rgba(255,160,0,0.95) 100%)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease',
      overflowX: 'visible', flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 20,
      boxShadow: 'none',
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 68, position: 'relative',
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(2,6,23,0.12)',
          }}>
            <GraduationCap size={20} color="var(--brand)" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: 'var(--surface)', fontWeight: 700, fontSize: 14 }}>EcoleGest</div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10 }}>
                {user?.role === 'enseignant' ? 'Espace Enseignant' : user?.role === 'parent' ? 'Espace Parent' : 'Administration'}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          style={{
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.32)', cursor: 'pointer',
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            position: 'absolute', right: 12, top: 22, zIndex: 30,
            outline: 'none',
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 2 }}>
            {!collapsed && (
              <div style={{
                padding: '10px 18px 6px', fontSize: 10, fontWeight: 700,
                color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1,
              }}>{group.label}</div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path} to={item.path}
                  title={collapsed ? item.name : ''}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: 10, textDecoration: 'none',
                    padding: collapsed ? '10px 0' : '9px 20px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.9)',
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                    borderRadius: 12,
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  <item.icon size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: collapsed ? '12px 0' : '12px 16px' }}>
        {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '6px 4px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--brand),var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {(user?.nom || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nom || 'Administrateur'}
              </div>
              <div style={{ color: '#475569', fontSize: 10 }}>
                {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'enseignant' ? 'Enseignant' : user?.role === 'parent' ? 'Parent' : 'Admin'}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout} title={collapsed ? 'Déconnexion' : ''}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8, padding: collapsed ? '10px 0' : '9px 12px',
            background: 'transparent', border: 'none',
            borderRadius: 8, color: 'var(--surface)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={e => e.currentTarget.style.opacity = 1}
        >
          <LogOut size={15} color="var(--surface)" />
          {!collapsed && 'Déconnexion'}
        </button>
      </div>
    </aside>
  );
}
