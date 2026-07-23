import { z } from 'zod';

export const createDriverSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1, 'Phone number is required'),
  bloodGroup: z.string().trim().min(1, 'Blood group is required').max(5),
  nidOrLicense: z.string().trim().min(1, 'NID or License number is required'),
  address: z.string().trim().min(1, 'Address is required'),
  emergencyContact: z.string().trim().min(1, 'Emergency contact is required'),
  assignedBusId: z.string().uuid('A valid assigned bus is required'),
  email: z.string().trim().toLowerCase().email().optional(),
  photoUrl: z.string().url().optional(),
});
export type CreateDriverInput = z.infer<typeof createDriverSchema>;

export const updateDriverSchema = createDriverSchema.partial();
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;

export const driverStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});
export type DriverStatusInput = z.infer<typeof driverStatusSchema>;
