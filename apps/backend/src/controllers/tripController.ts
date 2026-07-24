import type { Request, Response } from 'express';
import { tripService } from '../services/TripService.js';
import { trackingService } from '../services/TrackingService.js';
import { notificationService } from '../services/NotificationService.js';
import { getIO } from '../sockets/io.js';
import { ok } from '../utils/respond.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { EtaQuery } from '../validation/trip.js';

export const tripController = {
  todayForBus: async (req: Request, res: Response) => {
    ok(res, await tripService.getTodayTrips(req.params.busId));
  },

  detail: async (req: Request, res: Response) => {
    ok(res, await tripService.getTripDetail(req.params.id));
  },

  live: async (req: Request, res: Response) => {
    ok(res, await tripService.getLivePosition(req.params.id));
  },

  eta: async (req: Request, res: Response) => {
    ok(res, await tripService.calculateEta(req.params.id, req.query as unknown as EtaQuery));
  },

  setReminder: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await tripService.setReminder(req.user!.id, req.params.id), 201);
  },

  cancelReminder: async (req: AuthenticatedRequest, res: Response) => {
    await tripService.cancelReminder(req.user!.id, req.params.id);
    ok(res, { cancelled: true });
  },

  adminLive: async (_req: Request, res: Response) => {
    ok(res, await tripService.listLiveTrips());
  },

  // --- Driver actions ---

  start: async (req: AuthenticatedRequest, res: Response) => {
    const trip = await tripService.startTrip(req.params.id, req.user!.id);
    const busNumber = (trip as { bus: { busNumber: string } }).bus.busNumber;
    getIO().to(`trip:${trip.id}`).emit('trip:started', { tripId: trip.id, busNumber });
    // Push + in-app notification to everyone with a reminder on this trip (Phase 10).
    notificationService.notifyTripStarted(trip.id, busNumber).catch((err) => {
      console.error(`[notifications] failed to notify trip start for ${trip.id}:`, err);
    });
    ok(res, trip);
  },

  finish: async (req: AuthenticatedRequest, res: Response) => {
    const trip = await tripService.finishTrip(req.params.id, req.user!.id);
    getIO().to(`trip:${trip.id}`).emit('trip:finished', { tripId: trip.id });
    trackingService.clearDebounceState(trip.id);
    ok(res, trip);
  },

  emergency: async (req: AuthenticatedRequest, res: Response) => {
    const alert = await tripService.sendEmergencyAlert(
      req.params.id,
      req.user!.id,
      req.body.message,
    );
    const driverName = (alert as { driver?: { name?: string } }).driver?.name ?? 'Driver';
    const busNumber =
      (alert as { trip?: { bus?: { busNumber?: string } } }).trip?.bus?.busNumber ?? 'A bus';
    const payload = { tripId: req.params.id, driverName, timestamp: new Date().toISOString() };
    // Confirmed decision: broadcasts to Admin dashboard AND all app users, not just this trip's viewers.
    getIO().to('admin:live').emit('trip:emergency', payload);
    getIO().emit('trip:emergency', payload); // broadcast:all — every connected socket
    notificationService.notifyEmergency(req.params.id, busNumber).catch((err) => {
      console.error(`[notifications] failed to notify emergency for trip ${req.params.id}:`, err);
    });
    ok(res, alert, 201);
  },

  position: async (req: AuthenticatedRequest, res: Response) => {
    // REST endpoint is specifically for the offline-queue-flush case (API_DESIGN.md §9);
    // normal live pings go through the driver:position socket event instead.
    await trackingService.ingestPosition(req.params.id, req.body);
    ok(res, { recorded: true });
  },
};
