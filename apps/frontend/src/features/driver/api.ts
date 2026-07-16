import { MOCK_BUSES, type MockBus } from '../buses/api';
import { mockGetTodayTrips, type MockTrip } from '../trips/api';

/**
 * MOCK driver API — Phase 7 rule: "Use mock data. No backend connection."
 * Demo driver is fixed to Padma (bus-2) so the module has consistent data
 * to work with across page reloads within a session.
 */

const DEMO_DRIVER_BUS_ID = 'bus-2';
const DEMO_DRIVER_NAME = 'Md. Rafiqul Islam';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-memory trip status overrides, so Start/Finish actually change what
// subsequent reads return within this session (mock persistence).
const statusOverrides = new Map<string, MockTrip['status']>();

export interface DriverContext {
  driverName: string;
  bus: MockBus;
}

export async function mockGetDriverContext(): Promise<DriverContext> {
  await delay(300);
  const bus = MOCK_BUSES.find((b) => b.id === DEMO_DRIVER_BUS_ID)!;
  return { driverName: DEMO_DRIVER_NAME, bus };
}

export async function mockGetDriverTodayTrips(): Promise<MockTrip[]> {
  const trips = await mockGetTodayTrips(DEMO_DRIVER_BUS_ID);
  return trips.map((trip) => ({
    ...trip,
    status: statusOverrides.get(trip.id) ?? trip.status,
  }));
}

export async function mockStartTrip(tripId: string): Promise<void> {
  await delay(500);
  statusOverrides.set(tripId, 'running');
}

export async function mockFinishTrip(tripId: string): Promise<void> {
  await delay(500);
  statusOverrides.set(tripId, 'completed');
}

export async function mockSendEmergencyAlert(_tripId: string, _message: string): Promise<void> {
  await delay(500);
  // Real implementation (Phase 9) broadcasts to admin:live + broadcast:all rooms.
}
