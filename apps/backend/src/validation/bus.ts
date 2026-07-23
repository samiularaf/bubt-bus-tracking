import { z } from 'zod';

export const createBusSchema = z.object({
  busNumber: z.string().trim().min(1).max(20),
  routeId: z.string().uuid(),
});
export type CreateBusInput = z.infer<typeof createBusSchema>;

export const updateBusSchema = createBusSchema.partial();
export type UpdateBusInput = z.infer<typeof updateBusSchema>;

export const createRouteSchema = z.object({
  name: z.string().trim().min(1).max(120),
});
export type CreateRouteInput = z.infer<typeof createRouteSchema>;

export const updateRouteSchema = createRouteSchema.partial();
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

export const createStopSchema = z.object({
  name: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  stopOrder: z.number().int().min(0),
});
export type CreateStopInput = z.infer<typeof createStopSchema>;

export const updateStopSchema = createStopSchema.partial();
export type UpdateStopInput = z.infer<typeof updateStopSchema>;
