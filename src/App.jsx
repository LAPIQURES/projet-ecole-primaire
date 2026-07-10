import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DashboardDirecteur from './pages/DashboardDirecteur';
import DashboardIntendant from './pages/DashboardIntendant';
import DashboardEnseignant from './pages/DashboardEnseignant';
import DashboardParent from './pages/DashboardParent';
import Emploi from './pages/Emploi';
import Eleves from './pages/Eleves';
import Classes from './pages/Classes';
import Enseignants from './pages/Enseignants';
import Paiements from './pages/Paiements';
import Salles from './pages/Salles';
import Parents from './pages/Parents';
import Inscriptions from './pages/Inscriptions';
import Impayes from './pages/Impayes';
import Parametres from './pages/Parametres';
import Messages from './pages/Messages';
import { Calendar, MessageSquare, Settings, ClipboardList, BookOpen, Bus as BusIcon } from 'lucide-react';
import CoursEvaluations from './pages/CoursEvaluations';
import Tranches from './pages/Tranches';
import Rapports from './pages/Rapports';
import Bulletins from './pages/Bulletins';
import Personnel from './pages/Personnel';
import SaisieNotes from './pages/SaisieNotes';
import TeacherEvaluations from './pages/TeacherEvaluations';
import TeacherProfile from './pages/TeacherProfile';
import TeacherMessages from './pages/TeacherMessages';
import TeacherEleves from './pages/TeacherEleves';
import TeacherCours from './pages/TeacherCours';
import TeacherCourseList from './pages/TeacherCourseList';
import TeacherSchedule from './pages/TeacherSchedule';
import TeacherStudentList from './pages/TeacherStudentList';
import TeacherEvaluationCreate from './pages/TeacherEvaluationCreate';
import Layout from './components/Layout';
import ParentLayout from './components/ParentLayout';
import TeacherLayout from './components/TeacherLayout';
import BusPage from './pages/Bus';
import TeacherAttendanceRegister from './components/TeacherAttendanceRegister';
import DisciplineModule from './components/DisciplineModule';
import NotificationManager from './components/NotificationManager';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!allowedRoles.includes(user.role)) {
      // Redirect to correct dashboard based on role
      if (user.role === 'enseignant') return <Navigate to="/enseignant/dashboard" />;
      if (user.role === 'parent') return <Navigate to="/parent/dashboard" />;
      if (user.role === 'directeur') return <Navigate to="/directeur/dashboard" />;
      if (user.role === 'intendant') return <Navigate to="/intendant/dashboard" />;
      return <Navigate to="/dashboard" />;
    }
  }
  return children;
}

function ComingSoon({ title, icon: Icon, color = '#2563eb', description }) {
  return (
    <Layout title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon size={36} color={color} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
          {description || 'Cette section sera disponible prochainement.'}
        </div>
      </div>
    </Layout>
  );
}

function ParentComingSoon({ title, icon: Icon, color = '#8b5cf6', description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon size={36} color={color} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
        {description || 'Cette section sera disponible prochainement.'}
      </div>
    </div>
  );
}

function TeacherComingSoon({ title, icon: Icon, color = '#10b981', description }) {
  return (
    <TeacherLayout title={title} subtitle="Navigation enseignant fixe">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon size={36} color={color} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
          {description || 'Cette section sera disponible prochainement.'}
        </div>
      </div>
    </TeacherLayout>
  );
}

