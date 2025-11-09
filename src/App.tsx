import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './components/page/AuthContext';
import { AppProvider } from 'src/components/page/AppContext';
import SignIn from 'src/components/page/SignIn';
import Dashboard from 'src/components/page/Dashboard';
import ClientsList from 'src/components/page/ClientsList';
import ClientProfile from 'src/components/page/ClientProfile';
import Calendar from 'src/components/page/Calendar';
import SessionLog from 'src/components/page/SessionLog';
import ProgramBuilder from 'src/components/page/ProgramBuilder';
import ExerciseLibrary from 'src/components/page/ExerciseLibrary';
import Reports from 'src/components/page/Reports';
import Settings from 'src/components/page/Settings';
import Layout from 'src/components/page/Layout';

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