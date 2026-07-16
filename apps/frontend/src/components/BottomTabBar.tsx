import { NavLink } from 'react-router-dom';
import { Home, MapPin, Bell, Calendar, User } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/track', label: 'Track', icon: MapPin },
  { to: '/notices', label: 'Notices', icon: Bell },
  { to: '/routine', label: 'Routine', icon: Calendar },
  { to: '/profile', label: 'Profile', icon: User },
];

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-surface border-t border-border flex">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] ${
              isActive ? 'text-primary' : 'text-textSecondary'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
