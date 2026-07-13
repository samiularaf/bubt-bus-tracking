# BUBT Bus Tracking System

Real-Time University Bus Tracking and Transport Management System for Bangladesh University of Business and Technology.

Full planning documentation (specification, architecture, database design, API contract, UI/UX plan) lives in [`docs/`](./docs/README.md) — start there for the _what_ and _why_. This README covers the _how to run it_.

## Monorepo Layout

```
apps/frontend/         React + TypeScript + Tailwind (Vite)
apps/backend/           Node.js + Express + Socket.IO + Prisma
packages/shared-types/  TypeScript types shared between frontend and backend
docs/                    All planning documents (Phases 0-5 outputs)
```

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A PostgreSQL database (local, or a free Supabase project)

## Setup

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# then edit apps/backend/.env with your real DATABASE_URL, JWT secrets, VAPID keys

# 3. Generate the Prisma client and run migrations
npm run prisma:generate -w apps/backend
npm run prisma:migrate -w apps/backend

# 4. Seed the database with the real BUBT fleet (see docs/DATABASE_DESIGN.md §6)
npm run db:seed -w apps/backend

# 5. Run both apps in separate terminals
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`
Backend health check: `http://localhost:4000/api/v1/health`

## Scripts

| Command                  | Purpose                      |
| ------------------------ | ---------------------------- |
| `npm run lint`           | Lint the whole monorepo      |
| `npm run format`         | Auto-format with Prettier    |
| `npm run typecheck`      | Typecheck frontend + backend |
| `npm run build:frontend` | Production build (frontend)  |
| `npm run build:backend`  | Production build (backend)   |

## Development Process

This project is built in gated phases — see [`docs/ROADMAP.md`](./docs/ROADMAP.md) for status and [`docs/PROJECT_RULES.md`](./docs/PROJECT_RULES.md) for the engineering rules in effect. We are currently in **Phase 6 — Project Setup**.
