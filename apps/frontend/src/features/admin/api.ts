import type { DayGroup, ScheduleType, NoticeCategory } from '@bubt/shared-types';
import { MOCK_BUSES } from '../buses/api';
import { MOCK_NOTICES } from '../notices/api';

/**
 * MOCK Admin API — Phase 7 rule: "Use mock data. No backend connection."
 * All CRUD here mutates an in-memory store, so create/edit/delete/activate
 * actions are genuinely reflected on next read within the session — not
 * just static fixtures, since Admin screens are fundamentally CRUD UIs and
 * a fake read-only list wouldn't actually exercise the interaction.
 */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Buses & Routes
// ---------------------------------------------------------------------------

export interface AdminBusRow {
  id: string;
  busNumber: string;
  routeName: string;
  status: 'active' | 'inactive';
}

const adminBuses: AdminBusRow[] = MOCK_BUSES.map((b) => ({
  id: b.id,
  busNumber: b.busNumber,
  routeName: b.routeName,
  status: 'active',
}));

export async function mockGetAdminBuses(): Promise<AdminBusRow[]> {
  await delay(300);
  return [...adminBuses];
}

export async function mockCreateBus(busNumber: string, routeName: string): Promise<AdminBusRow> {
  await delay(400);
  const bus: AdminBusRow = { id: newId('bus'), busNumber, routeName, status: 'active' };
  adminBuses.push(bus);
  return bus;
}

export async function mockToggleBusStatus(busId: string): Promise<void> {
  await delay(300);
  const bus = adminBuses.find((b) => b.id === busId);
  if (bus) bus.status = bus.status === 'active' ? 'inactive' : 'active';
}

export interface AdminRouteRow {
  id: string;
  name: string;
  stopCount: number;
}

const adminRoutes: AdminRouteRow[] = MOCK_BUSES.map((b) => ({
  id: b.routeId,
  name: b.routeName,
  stopCount: b.stops.length,
}));

export async function mockGetAdminRoutes(): Promise<AdminRouteRow[]> {
  await delay(300);
  return [...adminRoutes];
}

export async function mockCreateRoute(name: string): Promise<AdminRouteRow> {
  await delay(400);
  const route: AdminRouteRow = { id: newId('route'), name, stopCount: 0 };
  adminRoutes.push(route);
  return route;
}

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

export interface AdminDriverRow {
  id: string;
  driverId: string;
  name: string;
  phone: string;
  assignedBusNumber: string;
  status: 'active' | 'inactive';
}

const adminDrivers: AdminDriverRow[] = MOCK_BUSES.map((b, i) => ({
  id: newId('driver'),
  driverId: `DRV-00${i + 1}`,
  name: b.driverName,
  phone: b.driverPhone,
  assignedBusNumber: b.busNumber,
  status: 'active',
}));

export async function mockGetAdminDrivers(): Promise<AdminDriverRow[]> {
  await delay(300);
  return [...adminDrivers];
}

export interface CreateDriverInput {
  name: string;
  phone: string;
  bloodGroup: string;
  nidOrLicense: string;
  address: string;
  emergencyContact: string;
  assignedBusNumber: string;
}

export async function mockCreateDriver(
  input: CreateDriverInput,
): Promise<{ driver: AdminDriverRow; temporaryPassword: string }> {
  await delay(500);
  const driverId = `DRV-0${adminDrivers.length + 10}`;
  const driver: AdminDriverRow = {
    id: newId('driver'),
    driverId,
    name: input.name,
    phone: input.phone,
    assignedBusNumber: input.assignedBusNumber,
    status: 'active',
  };
  adminDrivers.push(driver);
  return { driver, temporaryPassword: `Bubt@${driverId}!` };
}

export async function mockToggleDriverStatus(driverId: string): Promise<void> {
  await delay(300);
  const driver = adminDrivers.find((d) => d.id === driverId);
  if (driver) driver.status = driver.status === 'active' ? 'inactive' : 'active';
}

