# API Design — BUBT Bus Tracking System

Phase 4 output. Full REST contract. No implementation — this is the spec Phase 8 builds against.

---

## 1. Conventions

**Base URL:** `https://api.bubt-transit.app/api/v1` (placeholder domain — real one set in Phase 6/12)

**Auth header:** `Authorization: Bearer <access_token>` on every endpoint except registration, login, OTP verification, and public notice/bus listing endpoints (marked 🔓 below; everything else is 🔒).

**Response envelope** (every endpoint, success or failure):
```json
// Success
{ "success": true, "data": { ... }, "error": null }

// Failure
{ "success": false, "data": null, "error": { "code": "TRIP_ALREADY_STARTED", "message": "This trip has already been started." } }
```

**Pagination** (list endpoints): query params `?page=1&limit=20`, response `data` shape:
```json
{ "items": [ ... ], "page": 1, "limit": 20, "total": 143 }
```

**Role gates:** each endpoint below lists which role(s) may call it. `Any` = any authenticated role. 🔓 = no auth required.

---

## 2. Authentication APIs

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | User self-registration (name, email, password, optional designation/ID) |
| POST | `/auth/verify-otp` | 🔓 | Submit 6-digit OTP to verify a registered email |
| POST | `/auth/resend-otp` | 🔓 | Resend OTP (rate-limited: 1 per 60s) |
| POST | `/auth/login` | 🔓 | Unified login for User (email), Driver (Driver ID), Admin (Admin ID) + password |
| POST | `/auth/refresh` | 🔓 (refresh token in body) | Exchange refresh token for new access token |
| POST | `/auth/logout` | Any | Revoke current refresh token |
| POST | `/auth/change-password` | Any | Change own password (also clears `must_change_password` for drivers) |
| POST | `/auth/forgot-password` | 🔓 | User-only: request password reset email |
| POST | `/auth/reset-password` | 🔓 (reset token in body) | User-only: complete password reset |

**`POST /auth/login` request:**
```json
{ "identifier": "email or Driver ID or Admin ID", "password": "..." }
```
**Response:**
```json
{ "success": true, "data": {
    "accessToken": "...", "refreshToken": "...",
    "user": { "id": "...", "role": "user|driver|admin", "name": "...", "mustChangePassword": false }
}, "error": null }
```

---

## 3. User APIs

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/users/me` | User | Get own profile |
| PATCH | `/users/me` | User | Update own profile (name, designation, ID number) |
| GET | `/users/me/favorites` | User | List favorited buses |
| POST | `/users/me/favorites/:busId` | User | Favorite a bus |
| DELETE | `/users/me/favorites/:busId` | User | Unfavorite a bus |
| GET | `/users/me/reminders` | User | List own active reminders |
| GET | `/users/me/notifications` | User | List in-app notifications (bell), paginated |
| PATCH | `/users/me/notifications/:id/read` | User | Mark a notification read |
| POST | `/users/me/push-subscription` | User | Register a Web Push subscription |
| DELETE | `/users/me/push-subscription` | User | Remove push subscription (e.g. on logout) |

---

## 4. Driver APIs

### Admin-facing (managing drivers)

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/admin/drivers` | Admin | List all drivers, paginated, filterable by status |
| POST | `/admin/drivers` | Admin | Create a driver (auto-generates Driver ID + temp password) |
| GET | `/admin/drivers/:id` | Admin | Get driver detail |
| PATCH | `/admin/drivers/:id` | Admin | Update driver profile |
| PATCH | `/admin/drivers/:id/status` | Admin | Activate/deactivate driver |
| POST | `/admin/drivers/:id/reset-password` | Admin | Force-reset a driver's password (returns new temp password once) |

**`POST /admin/drivers` request:**
```json
{
  "name": "...", "phone": "...", "bloodGroup": "...",
  "nidOrLicense": "...", "address": "...", "emergencyContact": "...",
  "assignedBusId": "uuid", "email": "optional", "photoUrl": "optional"
}
```
**Response includes** the generated `driverId` and `temporaryPassword` (shown once — not retrievable again).

