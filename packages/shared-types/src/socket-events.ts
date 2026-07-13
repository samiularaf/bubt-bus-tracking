// Mirrors the WebSocket event reference in API_DESIGN.md §9 — keep in sync.

export interface TripPositionEvent {
  tripId: string;
  lat: number;
  lng: number;
  speedKmh: number | null;
  timestamp: string;
}

export interface TripStartedEvent {
  tripId: string;
  busNumber: string;
}

export interface TripFinishedEvent {
  tripId: string;
}

export interface TripEmergencyEvent {
  tripId: string;
  driverName: string;
  timestamp: string;
}

export interface DriverPositionPayload {
  tripId: string;
  lat: number;
  lng: number;
  speedKmh: number | null;
  timestamp: string;
  /** true when this point was cached offline and is being flushed on reconnect */
  queued?: boolean;
}

/** Events the server emits to clients */
export interface ServerToClientEvents {
  'trip:position': (payload: TripPositionEvent) => void;
  'trip:started': (payload: TripStartedEvent) => void;
  'trip:finished': (payload: TripFinishedEvent) => void;
  'trip:emergency': (payload: TripEmergencyEvent) => void;
}

/** Events clients emit to the server */
export interface ClientToServerEvents {
  'trip:join': (payload: { tripId: string }) => void;
  'trip:leave': (payload: { tripId: string }) => void;
  'driver:position': (payload: DriverPositionPayload) => void;
  'admin:live:subscribe': () => void;
}
