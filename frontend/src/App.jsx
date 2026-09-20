import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Members } from './pages/Members';
import { EarnPoints } from './pages/EarnPoints';
import { Ledger } from './pages/Ledger';
import { TierManagement } from './pages/TierManagement';
import { Rewards } from './pages/Rewards';
import { Challenges } from './pages/Challenges';
import { Partners } from './pages/Partners';
import { Analytics } from './pages/Analytics';
import { ProgramConfig } from './pages/ProgramConfig';
import { FraudDetection } from './pages/FraudDetection';
import { Notifications } from './pages/Notifications';
import { Finance } from './pages/Finance';
import { FeedbackManagement } from './pages/FeedbackManagement';
import { ComplaintsManagement } from './pages/ComplaintsManagement';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes: All Roles (including CUSTOMER) */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'LOYALTY_MANAGER', 'STAFF', 'CUSTOMER']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/rewards" element={<Rewards />} />
          </Route>

          {/* Protected Routes: Staff, Loyalty Manager, Super Admin */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'LOYALTY_MANAGER', 'STAFF']} />}>
            <Route path="/members" element={<Members />} />
            <Route path="/earn-points" element={<EarnPoints />} />
          </Route>

          {/* Protected Routes: Loyalty Manager & Super Admin */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'LOYALTY_MANAGER']} />}>
            <Route path="/tier-management" element={<TierManagement />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/feedback" element={<FeedbackManagement />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          {/* Protected Routes: Super Admin Only */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/program-config" element={<ProgramConfig />} />
            <Route path="/fraud-detection" element={<FraudDetection />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/complaints" element={<ComplaintsManagement />} />
            <Route path="/finance" element={<Finance />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
