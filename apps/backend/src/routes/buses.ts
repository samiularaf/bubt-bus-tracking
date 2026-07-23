import { Router } from 'express';
import { busController } from '../controllers/busController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createBusSchema,
  updateBusSchema,
  createRouteSchema,
  updateRouteSchema,
  createStopSchema,
  updateStopSchema,
} from '../validation/bus.js';
import { statusSchema } from '../validation/misc.js';

export const busRouter = Router();

// Public reads
busRouter.get('/buses', asyncHandler(busController.list));
busRouter.get('/buses/search', asyncHandler(busController.search));
busRouter.get('/buses/:id', asyncHandler(busController.detail));
busRouter.get('/routes', asyncHandler(busController.listRoutes));
busRouter.get('/routes/:id/stops', asyncHandler(busController.routeStops));
busRouter.get('/stops/search', asyncHandler(busController.searchStops));

// Admin writes
busRouter.use('/admin/buses', requireAuth, requireRole('admin'));
busRouter.post('/admin/buses', validate(createBusSchema), asyncHandler(busController.create));
busRouter.patch('/admin/buses/:id', validate(updateBusSchema), asyncHandler(busController.update));
busRouter.patch(
  '/admin/buses/:id/status',
  validate(statusSchema),
  asyncHandler(busController.setStatus),
);

busRouter.use('/admin/routes', requireAuth, requireRole('admin'));
busRouter.post(
  '/admin/routes',
  validate(createRouteSchema),
  asyncHandler(busController.createRoute),
);
busRouter.patch(
  '/admin/routes/:id',
  validate(updateRouteSchema),
  asyncHandler(busController.updateRoute),
);
busRouter.post(
  '/admin/routes/:id/stops',
  validate(createStopSchema),
  asyncHandler(busController.addStop),
);

busRouter.use('/admin/stops', requireAuth, requireRole('admin'));
busRouter.patch(
  '/admin/stops/:id',
  validate(updateStopSchema),
  asyncHandler(busController.updateStop),
);
busRouter.delete('/admin/stops/:id', asyncHandler(busController.deleteStop));
