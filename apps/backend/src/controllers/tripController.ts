import type { Request, Response } from 'express';
import { tripService } from '../services/TripService.js';
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
    ok(res, await tripService.startTrip(req.params.id, req.user!.id));
  },

  finish: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await tripService.finishTrip(req.params.id, req.user!.id));
  },

  emergency: async (req: AuthenticatedRequest, res: Response) => {
    ok(
      res,
      await tripService.sendEmergencyAlert(req.params.id, req.user!.id, req.body.message),
      201,
    );
  },

  position: async (req: AuthenticatedRequest, res: Response) => {
    await tripService.ingestPosition(req.params.id, req.body);
    ok(res, { recorded: true });
  },
};
