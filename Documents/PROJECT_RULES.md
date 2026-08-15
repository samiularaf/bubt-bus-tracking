# Project Rules — BUBT Bus Tracking System

These rules govern how this project is built. They apply to every phase, every module, every commit.

## Process Rules

1. **Never jump directly into coding.** Every phase's planning artifacts come before implementation.
2. **Follow development phases exactly**, per `ROADMAP.md`. Do not skip phases. Do not merge phases. Do not continue automatically to the next phase.
3. **Stop and wait for explicit approval** after completing each phase.
4. **Always explain what's being built before implementing it.**
5. **Always provide a checklist for the current phase.**
6. **Never rewrite completed code unless explicitly requested.**
7. **Never change project requirements without asking first.** If a new requirement conflicts with something already confirmed, flag the conflict explicitly rather than silently resolving it.
8. **If something is unclear, ask** — don't assume or invent requirements.

## Engineering Rules

9. **Never generate placeholder architecture.** Every module built should be real, functioning structure — not scaffolding-only stubs left for "later."
10. **Use reusable components.** No copy-pasted UI blocks or duplicated logic across modules.
11. **Use clean architecture.** Clear separation of concerns: controllers/services/models on the backend, components/features/hooks on the frontend.
12. **Avoid duplicated code.** Shared logic goes into shared utilities/packages (`packages/shared-types`, etc.).
13. **Write production-quality code**, not tutorial-quality code — proper error handling, validation, and typing throughout.
14. **Everything must be scalable** — schema, API, and component design should hold up as data volume and feature count grow, without requiring a rewrite.

## Frontend-Specific

- Each module (Auth, User, Driver, Admin) must **compile independently** before moving to the next.
- **Commit after every completed module**, not in one giant batch.
- Mock data only during Phase 7 (Frontend Development) — no live backend calls until Phase 8 is complete and integration is explicitly scoped.

## Security Baseline (non-negotiable, applies from Phase 8 onward)

- Passwords hashed with bcrypt, never stored or logged in plaintext.
- JWT: short-lived access token + refresh token, not one long-lived token.
- Login endpoints rate-limited.
- CORS locked to the exact production frontend domain.
- Driver phone numbers never exposed raw in frontend bundle/DOM — backend-mediated `tel:` links only.
- Seed admin credentials (see `ACTOR_AUTH_AND_CREDENTIALS.pdf`) must be rotated before any real/production deployment — they are development placeholders only.

## Data Rules

- All timestamps stored in UTC in PostgreSQL; converted to Bangladesh time (UTC+6) only at the display layer.
- `trip_positions` (raw GPS history) auto-purged after 30 days; trip start/end summaries retained indefinitely.

## Communication Rules

- Any ambiguity discovered mid-phase is raised as a question before proceeding — not silently resolved with an assumption, except where a default has already been explicitly logged as accepted (see `PROJECT_OVERVIEW.md` §6).
- Any contradiction between a new instruction and a previously confirmed decision is flagged explicitly, not quietly overridden.
