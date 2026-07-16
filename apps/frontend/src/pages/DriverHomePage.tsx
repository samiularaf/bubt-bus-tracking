import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge, type BadgeStatus } from '../components/StatusBadge';
import {
  mockGetDriverContext,
  mockGetDriverTodayTrips,
  type DriverContext,
} from '../features/driver/api';
import type { MockTrip } from '../features/trips/api';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function DriverHomePage() {
  const [context, setContext] = useState<DriverContext | null>(null);
  const [trips, setTrips] = useState<MockTrip[]>([]);

  async function refresh() {
    const [ctx, todayTrips] = await Promise.all([
      mockGetDriverContext(),
      mockGetDriverTodayTrips(),
    ]);
    setContext(ctx);
    setTrips(todayTrips);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!context) {
    return <p className="p-4 text-sm text-textSecondary">Loading...</p>;
  }

  return (
    <div className="px-4 pt-2 pb-6">
      <p className="text-xs font-semibold text-primary tracking-wide mb-1">DRIVER</p>
      <h1 className="text-xl font-bold text-textPrimary mb-4">
        Hi, {context.driverName.split(' ')[0]}
      </h1>

      <Card hero className="mb-5 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="flex items-center gap-2 mb-2">
          <Bus size={18} />
          <span className="font-bold">{context.bus.busNumber}</span>
        </div>
        <p className="text-xs text-white/80 flex items-start gap-1.5">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          {context.bus.routeName}
        </p>
      </Card>

      <h2 className="text-sm font-semibold text-textPrimary mb-2">Today's trips</h2>
      <div className="flex flex-col gap-2">
        {trips.map((trip) => (
          <Link key={trip.id} to={`/driver/trips/${trip.id}`}>
            <Card className="flex items-center justify-between">
              <span className="text-sm font-semibold text-textPrimary">
                {formatTime(trip.scheduledTime)}
              </span>
              <StatusBadge status={trip.status as BadgeStatus} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
