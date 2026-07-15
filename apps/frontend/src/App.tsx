import { Routes, Route } from 'react-router-dom';
import { Bus } from 'lucide-react';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DriverLoginPage from './pages/DriverLoginPage';
import DriverChangePasswordPage from './pages/DriverChangePasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';

/**
 * Phase 7 setup-verification home. Phase 7's remaining modules (User, Driver,
 * Admin) replace this with the real role-based routes per UI_UX_PLANNING.md §1.
 */
function SetupCheck() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-app w-full bg-surface border border-border rounded-hero shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Bus className="text-primary" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-textPrimary">BUBT Transit</h1>
        <p className="text-textSecondary text-sm mt-2">
          Authentication module complete. User/Driver/Admin modules land next in Phase 7.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupCheck />} />

      {/* Authentication module */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/driver/login" element={<DriverLoginPage />} />
      <Route path="/driver/change-password" element={<DriverChangePasswordPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
    </Routes>
  );
}
