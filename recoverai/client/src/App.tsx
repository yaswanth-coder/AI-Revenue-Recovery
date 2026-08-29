import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { Dashboard } from './pages/Dashboard';
import { RevenueRisk } from './pages/RevenueRisk';
import { RecoveryOperations } from './pages/RecoveryOperations';
import { AIAgent } from './pages/AIAgent';
import { Transactions } from './pages/Transactions';
import { TransactionDetail } from './pages/TransactionDetail';
import { Simulator } from './pages/Simulator';
import { Analytics } from './pages/Analytics';
import { AuditLogs } from './pages/AuditLogs';
import { Policies } from './pages/Policies';
import { Profile } from './pages/Profile';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Pages ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* ── Admin / User Dashboard (limited access) ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredPersona="USER">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Operator Dashboard (full access — MAINTAINER only) ── */}
          <Route
            element={
              <ProtectedRoute requiredPersona="MAINTAINER">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/revenue-risk" element={<RevenueRisk />} />
            <Route path="/recovery" element={<RecoveryOperations />} />
            <Route path="/agent" element={<AIAgent />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
