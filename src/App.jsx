import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin / Superadmin
import Dashboard from './pages/Dashboard';
import Eleves from './pages/Eleves';
import Classes from './pages/Classes';
import Enseignants from './pages/Enseignants';
import Paiements from './pages/Paiements';
import Salles from './pages/Salles';
import Parents from './pages/Parents';
import Inscriptions from './pages/Inscriptions';
import Parametres from './pages/Parametres';
import Messages from './pages/Messages';
import CoursEvaluations from './pages/CoursEvaluations';
import Tranches from './pages/Tranches';
import Rapports from './pages/Rapports';
import Bulletins from './pages/Bulletins';
import Audit from './pages/Audit';
import Discipline from './pages/Discipline';
import BusPage from './pages/Bus';
import Emploi from './pages/Emploi';

// Enseignant
import DashboardEnseignant from './pages/DashboardEnseignant';

// Parent
import DashboardParent from './pages/DashboardParent';

// Directeur
import DashboardDirecteur from './pages/DashboardDirecteur';
import DirecteurLayout from './components/DirecteurLayout';

// Intendant
import DashboardIntendant from './pages/DashboardIntendant';
import IntendantLayout from './components/IntendantLayout';

// Shared layout
import Layout from './components/Layout';
import { BookOpen, MessageSquare, Calendar, Settings, CreditCard, ClipboardList, Shield, BarChart2, Users, Building2, Bell } from 'lucide-react';

// ─── ProtectedRoute ────────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={getRoleHome(user.role)} />;
    }
  }
  return children;
}

function getRoleHome(role) {
  if (role === 'enseignant') return '/enseignant/dashboard';
  if (role === 'parent') return '/parent/dashboard';
  if (role === 'directeur') return '/directeur/dashboard';
  if (role === 'intendant') return '/intendant/dashboard';
  return '/dashboard';
}

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return <Navigate to={getRoleHome(user.role)} />;
}

// ─── Generic "Coming Soon" inside a layout ─────────────────────────────────────
function AdminPage({ title, icon: Icon, color, description, children }) {
  return (
    <Layout title={title}>
      {children || (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: (color || '#0062ff') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            {Icon && <Icon size={32} color={color || '#0062ff'} />}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', maxWidth: 400 }}>{description || 'Page disponible.'}</div>
        </div>
      )}
    </Layout>
  );
}

function DirecteurPage({ title, icon: Icon, color = '#6f42c1', description, component: C }) {
  return (
    <DirecteurLayout title={title}>
      {C ? <C /> : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            {Icon && <Icon size={32} color={color} />}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', maxWidth: 400 }}>{description || 'Section disponible.'}</div>
        </div>
      )}
    </DirecteurLayout>
  );
}

