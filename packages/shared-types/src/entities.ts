// Mirrors schema.sql table structures — keep in sync with DATABASE_DESIGN.md.

import type {
  UserRole,
  UserDesignation,
  AccountStatus,
  ScheduleType,
  DayGroup,
  TripStatus,
  NoticeCategory,
} from './enums.js';

export interface User {
  id: string;
  role: UserRole;
  name: string;

  // User-role fields
  email: string | null;
  emailVerified: boolean;
  designation: UserDesignation | null;
  idNumber: string | null;

  // Driver-role fields
  driverId: string | null;
  phone: string | null;
  bloodGroup: string | null;
  nidOrLicense: string | null;
  address: string | null;
  emergencyContact: string | null;
  photoUrl: string | null;
  assignedBusId: string | null;
  joiningDate: string | null; // ISO date
  mustChangePassword: boolean;

  // Admin-role fields
  adminId: string | null;

  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  id: string;
  routeId: string;
  name: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
}

export interface Bus {
  id: string;
  busNumber: string;
  routeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  name: string;
  type: ScheduleType;
  isActive: boolean;
  createdAt: string;
}

export interface ScheduleTripTemplate {
  id: string;
  scheduleId: string;
  busId: string;
  dayGroup: DayGroup;
  departureTime: string; // "HH:mm:ss"
}

export interface Trip {
  id: string;
  busId: string;
  scheduleTripTemplateId: string | null;
  driverId: string | null;
  tripDate: string; // ISO date
  scheduledTimeUtc: string; // ISO datetime
  status: TripStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface TripPosition {
  id: number;
  tripId: string;
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  recordedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  tripId: string;
  notified15min: boolean;
  notifiedTripStart: boolean;
}

export interface FavoriteBus {
  id: string;
  userId: string;
  busId: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  createdBy: string;
  publishedAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  subject: string;
  message: string;
  createdAt: string;
}
