import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ContextForm } from './components/ContextForm';
import { KeywordAnalysisView } from './components/KeywordAnalysis';
import { KeywordClusters } from './components/KeywordClusters';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { UserManagement } from './components/admin/UserManagement';
import { authService } from './services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route path="/" element={<ContextForm />} />
          <Route path="/keywords" element={<KeywordAnalysisView />} />
          <Route path="/clusters" element={<KeywordClusters />} />
          <Route path="/users" element={
            <PrivateRoute adminOnly>
              <UserManagement />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;