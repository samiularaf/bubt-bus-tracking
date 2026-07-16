import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ChevronRight, Clock, Navigation2, MapPin } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { NotificationBell } from '../components/NotificationBell';
import { MOCK_BUSES, type MockBus } from '../features/buses/api';
import { mockGetTodayTrips, type MockTrip } from '../features/trips/api';
import { mockGetProfile, mockGetNotifications, MOCK_FAVORITE_BUS_IDS } from '../features/user/api';
import { mockGetNotices } from '../features/notices/api';
import { InstallAppPrompt } from '../components/InstallAppPrompt';
import type { Notice } from '@bubt/shared-types';

interface BusWithRunningTrip {
  bus: MockBus;
  runningTrip?: MockTrip;
  isFavorite: boolean;
}

export default function HomePage() {
  const [name, setName] = useState('');
  const [buses, setBuses] = useState<BusWithRunningTrip[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profile, notificationList, noticeList] = await Promise.all([
        mockGetProfile(),
        mockGetNotifications(),
        mockGetNotices(),
      ]);
      setName(profile.name);
      setUnreadCount(notificationList.filter((n) => !n.isRead).length);
      setNotices(noticeList.slice(0, 2));

      const withTrips = await Promise.all(
        MOCK_BUSES.map(async (bus) => ({
          bus,
          runningTrip: (await mockGetTodayTrips(bus.id)).find((t) => t.status === 'running'),
          isFavorite: MOCK_FAVORITE_BUS_IDS.has(bus.id),
        })),
      );
      // Favorites surface first — convenience only, not an assignment.
      withTrips.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
      setBuses(withTrips);
      setIsLoading(false);
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-primary tracking-wide">BUBT TRANSIT</p>
        </div>
        <NotificationBell unreadCount={unreadCount} />
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-hero p-5 text-white mb-5">
        <p className="text-sm text-white/80">{greeting},</p>
        <h1 className="text-xl font-bold mt-0.5">{name || '...'}</h1>
      </div>

      <InstallAppPrompt />

      <Link
        to="/track"
        className="flex items-center gap-2 bg-surface border border-border rounded-card px-4 h-11 text-sm text-textSecondary mb-5"
      >
        <Search size={16} />
        Search buses, routes, or stops
      </Link>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-textPrimary">All buses</h2>
      </div>

      {isLoading && <p className="text-sm text-textSecondary">Loading buses...</p>}

      <div className="flex flex-col gap-3 mb-6">
        {buses.map(({ bus, runningTrip, isFavorite }) => (
          <Link key={bus.id} to={`/buses/${bus.id}`}>
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-textPrimary">{bus.busNumber}</h3>
                  {isFavorite && <Star size={14} className="text-warning fill-warning" />}
                </div>
                <StatusBadge status={runningTrip ? 'running' : 'upcoming'} />
              </div>
              <p className="text-xs text-textSecondary mt-1 line-clamp-1">{bus.routeName}</p>
              {runningTrip && (
                <div className="flex items-center gap-4 mt-3 text-xs text-textSecondary">
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> ETA {runningTrip.etaMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation2 size={13} /> Next: {runningTrip.nextStopName}
                  </span>
                </div>
              )}
              <div className="flex justify-end mt-2">
                <ChevronRight size={16} className="text-textSecondary" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-textPrimary">Latest notices</h2>
        <Link to="/notices" className="text-xs text-primary font-medium">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {notices.map((notice) => (
          <Link key={notice.id} to={`/notices/${notice.id}`}>
            <Card>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-textPrimary">{notice.title}</h3>
                  <p className="text-xs text-textSecondary mt-1 line-clamp-2">{notice.body}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
