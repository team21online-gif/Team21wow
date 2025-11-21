import React, { PropsWithChildren } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './pages/Auth';
import Layout from './components/Layout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { CourseView } from './pages/student/CourseView';
import { getCurrentUser } from './services/db';
import { UserRole } from './types';

const PrivateRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const user = getCurrentUser();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const RoleRoute: React.FC<PropsWithChildren<{ role: UserRole }>> = ({ role, children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.MENTOR:
      return <MentorDashboard />;
    case UserRole.STUDENT:
      return <StudentDashboard />;
    default:
      return <div>Unknown Role</div>;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Shared Dashboard Route that renders based on role */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardRouter />
          </PrivateRoute>
        } />

        {/* Role Specific Routes */}
        <Route path="/admin/*" element={
          <PrivateRoute>
             <RoleRoute role={UserRole.ADMIN}>
                <AdminDashboard />
             </RoleRoute>
          </PrivateRoute>
        } />
        
        <Route path="/mentor/*" element={
          <PrivateRoute>
             <RoleRoute role={UserRole.MENTOR}>
                <MentorDashboard />
             </RoleRoute>
          </PrivateRoute>
        } />

        <Route path="/course/:id" element={
          <PrivateRoute>
             {/* Students and Mentors/Admins can view courses, but UI adapts */}
             <CourseView />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;