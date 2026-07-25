import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  trip: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../config/prisma.js', () => ({ prisma: mockPrisma }));

const { tripService } = await import('./TripService.js');

describe('TripService.startTrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NOT_FOUND if the trip does not exist', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue(null);
    await expect(tripService.startTrip('missing-trip', 'driver-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it("throws FORBIDDEN if the requesting driver is not assigned to this trip's bus", async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      status: 'upcoming',
      bus: { driver: { id: 'someone-else' } },
    });
    await expect(tripService.startTrip('trip-1', 'driver-1')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('throws TRIP_ALREADY_STARTED if the trip is not upcoming', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      status: 'running',
      bus: { driver: { id: 'driver-1' } },
    });
    await expect(tripService.startTrip('trip-1', 'driver-1')).rejects.toMatchObject({
      code: 'TRIP_ALREADY_STARTED',
    });
  });

  it('successfully starts an upcoming trip assigned to the correct driver', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      status: 'upcoming',
      bus: { driver: { id: 'driver-1' }, busNumber: 'Padma' },
    });
    mockPrisma.trip.update.mockResolvedValue({
      id: 'trip-1',
      status: 'running',
      bus: { busNumber: 'Padma' },
    });

    const result = await tripService.startTrip('trip-1', 'driver-1');

    expect(result.status).toBe('running');
    expect(mockPrisma.trip.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'trip-1' },
        data: expect.objectContaining({ status: 'running', driverId: 'driver-1' }),
      }),
    );
  });
});

describe('TripService.finishTrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NOT_FOUND if the trip does not exist', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue(null);
    await expect(tripService.finishTrip('missing-trip', 'driver-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it("throws FORBIDDEN if the trip isn't assigned to the requesting driver", async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      status: 'running',
      driverId: 'other-driver',
    });
    await expect(tripService.finishTrip('trip-1', 'driver-1')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('throws TRIP_NOT_RUNNING if the trip has not been started', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      status: 'upcoming',
      driverId: 'driver-1',
    });
    await expect(tripService.finishTrip('trip-1', 'driver-1')).rejects.toMatchObject({
      code: 'TRIP_NOT_RUNNING',
    });
  });

  it('successfully finishes a running trip', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      status: 'running',
      driverId: 'driver-1',
    });
    mockPrisma.trip.update.mockResolvedValue({ id: 'trip-1', status: 'completed' });

    const result = await tripService.finishTrip('trip-1', 'driver-1');
    expect(result.status).toBe('completed');
  });
});
