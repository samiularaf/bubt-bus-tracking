# BUBT Bus Tracking System — Project Overview

**Real-Time University Bus Tracking and Transport Management System**

This document is a high-level orientation report — it exists so you can see the whole shape of the system before we start the formal phased development process (Phase 0 onward). It is not the final specification; formal docs (`README.md`, `PROJECT_SPECIFICATION.md`, etc.) are produced in Phase 1.

---

## 1. System at a Glance

Three roles, one shared platform:

```mermaid
flowchart LR
    subgraph Users["👤 User (Student / Teacher / Staff)"]
        U1[Browse buses & routes]
        U2[Track a live trip]
        U3[Get reminders & notices]
        U4[Report a problem]
    end

    subgraph Drivers["🚌 Driver"]
        D1[View assigned bus & trips]
        D2[Start / Finish trip]
        D3[Broadcast GPS]
        D4[Send emergency alert]
    end

    subgraph Admins["🛠 Administrator"]
        A1[Manage buses, routes, stops]
        A2[Manage drivers & schedules]
        A3[Publish notices]
        A4[Monitor all live buses]
    end

    Drivers -- GPS + trip events --> Backend((Backend + Realtime Server))
    Backend -- live position, ETA --> Users
    Admins -- configuration --> Backend
    Backend -- alerts, notices --> Users
```

---

## 2. Core Business Concept: Trip-Based Tracking (not bus-ownership)

Users don't belong to a bus — they pick **which trip** to track, on demand.

```mermaid
flowchart TD
    Start([User opens app]) --> ViewBuses[See all buses:\nnumber, route, status, next trip]
    ViewBuses --> OpenBus[Open a specific bus]
    OpenBus --> Trips{Today's Trips}
    Trips --> Completed[Completed trips]
    Trips --> Running[Running trip]
    Trips --> Upcoming[Upcoming trips]
    Running --> Track[Track live on map:\nETA, next stop, speed, driver info]
    Upcoming --> Reminder[Set Reminder]
    Reminder --> Notify1[🔔 15 min before departure]
    Reminder --> Notify2[🔔 When driver starts trip]
```

---

## 3. Trip Lifecycle (state machine)

```mermaid
stateDiagram-v2
    [*] --> Upcoming: Generated from active Schedule
    Upcoming --> Running: Driver taps "Slide to Start"
    Running --> Completed: Driver taps "Finish Trip"
    Running --> Emergency: Driver sends Emergency Alert
    Emergency --> Running: Alert acknowledged, trip continues
    Completed --> [*]
```

*Trips are never auto-completed by GPS — only a manual driver action ends a trip (confirmed decision).*

---

## 4. Real-Time Location Flow

```mermaid
sequenceDiagram
    participant Driver as Driver App
    participant Server as Backend + Socket.IO
    participant DB as PostgreSQL
    participant User as User App (map view)

    Driver->>Server: Slide to Start Trip
    Server->>DB: trip.status = running
    Server-->>User: "Bus 01 has started" push notification
    loop every few seconds while trip is running
        Driver->>Server: GPS coordinates
        Server->>DB: store position (trip_positions)
        Server-->>User: broadcast position via WebSocket room (trip:id)
        User->>User: update marker, recompute ETA (haversine)
    end
    Driver->>Server: Finish Trip
    Server->>DB: trip.status = completed
    Server-->>User: stop tracking, trip moves to "Completed"
```

---

## 5. High-Level Data Model (conceptual — full ER diagram comes in Phase 3)

```mermaid
erDiagram
    USERS ||--o{ REMINDERS : sets
    USERS ||--o{ COMPLAINTS : submits
    USERS ||--o{ PUSH_SUBSCRIPTIONS : has
    BUSES ||--|| ROUTES : follows
    ROUTES ||--o{ STOPS : contains
    BUSES ||--o{ TRIPS : runs
    USERS ||--o{ TRIPS : "driver of (role=driver)"
    TRIPS ||--o{ TRIP_POSITIONS : logs
    TRIPS }o--|| SCHEDULES : "generated from"
    ADMINS_NOTICES ||--o{ USERS : "broadcast to all"

    USERS {
        uuid id
        string name
        string email "required for user, optional for driver"
        string password_hash
        enum role "user|driver|admin"
        boolean email_verified "user only, via OTP"
        string driver_id "nullable, auto-generated, driver only"
        string phone "required, driver only"
        string blood_group "required, driver only"
        string nid_or_license "required, driver only"
        string address "required, driver only"
        string emergency_contact "required, driver only"
        string assigned_bus_id "nullable, driver only"
        boolean must_change_password "driver only, true until first login change"
    }
    BUSES {
        uuid id
        string bus_number
        uuid route_id
    }
    ROUTES {
        uuid id
        string name
    }
    STOPS {
        uuid id
        uuid route_id
        string name
        float lat
        float lng
        int order
    }
    TRIPS {
        uuid id
        uuid bus_id
        datetime scheduled_time
        enum status "upcoming|running|completed"
    }
    TRIP_POSITIONS {
        uuid id
        uuid trip_id
        float lat
        float lng
        datetime timestamp
    }
    SCHEDULES {
        uuid id
        string type "regular|ramadan|exam|holiday|special"
        boolean is_active
    }
```

