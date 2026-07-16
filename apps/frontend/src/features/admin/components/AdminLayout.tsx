import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Route as RouteIcon,
  UserCog,
  Calendar,
  Bell,
  MessageSquareWarning,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/buses', label: 'Buses', icon: Bus },
  { to: '/admin/routes', label: 'Routes & Stops', icon: RouteIcon },
  { to: '/admin/drivers', label: 'Drivers', icon: UserCog },
  { to: '/admin/schedules', label: 'Schedules', icon: Calendar },
  { to: '/admin/notices', label: 'Notices', icon: Bell },
  { to: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/admin/alerts', label: 'Alerts', icon: ShieldAlert },
];

export function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-56 shrink-0 bg-textPrimary text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-bold text-sm">BUBT Transit</p>
          <p className="text-xs text-white/50">Transport Office</p>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm ${
                  isActive ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => navigate('/admin/login')}
          className="flex items-center gap-3 px-5 py-4 text-sm text-white/70 hover:text-white border-t border-white/10"
        >
          <LogOut size={17} />
          Log out
        </button>
      </aside>
      <main className="flex-1 p-6 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
