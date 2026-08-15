# Project Specification — BUBT Bus Tracking System

## 1. Goal

Build a modern university transport management system where students, teachers, and staff can track university buses in real time — reducing waiting time, improving communication between passengers and the transport office, and centralizing all transport-related information.

## 2. Roles

Three roles exist: **User**, **Driver**, **Administrator**.

### 2.1 User (Student / Teacher / Staff)
These three groups are functionally identical — same interface, same permissions, no differentiation in what they can do. "Designation" is stored only for display purposes (optional field at registration).

### 2.2 Driver
Created exclusively by an Administrator. Cannot self-register. Each driver is permanently assigned to exactly one bus.

### 2.3 Administrator
Controls the entire transport system. In v1, only two fixed seed accounts exist — no "create admin" UI.

---

## 3. Core Business Logic

### 3.1 No Bus Assignment for Users
**Users are not assigned to buses.** Any user can view and track any university bus. This was explicitly re-confirmed during planning — a UI reference screenshot that appeared to show a "assigned bus" was for color/style inspiration only and does not represent actual functionality.

### 3.2 Trip-Based Tracking
- A bus has one fixed route.
- A bus operates multiple trips per day (e.g., Bus 01: Mirpur → Kazipara → Agargaon → BUBT, running at 7:00 AM, 1:00 PM, 3:30 PM, 5:00 PM).
- Users open the app, see all buses (number, route, current status, next trip).
- Opening a bus shows **Today's Trips**, split into Completed / Running / Upcoming.
- The user chooses which trip to track. The system always tracks the currently running trip for live data.

### 3.3 Schedule System
Administrators can define multiple named schedules: **Regular, Ramadan, Exam, Holiday, Special Events.** Only one schedule is active system-wide at a time. Activating a different schedule automatically regenerates that day's trip times from the new schedule's templates.

**Confirmed against the real BUBT bus notice (Ref: BUBT-Reg-511-03-26):** within a single active schedule, bus departure times differ between **Sun–Thu** and **Friday** (a recurring weekly pattern, not a schedule switch), and **Saturday has no bus service at all**. A schedule with zero trip templates (e.g. during an Eid closure) represents a full route suspension.

---

## 4. User Features

**Can do:**
Register (email + OTP verification) · Login · Logout · View all buses · Search buses/routes/stops · Open bus details · Track live bus location · View ETA (to selected/nearest stop, auto-detected via geolocation) · View next stop · View driver info · Call driver (backend-mediated `tel:` link) · Report a problem · View transport notices · Receive push notifications (Web Push + in-app bell fallback) · Set trip reminders · Mark a bus as favorite · View/edit profile · Change password

*Note: "Favorite" is a personal convenience pin only (e.g., surfaces the bus higher on the Home list) — it does not restrict or assign the user to that bus. Users can still freely browse and track any bus, favorited or not, consistent with §3.1 ("No Bus Assignment for Users").*

**Cannot do:**
Manage buses, edit routes, create schedules, publish notices, manage drivers

---

## 5. Reminder System

Each upcoming trip has a "Set Reminder" button. If enabled, the user receives:
1. A notification **15 minutes before** scheduled departure
2. A notification **when the driver starts the trip** ("Bus 01 has started. The bus will depart in approximately five minutes.")

---

## 6. Driver Features

Drivers are created by Administrators with the following profile (all required unless noted):
Driver ID (auto-generated) · Full Name · Phone Number · Blood Group · NID/License Number · Address · Emergency Contact · Assigned Bus · Email (optional) · Photo (optional) · Joining Date · Active/Inactive status

**After login, driver sees:** Today's Bus, Today's Route, Today's Trips.

**Trip control:** "Slide to Start Trip" (Uber/Pathao-style) → GPS sharing begins automatically → subscribed users notified. Driver can Start Trip, Finish Trip (manual only — no GPS auto-complete), and Send Emergency Alert (broadcasts to Admin dashboard and all app users).

Driver cannot modify buses, routes, or schedules. First login forces a password change.

---

## 7. Administrator Features

Manage Users · Manage Drivers · Manage Buses · Manage Routes · Manage Stops · Manage Trips · Manage Schedules · Manage Notices · Manage Complaints (simple list view, no status workflow) · Monitor Live Bus Locations

---

## 8. Notice System

Categories: General, Holiday, Ramadan, Exam, Delay, Cancellation, Emergency, Maintenance. Notices are broadcast to all users (no per-bus/per-route targeting in v1).

---

## 9. Live Tracking

**Flow:** Driver GPS → Backend → Database → WebSocket (Socket.IO) → Users

**Users see:** Map (Leaflet + OpenStreetMap), bus marker, route, current stop, next stop, ETA (haversine-based, no external routing API), current speed, driver name, driver phone.

**Offline handling:** if a driver loses signal mid-trip, GPS points are cached on-device and flushed to the server once reconnected.

---

## 10. Authentication Summary

| Actor | Registration | Verification | Login ID |
|---|---|---|---|
| User | Self-service | OTP (6-digit, 10-min expiry) | Email |
| Driver | Admin-created | None (Admin-created is trusted) | Driver ID |
| Administrator | Fixed DB seed (v1) | None | Admin ID |

Full detail: `ACTOR_AUTH_AND_CREDENTIALS.pdf`.

---

## 11. Explicitly Out of Scope (v1)

- Bus seat capacity / occupancy tracking
- Analytics/reporting dashboards (on-time %, route usage, etc.)
- Multi-institution / multi-tenant support
- Admin sub-roles or permission tiers
- Notice targeting by bus/route
- Complaint status workflow or admin replies
- Admin override to force-end a stuck/abandoned trip
- File/image uploads beyond optional driver photo

---

## 12. Design Principles

Modern, minimal, fast, professional, responsive, easy to use. No UI overcomplication. Bus tracking reachable in ≤2 clicks.