---

## 6. Confirmed Architectural Decisions (from planning discussion)

| Decision Point | Chosen Approach |
|---|---|
| Auth model | Single `users` table with a `role` enum (`user` / `driver` / `admin`), one JWT scheme |
| Trip completion | Manual only — driver taps "Finish Trip" (no GPS auto-complete) |
| ETA calculation | Haversine distance ÷ average speed — no external routing API |
| Emergency alert recipients | Admin dashboard **and** broadcast to all users |
| Complaint/report workflow | Simple submission list for admin (no status states, no replies) |
| Notice targeting | Broadcast to all users (no per-bus/route targeting) |
| Push notifications | Web Push via service worker (PWA-style) |
| Scope | Single institution (BUBT only), no multi-tenant design |
| Offline GPS handling | Driver app caches GPS points locally when signal drops, flushes queued points to server on reconnect |
| Nearest-stop detection | Auto-detected via browser geolocation, used as default ETA reference (user can still override manually) |
| Stuck/abandoned trip recovery | Not built in v1 — accepted as a rare edge case; trip simply stays "running" until driver finishes it |
| Auth token strategy | Short-lived JWT access token + refresh token (not one long-lived token) |
| Login rate limiting | Enabled on the login endpoint to blunt brute-force attempts |
| CORS policy | Locked to the exact Cloudflare Pages production domain |
| `trip_positions` retention | Raw GPS rows auto-purged after 30 days; trip start/end summaries kept indefinitely |
| Timestamp storage | All timestamps stored in UTC in Postgres, converted to Bangladesh time (UTC+6) at the display layer |
| PWA install prompt | Shown after first login to improve iOS Web Push adoption ("Install this app for notifications") |
| Email verification method | OTP (6-digit code, 10-min expiry, single-use, resend rate-limited to 1/60s) — not a verification link |
| Driver required fields | Name, Phone, Blood Group, NID/License Number, Address, Emergency Contact, Assigned Bus are all **required**; Email and Photo remain optional |
| Driver password policy | Admin sets an initial temporary password at creation; driver is forced to change it on first login |
| Admin provisioning (v1) | No "add admin" UI — two fixed accounts inserted via DB seed script at setup time (see `ACTOR_AUTH_AND_CREDENTIALS.pdf`) |
| UI reference screenshot | Used for color/style reference only (primary blue, white cards, rounded corners) — its content ("Your Assigned Bus") does **not** reflect real business logic |

---

## 7. Actor Authentication & Provisioning Flow

Full detail lives in `ACTOR_AUTH_AND_CREDENTIALS.pdf`; summarized here for context.

```mermaid
flowchart TD
    subgraph UserFlow["User (self-service)"]
        U1[Register: name, email, password] --> U2[Account created: unverified]
        U2 --> U3[6-digit OTP sent to email]
        U3 --> U4{Correct OTP\nwithin 10 min?}
        U4 -- yes --> U5[Account verified\nlogin enabled]
        U4 -- no / expired --> U6[Resend OTP\nmax 1 per 60s]
        U6 --> U3
    end

    subgraph DriverFlow["Driver (admin-provisioned)"]
        D1[Admin fills driver profile:\nname, phone, blood group,\nNID/license, address,\nemergency contact, assigned bus] --> D2[System generates\nDriver ID + temp password]
        D2 --> D3[Admin shares credentials\nwith driver]
        D3 --> D4[Driver logs in]
        D4 --> D5[Forced password change\non first login]
    end

    subgraph AdminFlow["Administrator (fixed seed, v1)"]
        A1[Two accounts inserted\nvia DB seed script] --> A2[Login with Admin ID + password]
        A2 --> A3[⚠ Must rotate seed\npasswords before production]
    end
```

| Actor | Self-Register? | Login ID | Provisioned By | Verification |
|---|---|---|---|---|
| User | Yes | Email | Self | OTP (email, 6-digit) |
| Driver | No | Driver ID | Administrator | None needed — Admin-created is trusted |
| Administrator | No | Admin ID | Fixed DB seed (v1) | None — pre-verified seed accounts |

---

## 8. Tech Stack Summary

