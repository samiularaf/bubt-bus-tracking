import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell } from 'lucide-react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { MOCK_BUSES, type MockBus } from '../features/buses/api';
import { mockGetTodayTrips, type MockTrip } from '../features/trips/api';
import { MOCK_REMINDER_TRIP_IDS } from '../features/user/api';

interface ReminderRow {
  trip: MockTrip;
  bus: MockBus;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function RoutinePage() {
  const [rows, setRows] = useState<ReminderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allRows: ReminderRow[] = [];
      for (const bus of MOCK_BUSES) {
        const trips = await mockGetTodayTrips(bus.id);
        for (const trip of trips) {
          if (MOCK_REMINDER_TRIP_IDS.has(trip.id)) {
            allRows.push({ trip, bus });
          }
        }
      }
      setRows(allRows);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className="px-4 pt-5">
      <h1 className="text-xl font-bold text-textPrimary mb-4">Your routine</h1>

      {isLoading && <p className="text-sm text-textSecondary">Loading...</p>}

      {!isLoading && rows.length === 0 && (
        <EmptyState
          icon={<Calendar size={22} />}
          title="No reminders set"
          description="Set a reminder on any upcoming trip and it'll show up here."
          action={
            <Link to="/track">
              <Button variant="secondary">Browse buses</Button>
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {rows.map(({ trip, bus }) => (
          <Link key={trip.id} to={`/buses/${bus.id}`}>
            <Card className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-textPrimary">{bus.busNumber}</h3>
                <p className="text-xs text-textSecondary mt-0.5">
                  {formatTime(trip.scheduledTime)}
                </p>
              </div>
              <Bell size={16} className="text-primary" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
