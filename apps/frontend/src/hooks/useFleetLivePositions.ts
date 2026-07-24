import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socketClient';

interface FleetPosition {
  tripId: string;
  lat: number;
  lng: number;
  speedKmh: number | null;
  updatedAt: string;
}

/**
 * Subscribes to the admin:live room and accumulates the latest known
 * position per trip. Note: the broadcast payload carries tripId, not busId
 * (per API_DESIGN.md §9) — associating a live position with a specific bus
 * number requires the real /admin/trips/live REST lookup (Phase 8's
 * endpoint), which full frontend-backend integration will wire in later;
 * for now this proves the live socket feed itself works end-to-end.
 */
export function useFleetLivePositions() {
  const [positions, setPositions] = useState<Record<string, FleetPosition>>({});

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit('admin:live:subscribe');

    function handlePosition(payload: {
      tripId: string;
      lat: number;
      lng: number;
      speedKmh: number | null;
      timestamp: string;
    }) {
      setPositions((prev) => ({
        ...prev,
        [payload.tripId]: {
          tripId: payload.tripId,
          lat: payload.lat,
          lng: payload.lng,
          speedKmh: payload.speedKmh,
          updatedAt: payload.timestamp,
        },
      }));
    }

    socket.on('trip:position', handlePosition);
    return () => {
      socket.off('trip:position', handlePosition);
    };
  }, []);

  return Object.values(positions);
}