function IntendantPage({ title, icon: Icon, color = '#28a745', description, component: C }) {
  return (
    <IntendantLayout title={title}>
      {C ? <C /> : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            {Icon && <Icon size={32} color={color} />}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f2d1a', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', maxWidth: 400 }}>{description || 'Section disponible.'}</div>
        </div>
      )}
    </IntendantLayout>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── ADMIN / SUPERADMIN ── */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/eleves" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Eleves /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Classes /></ProtectedRoute>} />
        <Route path="/enseignants" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Enseignants /></ProtectedRoute>} />
        <Route path="/paiements" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Paiements /></ProtectedRoute>} />
        <Route path="/salles" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Salles /></ProtectedRoute>} />
        <Route path="/bus" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><BusPage /></ProtectedRoute>} />
        <Route path="/bus-scolaire" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><BusPage /></ProtectedRoute>} />
        <Route path="/parents" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Parents /></ProtectedRoute>} />
        <Route path="/inscriptions" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Inscriptions /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Parametres /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Messages /></ProtectedRoute>} />
        <Route path="/evaluations" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><CoursEvaluations /></ProtectedRoute>} />
        <Route path="/tranches" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Tranches /></ProtectedRoute>} />
        <Route path="/rapports" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Rapports /></ProtectedRoute>} />
        <Route path="/bulletins" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Bulletins /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Audit /></ProtectedRoute>} />
        <Route path="/discipline" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Discipline /></ProtectedRoute>} />
        <Route path="/emploi-du-temps" element={<ProtectedRoute allowedRoles={['admin','superadmin','enseignant','parent','directeur','intendant']}><Emploi /></ProtectedRoute>} />

        {/* ── ENSEIGNANT ── */}
        <Route path="/enseignant/dashboard" element={<ProtectedRoute allowedRoles={['enseignant']}><DashboardEnseignant /></ProtectedRoute>} />
        <Route path="/enseignant/emploi-du-temps" element={<ProtectedRoute allowedRoles={['enseignant']}><Emploi /></ProtectedRoute>} />
        <Route path="/enseignant/messages" element={<ProtectedRoute allowedRoles={['enseignant']}><Messages /></ProtectedRoute>} />
        <Route path="/enseignant/notes" element={<ProtectedRoute allowedRoles={['enseignant']}><CoursEvaluations /></ProtectedRoute>} />
        <Route path="/enseignant/discipline" element={<ProtectedRoute allowedRoles={['enseignant']}><Discipline /></ProtectedRoute>} />
        <Route path="/enseignant/bulletins" element={<ProtectedRoute allowedRoles={['enseignant']}><Bulletins /></ProtectedRoute>} />
        <Route path="/enseignant/settings" element={<ProtectedRoute allowedRoles={['enseignant']}><Parametres /></ProtectedRoute>} />
        <Route path="/enseignant/*" element={<ProtectedRoute allowedRoles={['enseignant']}><DashboardEnseignant /></ProtectedRoute>} />

        {/* ── PARENT ── */}
        <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
        <Route path="/parent/emploi-du-temps" element={<ProtectedRoute allowedRoles={['parent']}><Emploi /></ProtectedRoute>} />
        <Route path="/parent/messages" element={<ProtectedRoute allowedRoles={['parent']}><Messages /></ProtectedRoute>} />
        <Route path="/parent/paiements" element={<ProtectedRoute allowedRoles={['parent']}><Paiements /></ProtectedRoute>} />
        <Route path="/parent/bulletins" element={<ProtectedRoute allowedRoles={['parent']}><Bulletins /></ProtectedRoute>} />
        <Route path="/parent/settings" element={<ProtectedRoute allowedRoles={['parent']}><Parametres /></ProtectedRoute>} />
        <Route path="/parent/*" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />

        {/* ── DIRECTEUR ── */}
        <Route path="/directeur/dashboard" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DashboardDirecteur /></ProtectedRoute>} />
        <Route path="/directeur/eleves" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Élèves" icon={Users} component={Eleves} /></ProtectedRoute>} />
        <Route path="/directeur/enseignants" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Enseignants" icon={Users} component={Enseignants} /></ProtectedRoute>} />
        <Route path="/directeur/classes" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Classes" icon={Building2} component={Classes} /></ProtectedRoute>} />
        <Route path="/directeur/salles" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Salles" icon={Building2} component={Salles} /></ProtectedRoute>} />
        <Route path="/directeur/paiements" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Paiements" icon={CreditCard} component={Paiements} /></ProtectedRoute>} />
        <Route path="/directeur/notes" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Notes & Évaluations" icon={BookOpen} component={CoursEvaluations} /></ProtectedRoute>} />
        <Route path="/directeur/bulletins" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Bulletins" icon={ClipboardList} component={Bulletins} /></ProtectedRoute>} />
        <Route path="/directeur/discipline" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Discipline" icon={Shield} component={Discipline} /></ProtectedRoute>} />
        <Route path="/directeur/messages" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Messages" icon={MessageSquare} component={Messages} /></ProtectedRoute>} />
        <Route path="/directeur/communiques" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Communiqués" icon={Bell} component={Messages} /></ProtectedRoute>} />
        <Route path="/directeur/emploi-du-temps" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Emploi du temps" icon={Calendar} component={Emploi} /></ProtectedRoute>} />
        <Route path="/directeur/statistiques" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Statistiques" icon={BarChart2} component={Rapports} /></ProtectedRoute>} />
        <Route path="/directeur/profil" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DirecteurPage title="Mon profil" icon={Settings} component={Parametres} /></ProtectedRoute>} />
        <Route path="/directeur/*" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DashboardDirecteur /></ProtectedRoute>} />

        {/* ── INTENDANT ── */}
        <Route path="/intendant/dashboard" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><DashboardIntendant /></ProtectedRoute>} />
        <Route path="/intendant/inscriptions" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Inscriptions" icon={BookOpen} component={Inscriptions} /></ProtectedRoute>} />
        <Route path="/intendant/paiements" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Paiements" icon={CreditCard} component={Paiements} /></ProtectedRoute>} />
        <Route path="/intendant/eleves" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Élèves" icon={Users} component={Eleves} /></ProtectedRoute>} />
        <Route path="/intendant/tranches" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Tranches" icon={ClipboardList} component={Tranches} /></ProtectedRoute>} />
        <Route path="/intendant/messages" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Messages" icon={MessageSquare} component={Messages} /></ProtectedRoute>} />
        <Route path="/intendant/rapports" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Rapport financier" icon={BarChart2} component={Rapports} /></ProtectedRoute>} />
        <Route path="/intendant/impayes" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><DashboardIntendant /></ProtectedRoute>} />
        <Route path="/intendant/recus" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Reçus & PDF" icon={ClipboardList} component={Paiements} /></ProtectedRoute>} />
        <Route path="/intendant/notifications" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Notifications" icon={Bell} component={Messages} /></ProtectedRoute>} />
        <Route path="/intendant/profil" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><IntendantPage title="Mon profil" icon={Settings} component={Parametres} /></ProtectedRoute>} />
        <Route path="/intendant/*" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><DashboardIntendant /></ProtectedRoute>} />

        {/* ── Fallbacks ── */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
