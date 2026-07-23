import { Router } from 'express';
import { noticeController } from '../controllers/noticeController.js';
import { complaintController } from '../controllers/complaintController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createNoticeSchema,
  updateNoticeSchema,
  createComplaintSchema,
  paginationQuerySchema,
} from '../validation/misc.js';

export const noticeAndComplaintRouter = Router();

// Notices
noticeAndComplaintRouter.get(
  '/notices',
  validate(paginationQuerySchema, 'query'),
  asyncHandler(noticeController.list),
);
noticeAndComplaintRouter.get('/notices/:id', asyncHandler(noticeController.detail));

noticeAndComplaintRouter.use('/admin/notices', requireAuth, requireRole('admin'));
noticeAndComplaintRouter.post(
  '/admin/notices',
  validate(createNoticeSchema),
  asyncHandler(noticeController.publish),
);
noticeAndComplaintRouter.patch(
  '/admin/notices/:id',
  validate(updateNoticeSchema),
  asyncHandler(noticeController.update),
);
noticeAndComplaintRouter.delete('/admin/notices/:id', asyncHandler(noticeController.remove));

// Complaints
noticeAndComplaintRouter.post(
  '/complaints',
  requireAuth,
  requireRole('user'),
  validate(createComplaintSchema),
  asyncHandler(complaintController.submit),
);
noticeAndComplaintRouter.get(
  '/admin/complaints',
  requireAuth,
  requireRole('admin'),
  validate(paginationQuerySchema, 'query'),
  asyncHandler(complaintController.list),
);
