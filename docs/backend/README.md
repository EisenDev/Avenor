# Backend Standards

> **Document Owner:** Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

The backend of Avenor is implemented within the Next.js App Router. There is no separate API server. Business logic is organized into domain modules under `src/modules/`. API surface is exposed through Next.js Route Handlers under `src/app/api/`.

This document is the entry point for all backend development work. Read this before touching any server-side code.

---

## Backend Architecture Layers

```
HTTP Request (from browser or external caller)
         │
         ▼
  Route Handler           src/app/api/[domain]/route.ts
  (validate + route)      - Parse + validate input with Zod
                          - Call service layer
                          - Return typed response
         │
         ▼
  Service Layer           src/modules/[domain]/service.ts
  (business logic)        - Business rules and orchestration
                          - Calls repositories for data
                          - Calls other module public APIs
                          - Throws domain-specific errors
         │
         ▼
  Repository Layer        src/modules/[domain]/repository.ts
  (data access)           - All Prisma calls
                          - Returns domain types (not Prisma models)
                          - No business logic here
         │
         ▼
  Database                PostgreSQL via Prisma client (src/lib/db.ts)
```

Every layer has a single responsibility. Crossing responsibilities is a bug in the architecture.

---

## Required Reading by Topic

| Topic | Document |
|---|---|
| Authentication patterns | [`auth.md`](./auth.md) |
| Route Handler patterns | [`route-handlers.md`](./route-handlers.md) |
| Service layer patterns | [`services.md`](./services.md) |
| Repository pattern | [`repositories.md`](./repositories.md) |
| Error handling | [`error-handling.md`](./error-handling.md) |
| Logging | [`logging.md`](./logging.md) |

---

## The Golden Rules

1. **No business logic in Route Handlers** — Route Handlers only validate, call the service, and format the response
2. **No Prisma in services** — Services call repositories; only repositories call Prisma
3. **No cross-module internal imports** — only import from a module's `index.ts`
4. **Every input is validated with Zod** — before any service call is made
5. **Every error is handled** — no unhandled promise rejections, no silent failures
6. **No raw SQL** — Prisma only, unless approved by an ADR

---

## Backend Team Ownership

| Domain | Primary Owner | Module |
|---|---|---|
| Authentication | Backend | `src/lib/auth.ts`, `src/modules/auth/` |
| Applications | Backend | `src/modules/applications/` |
| Interviews | Backend | `src/modules/interviews/` |
| Documents | Backend | `src/modules/documents/` |
| Emails | Backend + AI | `src/modules/emails/` |
| Calendar | Backend | `src/modules/calendar/` |
| AI features | AI Team | `src/modules/ai/` |
| Analytics | Backend | `src/modules/analytics/` |
| Offers | Backend | `src/modules/offers/` |
| Notifications | Backend | `src/modules/notifications/` |
| Salary | Backend | `src/modules/salary/` |
