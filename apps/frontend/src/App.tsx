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
import { DriverLayout } from './features/driver/components/DriverLayout';
import DriverHomePage from './pages/DriverHomePage';
import DriverActiveTripPage from './pages/DriverActiveTripPage';
import DriverProfilePage from './pages/DriverProfilePage';
import { AdminLayout } from './features/admin/components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBusesPage from './pages/AdminBusesPage';
import AdminRoutesPage from './pages/AdminRoutesPage';
import AdminDriversPage from './pages/AdminDriversPage';
import AdminSchedulesPage from './pages/AdminSchedulesPage';
import AdminNoticesPage from './pages/AdminNoticesPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminAlertsPage from './pages/AdminAlertsPage';

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

      {/* Driver module — single-focus shell, no bottom tabs */}
      <Route element={<DriverLayout />}>
        <Route path="/driver" element={<DriverHomePage />} />
        <Route path="/driver/trips/:tripId" element={<DriverActiveTripPage />} />
        <Route path="/driver/profile" element={<DriverProfilePage />} />
      </Route>

      {/* Admin module — sidebar shell, desktop-first */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/buses" element={<AdminBusesPage />} />
        <Route path="/admin/routes" element={<AdminRoutesPage />} />
        <Route path="/admin/drivers" element={<AdminDriversPage />} />
        <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
        <Route path="/admin/notices" element={<AdminNoticesPage />} />
        <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
        <Route path="/admin/alerts" element={<AdminAlertsPage />} />
      </Route>
    </Routes>
  );
}
