// Mirrors the Postgres ENUM types defined in schema.sql — keep in sync.

export type UserRole = 'user' | 'driver' | 'admin';

export type UserDesignation = 'student' | 'teacher' | 'staff';

export type AccountStatus = 'active' | 'inactive';

export type ScheduleType = 'regular' | 'ramadan' | 'exam' | 'holiday' | 'special';

/** Sun-Thu vs Friday timing pattern. Saturday has no service — no template needed. */
export type DayGroup = 'sun_thu' | 'friday';

export type TripStatus = 'upcoming' | 'running' | 'completed';

export type NoticeCategory =
  | 'general'
  | 'holiday'
  | 'ramadan'
  | 'exam'
  | 'delay'
  | 'cancellation'
  | 'emergency'
  | 'maintenance';

export type NotificationType =
  | 'reminder_15min'
  | 'trip_started'
  | 'notice'
  | 'emergency'
  | 'delay'
  | 'cancellation'
  | 'schedule_change';
