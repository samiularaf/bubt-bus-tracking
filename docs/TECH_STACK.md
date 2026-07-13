# Tech Stack — BUBT Bus Tracking System

## Summary

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Maps | Leaflet + OpenStreetMap |
| Backend | Node.js + Express |
| Realtime | Socket.IO |
| Database | PostgreSQL (via Supabase) |
| Auth | JWT (access + refresh tokens) |
| Frontend Hosting | Cloudflare Pages |
| Backend Hosting | Railway |
| Database Hosting | Supabase |

---

## Feature → Technology Mapping

| Feature | Technology / Approach | Notes |
|---|---|---|
| Authentication | JWT (short-lived access + refresh token), `bcrypt` password hashing | Single `users` table, `role` enum. No third-party auth provider. |
| Database | PostgreSQL on Supabase | Accessed via Prisma ORM (planned) from Express. |
| Real-time GPS broadcast | Socket.IO (WebSocket) | Rooms keyed per `trip_id`. No third-party realtime service (no Pusher/Ably). |
| Position history | PostgreSQL `trip_positions` table | Debounced writes (~every 10s); full-frequency updates still broadcast live over the socket. 30-day retention on raw rows. |
| Maps rendering | Leaflet.js + OpenStreetMap tiles | No Google Maps API key, no billing. |
| ETA calculation | Haversine formula ÷ average speed | No routing API (no OSRM/Mapbox/Google Directions) — cost/infra tradeoff, accepted decision. |
| Push notifications | Web Push API via Service Worker, `web-push` npm package + VAPID keys | Native on Android/desktop browsers. |
| iOS Safari fallback | In-app notification bell (via existing Socket.IO connection or polling) | Required since iOS Web Push needs home-screen install. |
| Email OTP delivery | Backend email service (provider TBD in Phase 2/6 — e.g. Resend, SendGrid, or SMTP) | 6-digit code, 10-min expiry, rate-limited resend. |
| Reminders (T-15 min) | Backend scheduled job (`node-cron`) | Checks upcoming trips every minute. |
| "Call Driver" | Backend-generated `tel:` link per request | Number never sits raw in frontend bundle. |
| File/image storage | None required for v1 | Optional driver photo — storage approach TBD if this becomes needed (Supabase Storage is the natural choice given the existing stack). |
| API style | REST (Express routes) for CRUD; Socket.IO for streaming/live data | No GraphQL. |
| Validation | Schema-based validation (e.g. `zod`) | Finalized in Phase 2. |
| Schedule switching | Pure DB logic: `schedules` + `schedule_trip_templates` tables | Activating a schedule regenerates that day's `trips` rows. |

---

## Hosting Rationale

- **Cloudflare Pages** — static React build + service worker, free tier, global CDN, fast for a mostly-Bangladesh user base.
- **Railway** — supports persistent WebSocket connections, required for Socket.IO; simpler ops than raw VPS management.
- **Supabase** — managed PostgreSQL with generous free tier; not using Supabase Auth or Storage in this plan (custom JWT auth instead), but available if scope grows.

## Explicitly Not Used

- No Google Maps / paid routing APIs
- No third-party auth provider (Auth0, Firebase Auth, Supabase Auth)
- No third-party realtime service (Pusher, Ably)
- No GraphQL
- No native mobile app (PWA via Web Push covers the notification need for v1)
