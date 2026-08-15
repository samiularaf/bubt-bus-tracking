# Testing — BUBT Bus Tracking System

Phase 11 output. Test framework: **Vitest** across both apps (chosen for native Vite integration on the frontend, and a lightweight, fast, modern runner on the backend — avoids adding Jest's extra configuration surface for no real benefit here).

---

## 1. How to run tests

```bash
npm run test              # both apps
npm run test:frontend     # frontend only
npm run test:backend      # backend only
npm run test:watch -w apps/frontend   # watch mode, either app
```

CI (`.github/workflows/ci.yml`) runs the full suite on every PR and push to `main`, after `prisma generate` and before the production builds — a test failure blocks the build step from running.

---

## 2. Backend — 67 tests across 9 files

| Layer                       | File                                                    | What it verifies                                                                                                                                                                                                                               |
| --------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit                        | `utils/haversine.test.ts`                               | Distance/ETA math: zero-distance case, symmetry, a known real-world distance (Dhaka–Chittagong), speed-scaling behavior                                                                                                                        |
| Unit                        | `utils/jwt.test.ts`                                     | Sign/verify round-trip for both token types, rejection of forged/malformed tokens, access and refresh secrets are independent                                                                                                                  |
| Unit                        | `utils/password.test.ts`                                | Hash/verify correctness, salting (same input → different hash), temporary password format                                                                                                                                                      |
| Unit                        | `utils/otp.test.ts`                                     | 6-digit format (incl. zero-padding), hash/verify correctness, expiry window matches `OTP_EXPIRY_MINUTES`                                                                                                                                       |
| Unit                        | `validation/auth.test.ts`                               | Registration/login/OTP schemas accept valid input and reject each invalid case (short password, bad email, wrong OTP length/format)                                                                                                            |
| Unit                        | `validation/driver.test.ts`                             | Every required driver field (name, phone, blood group, NID/license, address, emergency contact, assigned bus) is individually verified as actually required — not just collectively                                                            |
| Unit                        | `services/ScheduleService.test.ts` (`resolveDayGroup`)  | The Phase 3 day-group fix: Sun–Thu → `sun_thu`, Friday → `friday`, **Saturday → `null`** (no service)                                                                                                                                          |
| Integration (mocked Prisma) | `services/TripService.test.ts`                          | `startTrip`/`finishTrip` state machine: correct rejection of not-found/wrong-driver/wrong-status cases, correct success path                                                                                                                   |
| Integration (mocked Prisma) | `services/ScheduleService.test.ts` (`activateSchedule`) | The single-active-schedule invariant — deactivating all others is actually asserted, not just "doesn't error"                                                                                                                                  |
| Integration (mocked Prisma) | `services/NotificationService.test.ts`                  | Reminder cron logic: correct count processed, in-app notification actually created with correct recipient/content, `notified15min`/`notifiedTripStart` idempotency flags correctly set, graceful no-op when a user has zero push subscriptions |

**Mocking approach:** `vi.mock('../config/prisma.js', ...)` with hand-built fake data per test, rather than a shared global stub — keeps each test's fixture data next to the assertions that use it. (Note: `vi.mock` calls are hoisted above regular `const` declarations by Vitest's compiler — any mock data referenced inside a factory must go through `vi.hoisted()`, or you'll hit a "cannot access before initialization" error. This bit us once while writing `ScheduleService.test.ts`; fixed and documented here so it doesn't bite the next person.)

---

## 3. Frontend — 33 tests across 7 files

| File                                 | What it verifies                                                                                                                                                                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/haversine.test.ts`              | Same math as the backend copy, verified independently since it's a separate implementation                                                                                                                                                    |
| `components/Button.test.tsx`         | Renders label, click handler fires, disabled/loading states actually prevent clicks, `type` attribute passthrough                                                                                                                             |
| `components/StatusBadge.test.tsx`    | Correct label text for every status value                                                                                                                                                                                                     |
| `components/FormField.test.tsx`      | Label/input association (accessibility), `onChange` fires, error state sets `aria-invalid` and shows the error message, error takes priority over hint                                                                                        |
| `components/OTPInput.test.tsx`       | Renders the correct digit count, auto-completion fires only once all digits are filled (not before), non-numeric input is rejected                                                                                                            |
| `components/SlideToConfirm.test.tsx` | Keyboard accessibility path (Enter and Space both confirm) — pointer-drag itself isn't tested here since simulating real drag gestures in jsdom is unreliable; the keyboard fallback is the part that matters for a11y and is fully exercised |
| `pages/LoginPage.test.tsx`           | Full integration: mocks `mockLogin`, verifies the error path displays the right message, the success path calls the mock API with the exact entered credentials, and all four navigation links are present                                    |

**A real bug this caught:** the initial test setup was missing React Testing Library's cleanup between tests (`vitest.config.ts` sets `globals: false`, so RTL's automatic cleanup hook never registers). Every `render()` call was leaving its DOM in place for the next test — confirmed unambiguously when a test expecting 4 OTP input boxes found 10 (6 left over from the previous test + its own 4). Fixed once, centrally, in `test-setup.ts` rather than per-file.

---

## 4. UI Testing — scope and interpretation

"UI Testing" here means **component-level rendering and interaction tests** (React Testing Library, jsdom), not full browser E2E automation (Playwright/Cypress) — no E2E tool is set up in this project. Given the project's scale and that Phase 12 (Deployment) will produce a real, clickable, deployed instance, manual click-through testing against that real deployment is the more practical E2E validation step, rather than investing in a full E2E framework now for a project this size.

---

## 5. Performance Testing

Load-tested the actual booted backend (not a theoretical estimate) using `autocannon`, against three endpoint types:

| Endpoint                                         | Avg req/sec | p50 latency | p99 latency |
| ------------------------------------------------ | ----------- | ----------- | ----------- |
| `GET /health`                                    | ~4,080      | 3ms         | 21ms        |
| `GET /buses` (public read)                       | ~5,340      | 3ms         | 15ms        |
| `POST /auth/login` (validation + rejection path) | ~3,990      | 1ms         | 11ms        |

**Critical caveat, stated plainly:** these numbers were measured against a zero-latency in-memory stub database (this sandbox cannot reach a real PostgreSQL instance — see `SETUP_NOTES.md`). They measure **pure Express/middleware/validation overhead**, not real-world capacity. A real Postgres round-trip (even to a fast, co-located Supabase instance) will dominate actual latency far more than anything measured here. Treat this as a "the framework itself isn't the bottleneck" baseline, not a production capacity claim — real load testing against the real deployed database is a Phase 12 (Deployment) follow-up, not something this sandbox can produce honestly.

---

## Phase 11 Checklist

- [x] Unit Testing — 9 backend files (pure logic + validation schemas), 6 frontend files (components + utils)
- [x] Integration Testing — mocked-Prisma service tests covering the trip state machine, single-active-schedule invariant, and reminder cron logic; a full-page integration test for `LoginPage`
- [x] UI Testing — component-level, scope explicitly stated above (not full E2E)
- [x] Performance Testing — real `autocannon` load test against the booted server, with an explicit caveat about what it does and doesn't measure
- [x] Bug fixing — every bug found during this phase (a `vi.mock` hoisting issue, a missing RTL cleanup hook, and two genuine dependency vulnerabilities) is fixed, not just noted
- [x] 100 tests total (67 backend + 33 frontend), all passing

No implementation gaps papered over. Waiting for approval to proceed to **Phase 12 — Deployment**.
