import { Router } from 'express';
import { tripController } from '../controllers/tripController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { etaQuerySchema } from '../validation/trip.js';

export const tripRouter = Router();

tripRouter.get('/buses/:busId/trips/today', asyncHandler(tripController.todayForBus));
tripRouter.get('/trips/:id', asyncHandler(tripController.detail));
tripRouter.get('/trips/:id/live', requireAuth, asyncHandler(tripController.live));
tripRouter.get(
  '/trips/:id/eta',
  requireAuth,
  validate(etaQuerySchema, 'query'),
  asyncHandler(tripController.eta),
);

tripRouter.post(
  '/trips/:id/reminder',
  requireAuth,
  requireRole('user'),
  asyncHandler(tripController.setReminder),
);
tripRouter.delete(
  '/trips/:id/reminder',
  requireAuth,
  requireRole('user'),
  asyncHandler(tripController.cancelReminder),
);

tripRouter.get(
  '/admin/trips/live',
  requireAuth,
  requireRole('admin'),
  asyncHandler(tripController.adminLive),
);
