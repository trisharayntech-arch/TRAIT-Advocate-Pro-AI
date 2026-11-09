import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Cases } from './pages/Cases';
import { Clients } from './pages/Clients';
import { Documents } from './pages/Documents';
import { Assistant } from './pages/Assistant';
import { Drafting } from './pages/Drafting';
import { Research } from './pages/Research';
import { Search } from './pages/Search';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Pricing } from './pages/Pricing';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          backgroundColor: '#FFFFF0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="flex flex-col items-center gap-5">
          <div
            className="h-12 w-12 animate-spin rounded-full border-4"
            style={{
              borderColor: '#E9E4D5',
              borderTopColor: '#476B3F',
            }}
          />

          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: '#34452F' }}
          >
            Loading TRAIT Chamber...
          </p>

          <div
            className="h-1 w-32 overflow-hidden rounded-full"
            style={{ backgroundColor: '#E9E4D5' }}
          >
            <div
              className="h-full w-1/2 animate-pulse rounded-full"
              style={{ backgroundColor: '#EAA34B' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cases" element={<Cases />} />
            <Route path="clients" element={<Clients />} />
            <Route path="documents" element={<Documents />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="drafting" element={<Drafting />} />
            <Route path="research" element={<Research />} />
            <Route path="search" element={<Search />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="pricing" element={<Pricing />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;