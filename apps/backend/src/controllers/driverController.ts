import type { Request, Response } from 'express';
import { driverService } from '../services/DriverService.js';
import { authService } from '../services/AuthService.js';
import { tripService } from '../services/TripService.js';
import { ok } from '../utils/respond.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { PaginationQuery } from '../validation/misc.js';
import type { AccountStatus } from '@prisma/client';

export const driverController = {
  // --- Admin-facing ---

  list: async (req: Request, res: Response) => {
    const status = req.query.status as AccountStatus | undefined;
    ok(res, await driverService.list(req.query as unknown as PaginationQuery, status));
  },

  detail: async (req: Request, res: Response) => {
    ok(res, await driverService.get(req.params.id));
  },

  create: async (req: Request, res: Response) => {
    ok(res, await authService.createDriver(req.body), 201);
  },

  update: async (req: Request, res: Response) => {
    ok(res, await driverService.update(req.params.id, req.body));
  },

  setStatus: async (req: Request, res: Response) => {
    ok(res, await driverService.setStatus(req.params.id, req.body.status));
  },

  resetPassword: async (req: Request, res: Response) => {
    ok(res, await authService.resetDriverPassword(req.params.id));
  },

  // --- Driver self-facing ---

  me: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await driverService.get(req.user!.id));
  },

  myTripsToday: async (req: AuthenticatedRequest, res: Response) => {
    const driver = await driverService.get(req.user!.id);
    if (!driver.assignedBusId) {
      return ok(res, []);
    }
    ok(res, await tripService.getTodayTrips(driver.assignedBusId));
  },
};
