import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Bell, BellOff, Clock } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { mockGetBus, type MockBus } from '../features/buses/api';
import { mockGetTodayTrips, type MockTrip } from '../features/trips/api';
import {
  MOCK_FAVORITE_BUS_IDS,
  mockToggleFavorite,
  MOCK_REMINDER_TRIP_IDS,
  mockToggleReminder,
} from '../features/user/api';
import { useToast } from '../components/Toast';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function BusDetailPage() {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [bus, setBus] = useState<MockBus | null>(null);
  const [trips, setTrips] = useState<MockTrip[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reminderTripIds, setReminderTripIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!busId) return;
    mockGetBus(busId).then((result) => result && setBus(result));
    mockGetTodayTrips(busId).then(setTrips);
    setIsFavorite(MOCK_FAVORITE_BUS_IDS.has(busId));
    setReminderTripIds(new Set(MOCK_REMINDER_TRIP_IDS));
  }, [busId]);

  async function handleToggleFavorite() {
    if (!busId) return;
    const nowFavorite = await mockToggleFavorite(busId);
    setIsFavorite(nowFavorite);
    showToast(nowFavorite ? 'Added to favorites.' : 'Removed from favorites.', 'success');
  }

  async function handleToggleReminder(tripId: string) {
    const nowSet = await mockToggleReminder(tripId);
    setReminderTripIds((prev) => {
      const next = new Set(prev);
      if (nowSet) next.add(tripId);
      else next.delete(tripId);
      return next;
    });
    showToast(nowSet ? "We'll remind you before departure." : 'Reminder cancelled.', 'info');
  }

  if (!bus) {
    return <p className="p-4 text-sm text-textSecondary">Loading...</p>;
  }

  const grouped = {
    running: trips.filter((t) => t.status === 'running'),
    upcoming: trips.filter((t) => t.status === 'upcoming'),
    completed: trips.filter((t) => t.status === 'completed'),
  };

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-textPrimary">{bus.busNumber}</h1>
        </div>
        <button onClick={handleToggleFavorite} aria-label="Toggle favorite">
          <Star
            size={20}
            className={isFavorite ? 'text-warning fill-warning' : 'text-textSecondary'}
          />
        </button>
      </div>

      <div className="px-4">
        <Card className="mb-3">
          <p className="text-xs font-semibold text-textSecondary mb-1">ROUTE</p>
          <p className="text-sm text-textPrimary">{bus.routeName}</p>
        </Card>
        <Card className="mb-6">
          <p className="text-xs font-semibold text-textSecondary mb-1">DRIVER</p>
          <p className="text-sm text-textPrimary">{bus.driverName}</p>
          <a href={`tel:${bus.driverPhone}`} className="text-xs text-primary font-medium">
            {bus.driverPhone}
          </a>
        </Card>

        {grouped.running.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-textPrimary mb-2">Running now</h2>
            {grouped.running.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card className="mb-2 border-success/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{formatTime(trip.scheduledTime)}</span>
                    <StatusBadge status="running" />
                  </div>
                  <p className="text-xs text-textSecondary">
                    ETA {trip.etaMinutes} min · Next: {trip.nextStopName}
                  </p>
                </Card>
              </Link>
            ))}
          </section>
        )}

        {grouped.upcoming.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-textPrimary mb-2">Upcoming</h2>
            {grouped.upcoming.map((trip) => {
              const hasReminder = reminderTripIds.has(trip.id);
              return (
                <Card key={trip.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-textPrimary">
                      <Clock size={14} className="text-textSecondary" />
                      {formatTime(trip.scheduledTime)}
                    </span>
                    <button
                      onClick={() => handleToggleReminder(trip.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-card border ${
                        hasReminder
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'text-textSecondary border-border'
                      }`}
                    >
                      {hasReminder ? <Bell size={13} /> : <BellOff size={13} />}
                      {hasReminder ? 'Reminder set' : 'Set reminder'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </section>
        )}

        {grouped.completed.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-textPrimary mb-2">Completed</h2>
            {grouped.completed.map((trip) => (
              <Card key={trip.id} className="mb-2 opacity-70">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{formatTime(trip.scheduledTime)}</span>
                  <StatusBadge status="completed" />
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
