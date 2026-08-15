# Features — BUBT Bus Tracking System

Checklist format. This is the authoritative feature list used to scope every later phase — nothing gets built that isn't here without an explicit requirements change.

---

## User (Student / Teacher / Staff)

### Account

- [ ] Register (name, email, password, optional designation + ID number)
- [ ] Verify email via OTP (6-digit, 10-min expiry, resend rate-limited)
- [ ] Login / Logout
- [ ] View profile
- [ ] Edit profile
- [ ] Change password

### Bus & Route Discovery

- [ ] View all buses (number, route, current status, next trip)
- [ ] Search buses
- [ ] Search routes
- [ ] Search stops
- [ ] Open bus detail page
- [ ] Mark/unmark a bus as favorite (personal convenience pin, not an assignment — user can still track any bus)

### Trip Tracking

- [ ] View Today's Trips per bus (Completed / Running / Upcoming)
- [ ] Track a running trip live on map
- [ ] View ETA to selected/nearest stop (auto-detected via geolocation, manually overridable)
- [ ] View next stop
- [ ] View driver name and photo
- [ ] Call driver (backend-mediated, number not exposed client-side)

### Reminders

- [ ] Set reminder on an upcoming trip
- [ ] Receive reminder 15 min before departure
- [ ] Receive notification when driver starts the trip

### Notices & Notifications

- [ ] View transport notices (all categories)
- [ ] Receive Web Push notifications
- [ ] Receive in-app notification bell (iOS Safari fallback)
- [ ] Install-to-home-screen prompt (for iOS push support)

### Support

- [ ] Report a problem

---

## Driver

### Account

- [ ] Login with Driver ID + password (Admin-provisioned only)
- [ ] Forced password change on first login
- [ ] View own profile

### Trip Operations

- [ ] View Today's Bus, Route, and Trips
- [ ] "Slide to Start Trip"
- [ ] Auto-begin GPS sharing on trip start
- [ ] Cache GPS locally when offline, flush on reconnect
- [ ] "Finish Trip" (manual only)
- [ ] Send Emergency Alert (broadcasts to Admin + all users)

### Explicitly restricted

- [ ] ~~Cannot modify buses, routes, or schedules~~

---

## Administrator

### User & Driver Management

- [ ] View/search all users
- [ ] Create driver profile (Name, Phone, Blood Group, NID/License, Address, Emergency Contact, Assigned Bus — all required; Email, Photo optional)
- [ ] Edit driver profile
- [ ] Activate/deactivate driver
- [ ] Reset driver password

### Fleet Management

- [ ] Manage Buses (create/edit/deactivate)
- [ ] Manage Routes
- [ ] Manage Stops
- [ ] Manage Trips
- [ ] Manage Schedules (Regular, Ramadan, Exam, Holiday, Special) — activate one at a time

### Communication

- [ ] Publish Notices (categorized: General, Holiday, Ramadan, Exam, Delay, Cancellation, Emergency, Maintenance)
- [ ] View submitted Complaints (list view only, no status workflow in v1)

### Monitoring

- [ ] Monitor all live bus locations on a single dashboard
- [ ] Receive Emergency Alerts from any driver

---

## Cross-Cutting / System Features

- [ ] JWT auth (short-lived access token + refresh token) shared across all roles via `role` enum
- [ ] Login rate limiting
- [ ] Real-time GPS broadcast via Socket.IO rooms (per trip)
- [ ] Haversine-based ETA calculation
- [ ] `trip_positions` retention policy (30-day purge of raw GPS rows)
- [ ] UTC timestamp storage, Bangladesh time (UTC+6) display conversion
- [ ] CORS locked to production frontend domain

---

## Explicitly Out of Scope (v1)

See `PROJECT_SPECIFICATION.md` §11 for the full list (capacity tracking, analytics, multi-tenant, admin sub-roles, notice targeting, complaint workflow, stuck-trip override, file uploads beyond driver photo).
