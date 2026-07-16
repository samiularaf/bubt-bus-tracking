import { useEffect, useState } from 'react';
import { Bus, UserCog, Activity, MessageSquareWarning } from 'lucide-react';
import { Card } from '../components/Card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockGetDashboardStats, type DashboardStats } from '../features/admin/api';
import { MOCK_BUSES } from '../features/buses/api';

const busIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

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

      <h2 className="text-sm font-semibold text-textPrimary mb-2">Live fleet map</h2>
      <div className="h-96 rounded-card overflow-hidden border border-border">
        <MapContainer center={[23.806, 90.369]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {MOCK_BUSES.map((bus, i) => (
            <Marker key={bus.id} position={[23.79 + i * 0.01, 90.35 + i * 0.01]} icon={busIcon}>
              <Popup>{bus.busNumber}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
