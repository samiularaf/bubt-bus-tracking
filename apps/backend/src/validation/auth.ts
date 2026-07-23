import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  designation: z.enum(['student', 'teacher', 'staff']).optional(),
  idNumber: z.string().trim().max(50).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

export const resendOtpSchema = z.object({
  userId: z.string().uuid(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email/ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).optional(), // omitted for the driver forced-change flow
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
