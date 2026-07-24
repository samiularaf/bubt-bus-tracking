import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socketClient';

interface LivePosition {
  lat: number;
  lng: number;
  speedKmh: number | null;
  timestamp: string;
}

/** Joins `trip:<tripId>` on mount, leaves on unmount — per ARCHITECTURE.md §7 room strategy. */
export function useLiveTripPosition(tripId: string | null, fallback: LivePosition) {
  const [position, setPosition] = useState<LivePosition>(fallback);
  const [hasReceivedLive, setHasReceivedLive] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit('trip:join', { tripId });

    function handlePosition(payload: { tripId: string } & LivePosition) {
      if (payload.tripId !== tripId) return;
      setPosition({
        lat: payload.lat,
        lng: payload.lng,
        speedKmh: payload.speedKmh,
        timestamp: payload.timestamp,
      });
      setHasReceivedLive(true);
    }

    socket.on('trip:position', handlePosition);

    return () => {
      socket.emit('trip:leave', { tripId });
      socket.off('trip:position', handlePosition);
    };
  }, [tripId]);

  return { position, hasReceivedLive };
}