### Driver-facing (self)

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/driver/me` | Driver | Own profile + assigned bus |
| GET | `/driver/me/trips/today` | Driver | Today's trips for assigned bus |
| POST | `/driver/trips/:tripId/start` | Driver | Start a trip ("Slide to Start") |
| POST | `/driver/trips/:tripId/finish` | Driver | Finish a trip (manual only) |
| POST | `/driver/trips/:tripId/emergency` | Driver | Send emergency alert (broadcasts to Admin + all users) |
| POST | `/driver/trips/:tripId/position` | Driver | Submit a GPS position (also flushes queued offline points — see §9) |

---

## 5. Bus, Route & Stop APIs

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/buses` | 🔓 | List all buses (number, route summary, current status, next trip) |
| GET | `/buses/search?q=` | 🔓 | Search buses by number or route keyword |
| GET | `/buses/:id` | 🔓 | Bus detail incl. route + today's trips |
| POST | `/admin/buses` | Admin | Create bus |
| PATCH | `/admin/buses/:id` | Admin | Update bus (route, number) |
| PATCH | `/admin/buses/:id/status` | Admin | Activate/deactivate bus |
| GET | `/routes` | 🔓 | List routes |
| GET | `/routes/:id/stops` | 🔓 | Ordered stops for a route |
| GET | `/stops/search?q=` | 🔓 | Search stops by name |
| POST | `/admin/routes` | Admin | Create route |
| PATCH | `/admin/routes/:id` | Admin | Update route |
| POST | `/admin/routes/:id/stops` | Admin | Add a stop to a route |
| PATCH | `/admin/stops/:id` | Admin | Update a stop (name/coords/order) |
| DELETE | `/admin/stops/:id` | Admin | Remove a stop |

---

## 6. Trip APIs

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/buses/:busId/trips/today` | 🔓 | Today's trips for a bus, grouped by status |
| GET | `/trips/:id` | 🔓 | Trip detail (status, times, driver info) |
| GET | `/trips/:id/live` | Any | Latest position + ETA (also available live via WebSocket, see §9) |
| GET | `/trips/:id/eta?stopId=` | Any | ETA to a specific stop (defaults to caller's nearest stop via geolocation query param `lat`/`lng`) |
| POST | `/trips/:id/reminder` | User | Set a reminder on an upcoming trip |
| DELETE | `/trips/:id/reminder` | User | Cancel a reminder |
| GET | `/admin/trips/live` | Admin | All currently running trips (fleet-wide monitoring) |

*(Trip start/finish/emergency/position are driver actions — see §4.)*

---

## 7. Schedule APIs (Admin only)

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/admin/schedules` | Admin | List all schedules |
| POST | `/admin/schedules` | Admin | Create a schedule (Regular/Ramadan/Exam/Holiday/Special) |
| PATCH | `/admin/schedules/:id` | Admin | Update schedule metadata |
| POST | `/admin/schedules/:id/activate` | Admin | Activate this schedule (deactivates the currently active one, regenerates trips) |
| GET | `/admin/schedules/:id/templates` | Admin | List trip templates for a schedule |
| POST | `/admin/schedules/:id/templates` | Admin | Add a template (bus, day_group, departure_time) |
| PATCH | `/admin/templates/:id` | Admin | Update a template |
| DELETE | `/admin/templates/:id` | Admin | Remove a template |

---

## 8. Notice & Complaint APIs

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| GET | `/notices` | 🔓 | List notices, filterable by category, paginated |
| GET | `/notices/:id` | 🔓 | Notice detail |
| POST | `/admin/notices` | Admin | Publish a notice (triggers push + in-app notification to all users) |
| PATCH | `/admin/notices/:id` | Admin | Edit a notice |
| DELETE | `/admin/notices/:id` | Admin | Remove a notice |
| POST | `/complaints` | User | Submit a complaint/problem report |
| GET | `/admin/complaints` | Admin | List all complaints, paginated |