// Redirect après login selon le rôle
function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'enseignant') return <Navigate to="/enseignant/dashboard" />;
  if (user.role === 'parent') return <Navigate to="/parent/dashboard" />;
  if (user.role === 'directeur') return <Navigate to="/directeur/dashboard" />;
  if (user.role === 'intendant') return <Navigate to="/intendant/dashboard" />;
  return <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── ADMIN ── */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/directeur/dashboard" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DashboardDirecteur /></ProtectedRoute>} />
        <Route path="/directeur/profil" element={<ProtectedRoute allowedRoles={['directeur','admin','superadmin']}><DashboardDirecteur defaultTab="profil" /></ProtectedRoute>} />
        <Route path="/intendant/dashboard" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><DashboardIntendant /></ProtectedRoute>} />
        <Route path="/intendant/paiements" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><Paiements /></ProtectedRoute>} />
        <Route path="/intendant/tranches" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><Tranches /></ProtectedRoute>} />
        <Route path="/intendant/impayes" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin','directeur']}><Impayes /></ProtectedRoute>} />
        <Route path="/intendant/profil" element={<ProtectedRoute allowedRoles={['intendant','admin','superadmin']}><DashboardIntendant defaultTab="profil" /></ProtectedRoute>} />
        <Route path="/eleves" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur']}><Eleves /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur']}><Classes /></ProtectedRoute>} />
        <Route path="/enseignants" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur']}><Enseignants /></ProtectedRoute>} />
        <Route path="/paiements" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur','intendant']}><Paiements /></ProtectedRoute>} />
        <Route path="/salles" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur']}><Salles /></ProtectedRoute>} />
        <Route path="/bus" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><BusPage /></ProtectedRoute>} />
        <Route path="/bus-scolaire" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><BusPage /></ProtectedRoute>} />
        <Route path="/parents" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Parents /></ProtectedRoute>} />
        <Route path="/inscriptions" element={<ProtectedRoute allowedRoles={['admin','superadmin','intendant','directeur']}><Inscriptions /></ProtectedRoute>} />
        <Route path="/impayes" element={<ProtectedRoute allowedRoles={['admin','superadmin','intendant','directeur']}><Impayes /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Parametres /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur','intendant']}><Messages /></ProtectedRoute>} />
        <Route path="/evaluations" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><CoursEvaluations /></ProtectedRoute>} />
        <Route path="/bulletins" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur']}><Bulletins /></ProtectedRoute>} />
        <Route path="/tranches" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur','intendant']}><Tranches /></ProtectedRoute>} />
        <Route path="/rapports" element={<ProtectedRoute allowedRoles={['admin','superadmin','directeur']}><Rapports /></ProtectedRoute>} />
        <Route path="/saisie-notes" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><SaisieNotes /></ProtectedRoute>} />
        <Route path="/personnel" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><Personnel /></ProtectedRoute>} />
        <Route path="/emploi-du-temps" element={<ProtectedRoute allowedRoles={['admin','superadmin','enseignant']}><Emploi /></ProtectedRoute>} />
        <Route path="/discipline" element={<ProtectedRoute allowedRoles={['admin','superadmin']}>
          <Layout><DisciplineModule /></Layout>
        </ProtectedRoute>} />

        {/* ── ENSEIGNANT ── */}
        <Route path="/enseignant/dashboard" element={<ProtectedRoute allowedRoles={['enseignant']}><DashboardEnseignant /></ProtectedRoute>} />
        <Route path="/enseignant/evaluations" element={<ProtectedRoute allowedRoles={['enseignant']}><TeacherEvaluationCreate /></ProtectedRoute>} />
        <Route path="/enseignant/eleves" element={<ProtectedRoute allowedRoles={['enseignant']}><TeacherStudentList /></ProtectedRoute>} />
        <Route path="/enseignant/cours" element={<ProtectedRoute allowedRoles={['enseignant']}><TeacherCourseList /></ProtectedRoute>} />
        <Route path="/enseignant/messages" element={<ProtectedRoute allowedRoles={['enseignant']}><TeacherMessages /></ProtectedRoute>} />
        <Route path="/enseignant/profil" element={<ProtectedRoute allowedRoles={['enseignant']}><TeacherProfile /></ProtectedRoute>} />
        <Route path="/enseignant/cahier-appel" element={<ProtectedRoute allowedRoles={['enseignant']}>
          <TeacherLayout><TeacherAttendanceRegister /></TeacherLayout>
        </ProtectedRoute>} />
        <Route path="/enseignant/emploi-du-temps" element={<ProtectedRoute allowedRoles={['enseignant']}><TeacherSchedule /></ProtectedRoute>} />
        <Route path="/enseignant/*" element={<ProtectedRoute allowedRoles={['enseignant']}><DashboardEnseignant /></ProtectedRoute>} />

        {/* ── PARENT ── */}
        <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
        <Route path="/parent/enfant" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
        <Route path="/parent/emploi-du-temps" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
        <Route path="/parent/bulletins" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
        <Route path="/parent/messages" element={<ProtectedRoute allowedRoles={['parent']}><ParentLayout title="Messages" subtitle="Messagerie interne"><Messages noLayout={true} /></ParentLayout></ProtectedRoute>} />
        <Route path="/parent/paiements" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
        <Route path="/parent/*" element={<Navigate to="/parent/dashboard" replace />} />

        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
