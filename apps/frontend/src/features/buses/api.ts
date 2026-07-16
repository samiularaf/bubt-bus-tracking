import type { Bus, Route, Stop } from '@bubt/shared-types';

/**
 * MOCK data — Phase 7 rule: "Use mock data. No backend connection."
 * Reuses the real 5-bus BUBT fleet from the seed data plan (DATABASE_DESIGN.md §6)
 * so screens look authentic rather than showing "Bus 01, Bus 02" placeholders.
 */

export interface MockBus extends Bus {
  busNumber: string;
  routeName: string;
  stops: Stop[];
  driverName: string;
  driverPhone: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const now = new Date().toISOString();

const ROUTE_DEFS: Array<{
  busNumber: string;
  routeName: string;
  driverName: string;
  stops: string[];
}> = [
  {
    busNumber: 'Buriganga',
    routeName: 'Asad Gate - Shyamoli - Mirpur 1 - Rainkhola - BUBT',
    driverName: 'Md. Karim Hossain',
    stops: ['Asad Gate', 'Shyamoli', 'Mirpur 1', 'Rainkhola', 'BUBT Campus'],
  },
  {
    busNumber: 'Padma',
    routeName: 'Shyamoli (Shishumela) - Agargaon - Kazipara - Mirpur 10 - Proshika - BUBT',
    driverName: 'Md. Rafiqul Islam',
    stops: [
      'Shyamoli (Shishumela)',
      'Agargaon',
      'Kazipara',
      'Mirpur 10',
      'Proshika',
      'BUBT Campus',
    ],
  },
  {
    busNumber: 'Meghna',
    routeName: 'Mirpur 14 - Mirpur 10 (Original) - Mirpur 11 - Proshika - BUBT',
    driverName: 'Abdul Malek',
    stops: ['Mirpur 14', 'Mirpur 10 (Original)', 'Mirpur 11', 'Proshika', 'BUBT Campus'],
  },
  {
    busNumber: 'Jamuna',
    routeName: 'ECB Square - Kalshi Bridge - Mirpur 12 - Duaripara - BUBT',
    driverName: 'Md. Shahin Alam',
    stops: ['ECB Square', 'Kalshi Bridge', 'Mirpur 12', 'Duaripara', 'BUBT Campus'],
  },
  {
    busNumber: 'Brahmaputra',
    routeName:
      'Nabinagar - Jahangirnagar - Savar - Hemayetpur - Aminbazar - Gabtoli - Mazar Road - Mirpur 1 - BUBT',
    driverName: 'Md. Jashim Uddin',
    stops: [
      'Nabinagar',
      'Jahangirnagar',
      'Savar',
      'Hemayetpur',
      'Aminbazar',
      'Gabtoli',
      'Mazar Road',
      'Mirpur 1',
      'BUBT Campus',
    ],
  },
];

export const MOCK_BUSES: MockBus[] = ROUTE_DEFS.map((def, index) => ({
  id: `bus-${index + 1}`,
  busNumber: def.busNumber,
  routeId: `route-${index + 1}`,
  routeName: def.routeName,
  driverName: def.driverName,
  driverPhone: `01700-00000${index}`,
  createdAt: now,
  updatedAt: now,
  stops: def.stops.map((name, stopIndex) => ({
    id: `stop-${index + 1}-${stopIndex}`,
    routeId: `route-${index + 1}`,
    name,
    latitude: 23.75 + stopIndex * 0.01 + index * 0.02,
    longitude: 90.35 + stopIndex * 0.005 + index * 0.01,
    stopOrder: stopIndex,
  })),
}));

export async function mockGetBuses(): Promise<MockBus[]> {
  await delay(400);
  return MOCK_BUSES;
}

export async function mockGetBus(busId: string): Promise<MockBus | undefined> {
  await delay(300);
  return MOCK_BUSES.find((b) => b.id === busId);
}

export async function mockSearchBuses(query: string): Promise<MockBus[]> {
  await delay(300);
  const q = query.toLowerCase().trim();
  if (!q) return MOCK_BUSES;
  return MOCK_BUSES.filter(
    (b) => b.busNumber.toLowerCase().includes(q) || b.routeName.toLowerCase().includes(q),
  );
}

export type { Route };