```mermaid
flowchart TB
    subgraph Frontend["Frontend — Cloudflare Pages"]
        React --> TS[TypeScript]
        TS --> Tailwind[Tailwind CSS]
        Tailwind --> Leaflet[Leaflet + OpenStreetMap]
    end
    subgraph Backend["Backend — Railway"]
        Node[Node.js] --> Express
        Express --> Socket[Socket.IO]
        Express --> JWT[JWT Auth]
    end
    subgraph Data["Database — Supabase"]
        Postgres[(PostgreSQL)]
    end
    Frontend <-- REST + WebSocket --> Backend
    Backend <--> Data
```

---

## 9. Feature → Technology Mapping

Exactly what powers each feature — no external paid services beyond hosting.

| Feature | Technology / Approach | Notes |
|---|---|---|
| **Authentication** | JWT (access token), `bcrypt` for password hashing | Single `users` table, `role` enum. No third-party auth provider (no Auth0/Firebase). |
| **Database** | PostgreSQL, hosted on **Supabase** | Accessed via Prisma ORM (planned) from the Node/Express backend. |
| **Real-time GPS broadcast** | **Socket.IO** (WebSocket) | Driver emits position → server relays to a Socket.IO "room" per `trip_id` → all subscribed users in that room receive it live. No third-party realtime service (no Pusher/Ably). |
| **Position history storage** | PostgreSQL table `trip_positions` | Written on a debounce (e.g. every ~10s), not on every raw GPS tick, to avoid DB bloat — full-frequency updates still broadcast live over the socket. |
| **Maps rendering** | **Leaflet.js** + **OpenStreetMap** tiles | No Google Maps API key, no billing. |
| **ETA calculation** | Haversine formula (great-circle distance) ÷ configurable average speed | Computed client-side or server-side from live GPS + stop coordinates. No routing API (no OSRM/Mapbox/Google Directions) — confirmed decision, trades accuracy for zero cost/infra. |
| **Push notifications (reminders, trip-start, notices, emergency)** | **Web Push API** via a browser Service Worker, using the `web-push` npm package + VAPID keys on the backend | Works on Android/desktop Chrome/Firefox/Edge natively. |
| **iOS Safari fallback** | In-app notification bell (in-app table `notifications`, polled or pushed via the existing Socket.IO connection) | Covers users who haven't installed the PWA to home screen (a requirement for iOS web push). |
| **Reminders (T-15 min)** | Backend cron/scheduled job (e.g. `node-cron`) checking upcoming trips every minute | Triggers a Web Push + in-app notification when a reminder crosses its 15-minute window. |
| **"Call Driver"** | Backend-generated `tel:` link per request (not a raw number sitting in frontend page data) | Small privacy improvement — number never appears in client-side HTML/JS bundle at rest. |
| **File/image storage** | None required for v1 | No user avatars, bus photos, or complaint attachments specified — flagging in case you want this added. |
| **Frontend hosting** | Cloudflare Pages | Static React build + service worker. |
| **Backend hosting** | Railway | Node/Express + Socket.IO server (must support persistent WebSocket connections — confirmed Railway does). |
| **Database hosting** | Supabase (managed PostgreSQL) | Also usable later for Supabase Auth/Storage if scope grows, but not used that way in this plan — we're using our own JWT auth, not Supabase Auth. |
| **API style** | REST (Express routes) for CRUD; Socket.IO for live/streaming data | No GraphQL. |
| **Validation** | Backend request validation via a schema library (e.g. `zod`) | To be finalized in Phase 2. |
| **Schedule switching (Regular/Ramadan/Exam/etc.)** | PostgreSQL-driven: `schedules` table + `schedule_trip_templates`; activating a schedule regenerates that day's `trips` rows | Pure DB logic, no external service. |

---

## 10. Development Roadmap (13 phases, gated by your approval)

```mermaid
flowchart LR
    P0[Phase 0\nAnalysis] --> P1[Phase 1\nPlanning Docs]
    P1 --> P2[Phase 2\nArchitecture]
    P2 --> P3[Phase 3\nDatabase Design]
    P3 --> P4[Phase 4\nAPI Design]
    P4 --> P5[Phase 5\nUI/UX Planning]
    P5 --> P6[Phase 6\nProject Setup]
    P6 --> P7[Phase 7\nFrontend Dev]
    P7 --> P8[Phase 8\nBackend Dev]
    P8 --> P9[Phase 9\nReal-Time System]
    P9 --> P10[Phase 10\nNotifications]
    P10 --> P11[Phase 11\nTesting]
    P11 --> P12[Phase 12\nDeployment]
```

Each phase stops for your explicit approval before the next begins. No phase is skipped or merged.

---

*Phase 0 (Analysis) is complete — gaps identified, resolved, and logged in section 6 and 7. Companion document: `ACTOR_AUTH_AND_CREDENTIALS.pdf` (full field lists, seed admin credentials, OTP flow detail). Next: Phase 1 — Planning Docs (README, PROJECT_SPECIFICATION, FEATURES, USER_FLOW, ROADMAP, PROJECT_RULES, TECH_STACK), pending your approval.*
