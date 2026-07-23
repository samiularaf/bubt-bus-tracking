import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  updateProfileSchema,
  pushSubscriptionSchema,
  paginationQuerySchema,
} from '../validation/misc.js';

export const userRouter = Router();

userRouter.use('/users/me', requireAuth, requireRole('user'));

userRouter.get('/users/me', asyncHandler(userController.getMe));
userRouter.patch('/users/me', validate(updateProfileSchema), asyncHandler(userController.updateMe));

userRouter.get('/users/me/favorites', asyncHandler(userController.listFavorites));
userRouter.post('/users/me/favorites/:busId', asyncHandler(userController.addFavorite));
userRouter.delete('/users/me/favorites/:busId', asyncHandler(userController.removeFavorite));

userRouter.get('/users/me/reminders', asyncHandler(userController.listReminders));

userRouter.get(
  '/users/me/notifications',
  validate(paginationQuerySchema, 'query'),
  asyncHandler(userController.listNotifications),
);
userRouter.patch(
  '/users/me/notifications/:id/read',
  asyncHandler(userController.markNotificationRead),
);

userRouter.post(
  '/users/me/push-subscription',
  validate(pushSubscriptionSchema),
  asyncHandler(userController.addPushSubscription),
);
userRouter.delete(
  '/users/me/push-subscription',
  asyncHandler(userController.removePushSubscription),
);
