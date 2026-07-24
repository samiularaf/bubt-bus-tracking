import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, Clock, Navigation2, Phone, Satellite } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from '../components/Card';
import { mockGetBus, type MockBus } from '../features/buses/api';
import { mockGetTrip, type MockTrip } from '../features/trips/api';
import { estimateEtaMinutes } from '../lib/haversine';
import { useLiveTripPosition } from '../hooks/useLiveTripPosition';

// Default Leaflet marker icons don't resolve correctly under Vite's bundler
// without this explicit override — a well-known Leaflet+bundler quirk.
const busIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Starting fallback position shown until a real live update arrives over
// the socket (see useLiveTripPosition) — was previously a permanent mock.
const FALLBACK_POSITION = {
  lat: 23.8062,
  lng: 90.3687,
  speedKmh: null,
  timestamp: new Date().toISOString(),
};

export default function LiveTrackingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [bus, setBus] = useState<MockBus | null>(null);
  const [trip, setTrip] = useState<MockTrip | null>(null);

  const { position, hasReceivedLive } = useLiveTripPosition(tripId ?? null, FALLBACK_POSITION);

  useEffect(() => {
    if (!tripId) return;
    mockGetTrip(tripId).then(async (t) => {
      if (!t) return;
      setTrip(t);
      const b = await mockGetBus(t.busId);
      if (b) setBus(b);
    });
  }, [tripId]);

  if (!bus || !trip) {
    return <p className="p-4 text-sm text-textSecondary">Loading live position...</p>;
  }

  const destinationStop = bus.stops[bus.stops.length - 1];
  const eta = estimateEtaMinutes(position, {
    lat: destinationStop.latitude,
    lng: destinationStop.longitude,
  });

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-textPrimary flex-1">{bus.busNumber} — Live</h1>
        <span
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
            hasReceivedLive ? 'bg-success/10 text-success' : 'bg-neutral/10 text-neutral'
          }`}
        >
          <Satellite size={11} />
          {hasReceivedLive ? 'Live' : 'Connecting...'}
        </span>
      </div>

      <div className="h-64 w-full">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lng]} icon={busIcon}>
            <Popup>{bus.busNumber} is here</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="text-center">
            <Clock size={18} className="mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-textPrimary">{eta}</p>
            <p className="text-xs text-textSecondary">min to your stop</p>
          </Card>
          <Card className="text-center">
            <Navigation2 size={18} className="mx-auto text-primary mb-1" />
            <p className="text-sm font-semibold text-textPrimary mt-1">{trip.nextStopName}</p>
            <p className="text-xs text-textSecondary">next stop</p>
          </Card>
        </div>

        <Card>
          <p className="text-xs font-semibold text-textSecondary mb-1">DRIVER</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-textPrimary">{bus.driverName}</p>
            <a
              href={`tel:${bus.driverPhone}`}
              className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-card"
            >
              <Phone size={13} /> Call
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
