import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './components/AuthContext';
import { AppProvider } from './components/AppContext';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import ClientsList from './components/ClientsList';
import ClientProfile from './components/ClientProfile';
import Calendar from './components/Calendar';
import SessionLog from './components/SessionLog';
import ProgramBuilder from './components/ProgramBuilder';
import ExerciseLibrary from './components/ExerciseLibrary';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route 
                path="/signin" 
                element={
                  <PublicRoute>
                    <SignIn />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute>
                    <ClientsList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clients/:id" 
                element={
                  <ProtectedRoute>
                    <ClientProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sessions/:id/log" 
                element={
                  <ProtectedRoute>
                    <SessionLog />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/programs" 
                element={
                  <ProtectedRoute>
                    <ProgramBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/library/exercises" 
                element={
                  <ProtectedRoute>
                    <ExerciseLibrary />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to="/dashboard" replace />} 
              />
              {/* Catch-all route for unmatched paths */}
              <Route 
                path="*" 
                element={<Navigate to="/dashboard" replace />} 
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;