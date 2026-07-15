# Class Diagram — BUBT Bus Tracking System

Supplementary architecture artifact (belongs alongside `ARCHITECTURE.md`, Phase 2). Two diagrams: the **Domain Model** (entities, mirrors `schema.sql`/`DATABASE_DESIGN.md` but expressed as classes with behavior) and the **Service Layer** (the business-logic classes from `ARCHITECTURE.md` §3, and how they depend on each other).

---

## 1. Domain Model

```mermaid
classDiagram
    class User {
        +UUID id
        +UserRole role
        +String name
        +String email
        +Boolean emailVerified
        +String driverId
        +String phone
        +String bloodGroup
        +String nidOrLicense
        +String address
        +String emergencyContact
        +String adminId
        +Boolean mustChangePassword
        +AccountStatus status
        +verifyPassword(plain) Boolean
        +changePassword(newPassword) void
    }

    class Route {
        +UUID id
        +String name
        +getOrderedStops() Stop[]
    }

    class Stop {
        +UUID id
        +String name
        +Float latitude
        +Float longitude
        +Int stopOrder
    }

    class Bus {
        +UUID id
        +String busNumber
        +getTodayTrips() Trip[]
        +getCurrentRunningTrip() Trip
    }

    class Schedule {
        +UUID id
        +String name
        +ScheduleType type
        +Boolean isActive
        +activate() void
    }

    class ScheduleTripTemplate {
        +UUID id
        +DayGroup dayGroup
        +Time departureTime
    }

    class Trip {
        +UUID id
        +Date tripDate
        +DateTime scheduledTimeUtc
        +TripStatus status
        +DateTime startedAt
        +DateTime completedAt
        +start() void
        +finish() void
        +sendEmergencyAlert(message) void
        +calculateEtaToStop(stop) Int
    }

    class TripPosition {
        +Long id
        +Float latitude
        +Float longitude
        +Float speedKmh
        +DateTime recordedAt
    }

    class Reminder {
        +UUID id
        +Boolean notified15min
        +Boolean notifiedTripStart
        +checkAndTrigger() void
    }

    class FavoriteBus {
        +UUID id
    }

    class Notice {
        +UUID id
        +String title
        +String body
        +NoticeCategory category
        +DateTime publishedAt
        +publish() void
    }

    class Complaint {
        +UUID id
        +String subject
        +String message
    }

    Route "1" o-- "many" Stop : contains
    Route "1" -- "1" Bus : followed by
    Bus "1" o-- "many" Trip : runs
    Bus "0..1" -- "1" User : assigned driver
    Schedule "1" o-- "many" ScheduleTripTemplate : defines
    ScheduleTripTemplate "1" -- "many" Trip : generates
    Trip "1" o-- "many" TripPosition : logs
    Trip "1" o-- "many" Reminder : reminded for
    User "1" -- "many" Reminder : sets
    User "1" -- "many" FavoriteBus : favorites
    Bus "1" -- "many" FavoriteBus : favorited as
    User "1" -- "many" Complaint : submits
    User "1" -- "many" Notice : publishes (admin)
    User "1" -- "many" Trip : drives (driver)
```

**Note on style:** `User` is a single class (not subclassed per role) because the confirmed decision is one `users` table with a `role` enum, not separate `Student`/`Driver`/`Admin` classes — the diagram stays consistent with that choice rather than reintroducing role-based inheritance the data model deliberately avoids.

---

## 2. Service Layer

The business-logic classes from `ARCHITECTURE.md` §3 — these sit between Controllers and Models, and are what Phase 8 actually implements.

```mermaid
classDiagram
    class AuthService {
        +register(input) User
        +verifyOtp(userId, code) void
        +resendOtp(userId) void
        +login(identifier, password) TokenPair
        +refreshToken(refreshToken) TokenPair
        +changePassword(userId, newPassword) void
        +createDriver(input) DriverCredentials
        +resetDriverPassword(driverId) String
    }

    class TripService {
        +getTodayTrips(busId) Trip[]
        +startTrip(tripId, driverId) Trip
        +finishTrip(tripId, driverId) Trip
        +sendEmergencyAlert(tripId, message) void
        +calculateEta(tripId, stopId) Int
    }

    class ScheduleService {
        +activateSchedule(scheduleId) void
        +generateTripsForDate(date) Trip[]
        -resolveDayGroup(date) DayGroup
    }

    class TrackingService {
        +ingestPosition(tripId, position) void
        +broadcastPosition(tripId, position) void
        -persistPositionDebounced(tripId, position) void
        +flushOfflineQueue(tripId, positions) void
    }

    class NotificationService {
        +sendWebPush(userId, payload) void
        +sendInAppNotification(userId, payload) void
        +checkAndSendReminders() void
        -dispatchToFallback(userId, payload) void
    }

    class NoticeService {
        +publish(input) Notice
        +list(filters) Notice[]
    }

    class ComplaintService {
        +submit(userId, input) Complaint
        +list(filters) Complaint[]
    }

    TripService --> NotificationService : notifies on start/finish/emergency
    TripService --> TrackingService : delegates GPS handling
    ScheduleService --> TripService : triggers trip generation
    AuthService --> NotificationService : sends OTP
    NotificationService --> NotificationService : Web Push + in-app fallback
```

**Layering reminder (per `ARCHITECTURE.md` §3):** Controllers call Services; Services call Models (Prisma); Services never call each other's Models directly — cross-cutting behavior (like "starting a trip also sends a notification") is expressed as one Service calling another Service, as shown above, keeping each Service's own data access self-contained.

---

## Where this fits

This diagram supplements Phase 2's `ARCHITECTURE.md` (which described the layering in prose/flowcharts but didn't include a formal class diagram) and Phase 3's `DATABASE_DESIGN.md` ER diagram (which shows the same entities as *data*, not *behavior*). Added as a retroactive Phase 2 artifact — no architectural decisions changed, this only documents structure that was already implied by `ARCHITECTURE.md` §3 and the entity list in `packages/shared-types`.
