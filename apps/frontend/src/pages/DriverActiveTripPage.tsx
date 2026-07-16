import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, Wifi } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge, type BadgeStatus } from '../components/StatusBadge';
import { SlideToConfirm } from '../components/SlideToConfirm';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import {
  mockGetDriverContext,
  mockGetDriverTodayTrips,
  mockStartTrip,
  mockFinishTrip,
  mockSendEmergencyAlert,
} from '../features/driver/api';
import type { MockTrip } from '../features/trips/api';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function DriverActiveTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [busNumber, setBusNumber] = useState('');
  const [trip, setTrip] = useState<MockTrip | null>(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [gpsTick, setGpsTick] = useState(0);

  async function refresh() {
    const [ctx, trips] = await Promise.all([mockGetDriverContext(), mockGetDriverTodayTrips()]);
    setBusNumber(ctx.bus.busNumber);
    setTrip(trips.find((t) => t.id === tripId) ?? null);
  }

  useEffect(() => {
    refresh();
  }, [tripId]);

  // Simulated GPS heartbeat while running, purely visual for the mock.
  useEffect(() => {
    if (trip?.status !== 'running') return;
    const interval = setInterval(() => setGpsTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, [trip?.status]);

  async function handleStart() {
    if (!tripId) return;
    await mockStartTrip(tripId);
    showToast(`${busNumber} has started. Users are being notified.`, 'success');
    await refresh();
  }

  async function handleFinish() {
    if (!tripId) return;
    await mockFinishTrip(tripId);
    showToast('Trip finished.', 'success');
    await refresh();
  }

  async function handleSendEmergency() {
    if (!tripId) return;
    setIsSendingAlert(true);
    await mockSendEmergencyAlert(tripId, 'Emergency reported by driver.');
    setIsSendingAlert(false);
    setIsEmergencyOpen(false);
    showToast('Emergency alert sent to Admin and all users.', 'error');
  }

  if (!trip) {
    return <p className="p-4 text-sm text-textSecondary">Loading...</p>;
  }

  return (
    <div className="px-4 pt-2 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-textPrimary">{busNumber}</h1>
        <div className="ml-auto">
          <StatusBadge status={trip.status as BadgeStatus} />
        </div>
      </div>

      <Card className="mb-5 text-center">
        <p className="text-xs text-textSecondary">Scheduled departure</p>
        <p className="text-2xl font-bold text-textPrimary mt-1">{formatTime(trip.scheduledTime)}</p>
      </Card>

      {trip.status === 'running' && (
        <Card className="mb-5 flex items-center gap-2 bg-success/5 border-success/20">
          <Wifi size={16} className="text-success" />
          <p className="text-xs text-textPrimary">
            Broadcasting GPS live
            <span className="text-textSecondary">
              {' '}
              · {gpsTick} update{gpsTick === 1 ? '' : 's'} sent
            </span>
          </p>
        </Card>
      )}

      {trip.status === 'upcoming' && (
        <div className="mb-5">
          <SlideToConfirm label="Slide to Start Trip" onConfirm={handleStart} />
        </div>
      )}

      {trip.status === 'running' && (
        <div className="flex flex-col gap-3 mb-5">
          <SlideToConfirm label="Slide to Finish Trip" onConfirm={handleFinish} />
          <Button variant="danger" onClick={() => setIsEmergencyOpen(true)}>
            <AlertTriangle size={16} />
            Send Emergency Alert
          </Button>
        </div>
      )}

      {trip.status === 'completed' && (
        <Card className="text-center text-sm text-textSecondary">
          This trip has been completed.
        </Card>
      )}

      <Modal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        title="Send emergency alert?"
      >
        <p className="text-sm text-textSecondary mb-4 flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-danger" />
          This immediately notifies the Admin dashboard and broadcasts to all app users. Only use
          this for genuine emergencies.
        </p>
        <Button variant="danger" onClick={handleSendEmergency} isLoading={isSendingAlert}>
          Confirm and send alert
        </Button>
      </Modal>
    </div>
  );
}
