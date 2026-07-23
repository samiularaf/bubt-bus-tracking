import { z } from 'zod';

export const etaQuerySchema = z.object({
  stopId: z.string().uuid().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});
export type EtaQuery = z.infer<typeof etaQuerySchema>;

export const emergencyAlertSchema = z.object({
  message: z.string().trim().max(500).optional(),
});
export type EmergencyAlertInput = z.infer<typeof emergencyAlertSchema>;

export const positionSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).optional(),
  timestamp: z.string().datetime(),
  queued: z.boolean().optional(),
});
export type PositionInput = z.infer<typeof positionSchema>;

export const createScheduleSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(['regular', 'ramadan', 'exam', 'holiday', 'special']),
});
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = createScheduleSchema.partial();
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const createScheduleTemplateSchema = z.object({
  busId: z.string().uuid(),
  dayGroup: z.enum(['sun_thu', 'friday']),
  departureTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'departureTime must be HH:mm or HH:mm:ss'),
});
export type CreateScheduleTemplateInput = z.infer<typeof createScheduleTemplateSchema>;

export const updateScheduleTemplateSchema = createScheduleTemplateSchema.partial();
export type UpdateScheduleTemplateInput = z.infer<typeof updateScheduleTemplateSchema>;
