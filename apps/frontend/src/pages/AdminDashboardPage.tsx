import { useEffect, useState } from 'react';
import { Bus, UserCog, Activity, MessageSquareWarning, Satellite } from 'lucide-react';
import { Card } from '../components/Card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockGetDashboardStats, type DashboardStats } from '../features/admin/api';
import { MOCK_BUSES } from '../features/buses/api';
import { useFleetLivePositions } from '../hooks/useFleetLivePositions';

const busIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const liveBusIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
});

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const livePositions = useFleetLivePositions();

  useEffect(() => {
    mockGetDashboardStats().then(setStats);
  }, []);

  const statCards = [
    { label: 'Active buses', value: stats?.totalBuses, icon: Bus },
    { label: 'Active drivers', value: stats?.activeDrivers, icon: UserCog },
    { label: 'Trips running now', value: stats?.runningTripsNow, icon: Activity },
    { label: 'Open complaints', value: stats?.openComplaints, icon: MessageSquareWarning },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-textPrimary mb-5">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <Icon size={18} className="text-primary mb-2" />
            <p className="text-2xl font-bold text-textPrimary">{value ?? '—'}</p>
            <p className="text-xs text-textSecondary mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-textPrimary">Live fleet map</h2>
        <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
          <Satellite size={11} />
          {livePositions.length} live signal{livePositions.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="h-96 rounded-card overflow-hidden border border-border">
        <MapContainer center={[23.806, 90.369]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Baseline placeholder markers for buses with no live signal yet */}
          {MOCK_BUSES.map((bus, i) => (
            <Marker key={bus.id} position={[23.79 + i * 0.01, 90.35 + i * 0.01]} icon={busIcon}>
              <Popup>{bus.busNumber} — no live signal yet</Popup>
            </Marker>
          ))}
          {/* Real live positions received over admin:live, per ARCHITECTURE.md §7 */}
          {livePositions.map((pos) => (
            <Marker key={pos.tripId} position={[pos.lat, pos.lng]} icon={liveBusIcon}>
              <Popup>
                Trip {pos.tripId}
                {pos.speedKmh != null && ` — ${Math.round(pos.speedKmh)} km/h`}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
