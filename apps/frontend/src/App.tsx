import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DriverLoginPage from './pages/DriverLoginPage';
import DriverChangePasswordPage from './pages/DriverChangePasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { UserLayout } from './features/user/components/UserLayout';
import HomePage from './pages/HomePage';
import BusSearchPage from './pages/BusSearchPage';
import BusDetailPage from './pages/BusDetailPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import NoticesListPage from './pages/NoticesListPage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import ReportProblemPage from './pages/ReportProblemPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import RoutinePage from './pages/RoutinePage';

export default function App() {
  return (
    <Routes>
      {/* Authentication module */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/driver/login" element={<DriverLoginPage />} />
      <Route path="/driver/change-password" element={<DriverChangePasswordPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* User module — bottom-tab shell wraps everything below */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/track" element={<BusSearchPage />} />
        <Route path="/buses/:busId" element={<BusDetailPage />} />
        <Route path="/trips/:tripId" element={<LiveTrackingPage />} />
        <Route path="/notices" element={<NoticesListPage />} />
        <Route path="/notices/:noticeId" element={<NoticeDetailPage />} />
        <Route path="/report-problem" element={<ReportProblemPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/change-password" element={<ChangePasswordPage />} />
      </Route>
    </Routes>
  );
}
