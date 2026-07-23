import { Router } from 'express';
import { driverController } from '../controllers/driverController.js';
import { tripController } from '../controllers/tripController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole, blockIfMustChangePassword } from '../middleware/auth.js';
import { createDriverSchema, updateDriverSchema } from '../validation/driver.js';
import { statusSchema } from '../validation/misc.js';
import { emergencyAlertSchema, positionSchema } from '../validation/trip.js';

export const driverRouter = Router();

// --- Admin-facing driver management ---
driverRouter.use('/admin/drivers', requireAuth, requireRole('admin'));
driverRouter.get('/admin/drivers', asyncHandler(driverController.list));
driverRouter.post(
  '/admin/drivers',
  validate(createDriverSchema),
  asyncHandler(driverController.create),
);
driverRouter.get('/admin/drivers/:id', asyncHandler(driverController.detail));
driverRouter.patch(
  '/admin/drivers/:id',
  validate(updateDriverSchema),
  asyncHandler(driverController.update),
);
driverRouter.patch(
  '/admin/drivers/:id/status',
  validate(statusSchema),
  asyncHandler(driverController.setStatus),
);
driverRouter.post(
  '/admin/drivers/:id/reset-password',
  asyncHandler(driverController.resetPassword),
);

// --- Driver self-facing ---
driverRouter.use('/driver', requireAuth, requireRole('driver'));
driverRouter.get('/driver/me', asyncHandler(driverController.me));
driverRouter.get('/driver/me/trips/today', asyncHandler(driverController.myTripsToday));

// Trip control requires the forced first-login password change to be done first.
driverRouter.post(
  '/driver/trips/:id/start',
  blockIfMustChangePassword,
  asyncHandler(tripController.start),
);
driverRouter.post(
  '/driver/trips/:id/finish',
  blockIfMustChangePassword,
  asyncHandler(tripController.finish),
);
driverRouter.post(
  '/driver/trips/:id/emergency',
  blockIfMustChangePassword,
  validate(emergencyAlertSchema),
  asyncHandler(tripController.emergency),
);
driverRouter.post(
  '/driver/trips/:id/position',
  blockIfMustChangePassword,
  validate(positionSchema),
  asyncHandler(tripController.position),
);
