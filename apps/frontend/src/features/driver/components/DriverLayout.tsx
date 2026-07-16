import { Outlet, Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

/**
 * Driver nav is intentionally minimal — no bottom tab bar, per
 * UI_UX_PLANNING.md §2: "minimizing distraction while driving."
 */
export function DriverLayout() {
  return (
    <div className="min-h-screen max-w-app mx-auto bg-background">
      <div className="flex justify-end px-4 pt-4">
        <Link to="/driver/profile" aria-label="Driver profile" className="text-textPrimary">
          <UserCircle size={26} />
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
