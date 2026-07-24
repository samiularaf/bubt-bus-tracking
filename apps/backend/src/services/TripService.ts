import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { estimateEtaMinutes } from '../utils/haversine.js';
import type { EtaQuery } from '../validation/trip.js';

export class TripService {
  async getTodayTrips(busId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.trip.findMany({
      where: { busId, tripDate: { gte: startOfDay, lte: endOfDay } },
      orderBy: { scheduledTimeUtc: 'asc' },
      include: { driver: true },
    });
  }

  async getTripDetail(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { bus: { include: { route: true } }, driver: true },
    });
    if (!trip) throw new AppError('NOT_FOUND', 'Trip not found.', 404);
    return trip;
  }

  async getLivePosition(tripId: string) {
    const position = await prisma.tripPosition.findFirst({
      where: { tripId },
      orderBy: { recordedAt: 'desc' },
    });
    if (!position)
      throw new AppError('NOT_FOUND', 'No live position available for this trip yet.', 404);
    return position;
  }

  /** ETA to the user's selected/nearest stop, per the confirmed Phase 0 decision (haversine, no routing API). */
  async calculateEta(
    tripId: string,
    query: EtaQuery,
  ): Promise<{ etaMinutes: number; stopName: string }> {
    const trip = await this.getTripDetail(tripId);
    const position = await this.getLivePosition(tripId);

    let targetStop;
    if (query.stopId) {
      targetStop = await prisma.stop.findUnique({ where: { id: query.stopId } });
      if (!targetStop) throw new AppError('NOT_FOUND', 'Stop not found.', 404);
    } else if (query.lat !== undefined && query.lng !== undefined) {
      const stops = await prisma.stop.findMany({ where: { routeId: trip.bus.routeId } });
      targetStop = stops.reduce((nearest, stop) => {
        const d = (a: number, b: number) => Math.hypot(a - query.lat!, b - query.lng!);
        return d(stop.latitude, stop.longitude) < d(nearest.latitude, nearest.longitude)
          ? stop
          : nearest;
      }, stops[0]);
    }

    if (!targetStop) {
      throw new AppError('VALIDATION_ERROR', 'Provide either stopId or lat/lng.', 400);
    }

    const etaMinutes = estimateEtaMinutes(
      { lat: position.latitude, lng: position.longitude },
      { lat: targetStop.latitude, lng: targetStop.longitude },
    );

    return { etaMinutes, stopName: targetStop.name };
  }

  async setReminder(userId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError('NOT_FOUND', 'Trip not found.', 404);

    const existing = await prisma.reminder.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });
    if (existing) throw new AppError('CONFLICT', 'Reminder already set for this trip.', 409);

    return prisma.reminder.create({ data: { userId, tripId } });
  }

  async cancelReminder(userId: string, tripId: string): Promise<void> {
    await prisma.reminder.deleteMany({ where: { userId, tripId } });
  }

  async listLiveTrips() {
    return prisma.trip.findMany({
      where: { status: 'running' },
      include: { bus: true, driver: true },
    });
  }

  // --- Driver actions ---

  async startTrip(tripId: string, driverId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { bus: { include: { driver: true } } },
    });
    if (!trip) throw new AppError('NOT_FOUND', 'Trip not found.', 404);
    if (trip.bus.driver?.id !== driverId) {
      throw new AppError('FORBIDDEN', 'This trip is not assigned to you.', 403);
    }
    if (trip.status !== 'upcoming') {
      throw new AppError('TRIP_ALREADY_STARTED', 'This trip has already been started.', 409);
    }

    return prisma.trip.update({
      where: { id: tripId },
      data: { status: 'running', startedAt: new Date(), driverId },
      include: { bus: true },
    });
  }

  async finishTrip(tripId: string, driverId: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError('NOT_FOUND', 'Trip not found.', 404);
    if (trip.driverId !== driverId) {
      throw new AppError('FORBIDDEN', 'This trip is not assigned to you.', 403);
    }
    if (trip.status !== 'running') {
      throw new AppError('TRIP_NOT_RUNNING', 'This trip is not currently running.', 409);
    }

    return prisma.trip.update({
      where: { id: tripId },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async sendEmergencyAlert(tripId: string, driverId: string, message?: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError('NOT_FOUND', 'Trip not found.', 404);

    return prisma.emergencyAlert.create({
      data: { tripId, driverId, message },
      include: { driver: true },
    });
    // Phase 9 wires the actual broadcast to admin:live + broadcast:all rooms.
  }

  // GPS ingestion (broadcast + debounced persistence) is owned by TrackingService
  // as of Phase 9 — see services/TrackingService.ts. Previously duplicated here.
}

export const tripService = new TripService();
