import type { Response } from 'express';
import { userService } from '../services/UserService.js';
import { ok } from '../utils/respond.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { PaginationQuery } from '../validation/misc.js';

export const userController = {
  getMe: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await userService.getProfile(req.user!.id));
  },

  updateMe: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await userService.updateProfile(req.user!.id, req.body));
  },

  listFavorites: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await userService.listFavorites(req.user!.id));
  },

  addFavorite: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await userService.addFavorite(req.user!.id, req.params.busId), 201);
  },

  removeFavorite: async (req: AuthenticatedRequest, res: Response) => {
    await userService.removeFavorite(req.user!.id, req.params.busId);
    ok(res, { removed: true });
  },

  listReminders: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await userService.listReminders(req.user!.id));
  },

  listNotifications: async (req: AuthenticatedRequest, res: Response) => {
    ok(
      res,
      await userService.listNotifications(req.user!.id, req.query as unknown as PaginationQuery),
    );
  },

  markNotificationRead: async (req: AuthenticatedRequest, res: Response) => {
    await userService.markNotificationRead(req.user!.id, req.params.id);
    ok(res, { read: true });
  },

  addPushSubscription: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await userService.addPushSubscription(req.user!.id, req.body), 201);
  },

  removePushSubscription: async (req: AuthenticatedRequest, res: Response) => {
    await userService.removePushSubscription(req.user!.id, req.body.endpoint);
    ok(res, { removed: true });
  },
};
