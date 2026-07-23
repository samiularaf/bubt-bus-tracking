import { z } from 'zod';

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1),
  category: z.enum([
    'general',
    'holiday',
    'ramadan',
    'exam',
    'delay',
    'cancellation',
    'emergency',
    'maintenance',
  ]),
});
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

export const updateNoticeSchema = createNoticeSchema.partial();
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;

export const createComplaintSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1),
});
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  designation: z.enum(['student', 'teacher', 'staff']).optional(),
  idNumber: z.string().trim().max(50).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const statusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});
export type StatusInput = z.infer<typeof statusSchema>;
