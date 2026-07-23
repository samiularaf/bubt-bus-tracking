import { Router } from 'express';
import { scheduleController } from '../controllers/scheduleController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createScheduleSchema,
  updateScheduleSchema,
  createScheduleTemplateSchema,
  updateScheduleTemplateSchema,
} from '../validation/trip.js';

export const scheduleRouter = Router();

scheduleRouter.use('/admin/schedules', requireAuth, requireRole('admin'));
scheduleRouter.use('/admin/templates', requireAuth, requireRole('admin'));

scheduleRouter.get('/admin/schedules', asyncHandler(scheduleController.list));
scheduleRouter.post(
  '/admin/schedules',
  validate(createScheduleSchema),
  asyncHandler(scheduleController.create),
);
scheduleRouter.patch(
  '/admin/schedules/:id',
  validate(updateScheduleSchema),
  asyncHandler(scheduleController.update),
);
scheduleRouter.post('/admin/schedules/:id/activate', asyncHandler(scheduleController.activate));
scheduleRouter.get(
  '/admin/schedules/:id/templates',
  asyncHandler(scheduleController.listTemplates),
);
scheduleRouter.post(
  '/admin/schedules/:id/templates',
  validate(createScheduleTemplateSchema),
  asyncHandler(scheduleController.createTemplate),
);

scheduleRouter.patch(
  '/admin/templates/:id',
  validate(updateScheduleTemplateSchema),
  asyncHandler(scheduleController.updateTemplate),
);
scheduleRouter.delete('/admin/templates/:id', asyncHandler(scheduleController.deleteTemplate));
