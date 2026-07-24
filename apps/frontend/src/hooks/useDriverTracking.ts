import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../lib/socketClient';
import { apiRequest } from '../lib/apiClient';

interface QueuedPosition {
  lat: number;
  lng: number;
  speedKmh?: number;
  timestamp: string;
}

interface DriverTrackingState {
  isBroadcasting: boolean;
  updatesSent: number;
  isOffline: boolean;
  lastError: string | null;
}

/**
 * Starts broadcasting the driver's real device GPS position over the socket
 * while a trip is running. If the connection drops, points are cached
 * in-memory and flushed via the REST fallback endpoint on reconnect, per
 * the confirmed Phase 0 offline-GPS decision.
 *
 * Note: the socket connection here is not yet authenticated — Phase 9 wires
 * up the real-time transport itself; full JWT-authenticated socket
 * handshakes are flagged as a follow-up hardening item (see PROJECT_RULES.md
 * security baseline) once the frontend is wired to real backend auth.
 */
export function useDriverTracking(tripId: string | null, isActive: boolean) {
  const [state, setState] = useState<DriverTrackingState>({
    isBroadcasting: false,
    updatesSent: 0,
    isOffline: !navigator.onLine,
    lastError: null,
  });

  const offlineQueueRef = useRef<QueuedPosition[]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !tripId) {
      setState((s) => ({ ...s, isBroadcasting: false }));
      return;
    }

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    async function flushOfflineQueue() {
      const queued = offlineQueueRef.current;
      if (queued.length === 0 || !tripId) return;
      offlineQueueRef.current = [];
      for (const point of queued) {
        await apiRequest(`/driver/trips/${tripId}/position`, {
          method: 'POST',
          body: JSON.stringify({ ...point, queued: true }),
        });
      }
    }

    function handleOnline() {
      setState((s) => ({ ...s, isOffline: false }));
      if (!socket.connected) socket.connect();
      flushOfflineQueue();
    }
    function handleOffline() {
      setState((s) => ({ ...s, isOffline: true }));
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, lastError: 'Geolocation is not supported on this device.' }));
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: QueuedPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speedKmh: position.coords.speed != null ? position.coords.speed * 3.6 : undefined,
          timestamp: new Date(position.timestamp).toISOString(),
        };

        if (socket.connected) {
          socket.emit('driver:position', { tripId, ...point, speedKmh: point.speedKmh ?? null });
          setState((s) => ({
            ...s,
            isBroadcasting: true,
            updatesSent: s.updatesSent + 1,
            lastError: null,
          }));
        } else {
          offlineQueueRef.current.push(point);
        }
      },
      (error) => {
        setState((s) => ({ ...s, lastError: error.message }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10_000 },
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tripId, isActive]);

  return state;
}
