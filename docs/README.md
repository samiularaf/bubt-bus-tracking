# BUBT Bus Tracking System

**Real-Time University Bus Tracking and Transport Management System**

A web-based platform that lets BUBT students, teachers, and staff track university buses live, and gives the transport office centralized control over buses, routes, schedules, drivers, and notices.

---

## Status

🟡 **In Planning — Phase 1 (Planning Docs)**
This project follows a strict phase-gated development process. See [`ROADMAP.md`](./ROADMAP.md) for the full phase list and current progress, and [`PROJECT_RULES.md`](./PROJECT_RULES.md) for the rules governing how development proceeds.

---

## The Three Roles

| Role | Who | Can self-register? |
|---|---|---|
| **User** | Student / Teacher / Staff (identical permissions) | Yes — email + OTP verification |
| **Driver** | Bus drivers | No — created by Administrator |
| **Administrator** | Transport office staff | No — fixed seed accounts (v1) |

Full detail: [`ACTOR_AUTH_AND_CREDENTIALS.pdf`](./ACTOR_AUTH_AND_CREDENTIALS.pdf)

---

## Core Idea

Users are **not** assigned to a fixed bus. They browse all buses and routes, and track whichever **trip** is relevant to them — the currently running trip, or an upcoming one they've set a reminder for. One bus runs multiple trips per day (e.g. 7:00 AM, 1:00 PM, 3:30 PM, 5:00 PM), each independently trackable.

---

## Documentation Index

| Document | Purpose |
|---|---|
| [`PROJECT_SPECIFICATION.md`](./PROJECT_SPECIFICATION.md) | Full functional specification — goals, roles, business logic, features |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System architecture — folder structure, frontend/backend/DB/API design, auth & realtime flow, deployment |
| [`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) | ER diagram, table reference, relationships, constraints, indexes, seed data plan |
| [`schema.sql`](./schema.sql) | Runnable PostgreSQL DDL for the full schema |
| [`API_DESIGN.md`](./API_DESIGN.md) | Full REST API contract — all endpoints, request/response formats, error codes, role access matrix |
| [`UI_UX_PLANNING.md`](./UI_UX_PLANNING.md) | Screen list, navigation, journeys, reusable components, design system (color/typography/spacing) |
| [`FEATURES.md`](./FEATURES.md) | Complete feature checklist by role |
| [`USER_FLOW.md`](./USER_FLOW.md) | Step-by-step journeys for User, Driver, Administrator |
| [`ROADMAP.md`](./ROADMAP.md) | 13-phase development roadmap with approval gates |
| [`PROJECT_RULES.md`](./PROJECT_RULES.md) | Development rules and working agreement |
| [`TECH_STACK.md`](./TECH_STACK.md) | Full technology stack and rationale |
| [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) | Visual/diagram-first orientation report (Phase 0 output) |
| [`ACTOR_AUTH_AND_CREDENTIALS.pdf`](./ACTOR_AUTH_AND_CREDENTIALS.pdf) | Authentication flows, profile fields, and seed admin credentials |

---

## Tech Stack (summary)

**Frontend:** React, TypeScript, Tailwind CSS, Leaflet + OpenStreetMap
**Backend:** Node.js, Express, Socket.IO, JWT
**Database:** PostgreSQL (Supabase)
**Hosting:** Cloudflare Pages (frontend) · Railway (backend) · Supabase (database)

Full rationale in [`TECH_STACK.md`](./TECH_STACK.md).

---

## Design Principles

Modern · Minimal · Fast · Professional · Responsive · Easy to use.
A user should be able to start tracking a bus in **no more than two clicks**.

---

## License / Ownership

Internal project for Bangladesh University of Business and Technology (BUBT). Not currently licensed for external reuse.
