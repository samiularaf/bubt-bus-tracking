import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link to="/notifications" className="relative inline-flex" aria-label="Notifications">
      <Bell size={22} className="text-textPrimary" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