export async function mockResetDriverPassword(_driverId: string): Promise<string> {
  await delay(400);
  return `Temp@${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------

export interface AdminScheduleRow {
  id: string;
  name: string;
  type: ScheduleType;
  isActive: boolean;
  templateCount: number;
}

const adminSchedules: AdminScheduleRow[] = [
  { id: 'sched-1', name: 'Regular', type: 'regular', isActive: true, templateCount: 20 },
  {
    id: 'sched-2',
    name: 'Eid-ul-Fitr Holiday',
    type: 'holiday',
    isActive: false,
    templateCount: 0,
  },
  { id: 'sched-3', name: 'Ramadan', type: 'ramadan', isActive: false, templateCount: 15 },
];

export async function mockGetAdminSchedules(): Promise<AdminScheduleRow[]> {
  await delay(300);
  return [...adminSchedules];
}

export async function mockActivateSchedule(scheduleId: string): Promise<void> {
  await delay(500);
  for (const s of adminSchedules) {
    s.isActive = s.id === scheduleId;
  }
}

export async function mockCreateSchedule(
  name: string,
  type: ScheduleType,
): Promise<AdminScheduleRow> {
  await delay(400);
  const schedule: AdminScheduleRow = {
    id: newId('sched'),
    name,
    type,
    isActive: false,
    templateCount: 0,
  };
  adminSchedules.push(schedule);
  return schedule;
}

export type { DayGroup };

// ---------------------------------------------------------------------------
// Notices
// ---------------------------------------------------------------------------

const adminNotices = [...MOCK_NOTICES];

export async function mockGetAdminNotices() {
  await delay(300);
  return [...adminNotices];
}

export async function mockCreateNotice(title: string, body: string, category: NoticeCategory) {
  await delay(500);
  const notice = {
    id: newId('notice'),
    title,
    body,
    category,
    createdBy: 'admin-1',
    publishedAt: new Date().toISOString(),
  };
  adminNotices.unshift(notice);
  return notice;
}

export async function mockDeleteNotice(noticeId: string): Promise<void> {
  await delay(300);
  const index = adminNotices.findIndex((n) => n.id === noticeId);
  if (index >= 0) adminNotices.splice(index, 1);
}

// ---------------------------------------------------------------------------
// Complaints
// ---------------------------------------------------------------------------

export interface AdminComplaintRow {
  id: string;
  userName: string;
  subject: string;
  message: string;
  createdAt: string;
}

const adminComplaints: AdminComplaintRow[] = [
  {
    id: 'complaint-1',
    userName: 'Rafi Ahmed',
    subject: 'Bus arrived very late',
    message: 'The Padma bus arrived 20 minutes late this morning without any notice.',
    createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    id: 'complaint-2',
    userName: 'Nusrat Jahan',
    subject: 'Driver was not answering calls',
    message: 'Tried calling the Meghna driver twice but no response.',
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
];

export async function mockGetAdminComplaints(): Promise<AdminComplaintRow[]> {
  await delay(300);
  return [...adminComplaints];
}

// ---------------------------------------------------------------------------
// Emergency Alerts Log
// ---------------------------------------------------------------------------

export interface AdminAlertRow {
  id: string;
  busNumber: string;
  driverName: string;
  message: string;
  createdAt: string;
}

const adminAlerts: AdminAlertRow[] = [
  {
    id: 'alert-1',
    busNumber: 'Jamuna',
    driverName: 'Md. Shahin Alam',
    message: 'Minor mechanical issue near Kalshi Bridge, resolved on-site.',
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
];

export async function mockGetAdminAlerts(): Promise<AdminAlertRow[]> {
  await delay(300);
  return [...adminAlerts];
}

// ---------------------------------------------------------------------------
// Dashboard summary
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalBuses: number;
  activeDrivers: number;
  runningTripsNow: number;
  openComplaints: number;
}

export async function mockGetDashboardStats(): Promise<DashboardStats> {
  await delay(350);
  return {
    totalBuses: adminBuses.filter((b) => b.status === 'active').length,
    activeDrivers: adminDrivers.filter((d) => d.status === 'active').length,
    runningTripsNow: 1,
    openComplaints: adminComplaints.length,
  };
}
