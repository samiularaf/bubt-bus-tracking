import type { TripStatus } from '@bubt/shared-types';
import { MOCK_BUSES } from '../buses/api';

/**
 * MOCK trip data. Times are generated relative to "now" so the demo always
 * shows one running trip, a couple of completed, and a couple upcoming —
 * regardless of when this is viewed, per Phase 7's "mock data" rule.
 */

export interface MockTrip {
  id: string;
  busId: string;
  scheduledTime: string; // ISO
  status: TripStatus;
  currentStopName?: string;
  nextStopName?: string;
  etaMinutes?: number;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function offsetFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function buildTripsForBus(busId: string, stops: string[]): MockTrip[] {
  return [
    {
      id: `${busId}-trip-1`,
      busId,
      scheduledTime: offsetFromNow(-180),
      status: 'completed',
    },
    {
      id: `${busId}-trip-2`,
      busId,
      scheduledTime: offsetFromNow(-15),
      status: 'running',
      currentStopName: stops[Math.min(1, stops.length - 1)],
      nextStopName: stops[Math.min(2, stops.length - 1)],
      etaMinutes: 8,
    },
    {
      id: `${busId}-trip-3`,
      busId,
      scheduledTime: offsetFromNow(150),
      status: 'upcoming',
    },
    {
      id: `${busId}-trip-4`,
      busId,
      scheduledTime: offsetFromNow(300),
      status: 'upcoming',
    },
  ];
}

const MOCK_TRIPS: Record<string, MockTrip[]> = Object.fromEntries(
  MOCK_BUSES.map((bus) => [
    bus.id,
    buildTripsForBus(
      bus.id,
      bus.stops.map((s) => s.name),
    ),
  ]),
);

export async function mockGetTodayTrips(busId: string): Promise<MockTrip[]> {
  await delay(350);
  return MOCK_TRIPS[busId] ?? [];
}

export async function mockGetTrip(tripId: string): Promise<MockTrip | undefined> {
  await delay(300);
  return Object.values(MOCK_TRIPS)
    .flat()
    .find((t) => t.id === tripId);
}

export async function mockGetRunningTripForBus(busId: string): Promise<MockTrip | undefined> {
  await delay(200);
  return (MOCK_TRIPS[busId] ?? []).find((t) => t.status === 'running');
}
