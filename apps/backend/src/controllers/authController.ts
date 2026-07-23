import type { Request, Response } from 'express';
import { authService } from '../services/AuthService.js';
import { ok } from '../utils/respond.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const authController = {
  register: async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    ok(res, result, 201);
  },

  verifyOtp: async (req: Request, res: Response) => {
    await authService.verifyOtp(req.body.userId, req.body.code);
    ok(res, { verified: true });
  },

  resendOtp: async (req: Request, res: Response) => {
    await authService.resendOtp(req.body.userId);
    ok(res, { sent: true });
  },

  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body.identifier, req.body.password);
    ok(res, result);
  },

  refresh: async (req: Request, res: Response) => {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    ok(res, result);
  },

  logout: async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    ok(res, { loggedOut: true });
  },

  changePassword: async (req: AuthenticatedRequest, res: Response) => {
    await authService.changePassword(req.user!.id, req.body.newPassword, req.body.currentPassword);
    ok(res, { changed: true });
  },

  forgotPassword: async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    ok(res, { sent: true });
  },

  resetPassword: async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.resetToken, req.body.newPassword);
    ok(res, { reset: true });
  },
};
