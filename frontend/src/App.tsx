import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
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

```tsx
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8EC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E9DCC6] border-t-[#476B3F] rounded-full animate-spin"></div>

          <p className="text-xs font-bold text-[#34452F] tracking-[0.2em] uppercase">
            Loading TRAIT Chamber...
          </p>

          <div className="w-32 h-1 rounded-full bg-[#E9DCC6] overflow-hidden">
            <div className="h-full w-1/2 bg-[#EAA34B] rounded-full animate-pulse"></div>
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
```