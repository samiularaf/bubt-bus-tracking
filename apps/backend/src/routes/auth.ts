import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validation/auth.js';

export const authRouter = Router();

authRouter.post('/auth/register', validate(registerSchema), asyncHandler(authController.register));
authRouter.post(
  '/auth/verify-otp',
  validate(verifyOtpSchema),
  asyncHandler(authController.verifyOtp),
);
authRouter.post(
  '/auth/resend-otp',
  validate(resendOtpSchema),
  asyncHandler(authController.resendOtp),
);
authRouter.post('/auth/login', validate(loginSchema), asyncHandler(authController.login));
authRouter.post(
  '/auth/refresh',
  validate(refreshTokenSchema),
  asyncHandler(authController.refresh),
);
authRouter.post(
  '/auth/logout',
  requireAuth,
  validate(refreshTokenSchema),
  asyncHandler(authController.logout),
);
authRouter.post(
  '/auth/change-password',
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);
authRouter.post(
  '/auth/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);
authRouter.post(
  '/auth/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);