---

## 9. Real-Time (WebSocket) Events — reference, not REST

Documented here for completeness since they're part of the same API surface conceptually. Full flow in `ARCHITECTURE.md` §7.

| Event | Direction | Payload | Notes |
|---|---|---|---|
| `trip:join` | Client → Server | `{ tripId }` | User subscribes to a trip's live room |
| `trip:leave` | Client → Server | `{ tripId }` | User unsubscribes |
| `trip:position` | Server → Client | `{ tripId, lat, lng, speedKmh, timestamp }` | Live position broadcast to room |
| `trip:started` | Server → Client | `{ tripId, busNumber }` | Sent to reminder-holders + room |
| `trip:finished` | Server → Client | `{ tripId }` | Trip room closed |
| `trip:emergency` | Server → Client | `{ tripId, driverName, timestamp }` | Broadcast to `admin:live` + `broadcast:all` |
| `driver:position` | Client (driver) → Server | `{ tripId, lat, lng, speedKmh, timestamp, queued? }` | `queued: true` marks points flushed from offline cache |
| `admin:live:subscribe` | Client (admin) → Server | — | Joins fleet-wide monitoring room |

---

## 10. Error Handling

Standard `error.code` values used across all endpoints:

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed schema validation |
| `UNAUTHORIZED` | 401 | Missing/invalid/expired access token |
| `FORBIDDEN` | 403 | Valid token, wrong role for this endpoint |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | e.g. duplicate favorite, duplicate reminder, email already registered |
| `OTP_INVALID_OR_EXPIRED` | 400 | OTP verification failed |
| `TRIP_ALREADY_STARTED` | 409 | Driver tried to start an already-running trip |
| `TRIP_NOT_RUNNING` | 409 | Action requires a running trip (e.g. finish, position update) |
| `SCHEDULE_ALREADY_ACTIVE` | 409 | Tried to activate the currently active schedule |
| `RATE_LIMITED` | 429 | Login attempts or OTP resend exceeded limit |
| `MUST_CHANGE_PASSWORD` | 403 | Driver must change password before continuing (redirect client to change-password flow) |
| `INTERNAL_ERROR` | 500 | Unexpected server error — no internals leaked to client |

All errors follow the same envelope shape from §1. No stack traces or raw DB errors ever reach the client, per `PROJECT_RULES.md`.

---

## 11. Role Access Summary

| Resource | User | Driver | Admin |
|---|---|---|---|
| Own profile / password | ✅ | ✅ | — |
| Bus/route/stop listing | ✅ (read) | ✅ (read) | ✅ (read + write) |
| Trip tracking / reminders | ✅ | — | ✅ (monitor) |
| Trip start/finish/emergency/position | — | ✅ (own bus only) | — |
| Driver management | — | — | ✅ |
| Schedule management | — | — | ✅ |
| Notices (publish) | — | — | ✅ |
| Notices (read) | ✅ | ✅ | ✅ |
| Complaints (submit) | ✅ | — | — |
| Complaints (view) | — | — | ✅ |
| Favorites | ✅ | — | — |

---

## Phase 4 Checklist

- [x] Authentication APIs (register, OTP, login, refresh, logout, password change/reset)
- [x] User APIs (profile, favorites, reminders, notifications, push subscription)
- [x] Driver APIs (admin-managed CRUD + driver self-service trip operations)
- [x] Bus/Route/Stop APIs
- [x] Trip APIs (live tracking, ETA, reminders, fleet monitoring)
- [x] Schedule APIs (schedules + day-group-aware templates)
- [x] Notice APIs
- [x] Complaint APIs
- [x] Response format (success/error envelope, pagination)
- [x] Error handling (standard error codes + HTTP status mapping)
- [x] WebSocket event reference (bridges to `ARCHITECTURE.md` §7)
- [x] Role access summary matrix

No implementation performed. Waiting for approval to proceed to **Phase 5 — UI/UX Planning**.
