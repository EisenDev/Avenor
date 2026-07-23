# Architecture Overview

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## 1. What Is Avenor?

Avenor is an **AI-first Career Management Platform**. It is a monolithic Next.js application organized by business domain. It deliberately avoids microservices and over-engineering in favor of a clean, modular codebase that scales through disciplined architecture rather than infrastructure complexity.

---

## 2. Architectural Style: Modular Monolith

### What This Means

Avenor is a **modular monolith** — a single deployable unit internally organized into well-defined, isolated business domain modules.

Each module owns:
- Its own business logic (services)
- Its own data access layer (repositories)
- Its own validation schemas
- Its own types and interfaces
- Its own tests

Modules communicate with each other only through defined service interfaces — never by reaching directly into another module's internals.

### Why Not Microservices?

| Concern | Microservices | Modular Monolith |
|---|---|---|
| Operational complexity | High (service mesh, k8s, distributed tracing) | Low (single process, single deployment) |
| Development speed | Slow (network calls, contracts between services) | Fast (in-process calls, single codebase) |
| Team size required | Large (dedicated teams per service) | Small (solo to small team) |
| Scaling granularity | Per-service | Per-module (can extract later if needed) |
| Consistency guarantees | Eventual (across services) | Strong (single DB transaction) |
| AI assistant context | Fragmented (must understand service boundaries) | Unified (entire context in one repo) |

**Decision:** At Avenor's scale and team size, microservices create accidental complexity without meaningful benefit. The modular monolith provides clean separation of concerns with the deployment simplicity we need.

If the platform grows to require independent scaling of AI processing or email ingestion, those specific modules are designed to be extracted as separate services — the module boundaries already define the correct seams.

---

## 3. Request Lifecycle

```
Browser / Client
      │
      ▼
Next.js App Router
      │
      ├── Server Components (read-only data, SSR)
      │         │
      │         ▼
      │   Module Service Layer
      │         │
      │         ▼
      │   Prisma (PostgreSQL)
      │
      └── Route Handlers (mutations, API calls)
                │
                ▼
          Zod Validation
                │
                ▼
          Module Service Layer
                │
                ├── Prisma (PostgreSQL)
                └── External APIs (Google, AI providers)
```

**Key principle:** Business logic never lives in React components or Route Handlers. Components render. Route Handlers route and validate. Services own the logic.

---

## 4. Domain Module Architecture

Each business domain follows a consistent internal structure:

```
src/modules/<domain>/
├── index.ts            # Public API — only this is imported by other modules
├── service.ts          # Business logic (the core of the module)
├── repository.ts       # Database access (Prisma calls only here)
├── schemas.ts          # Zod validation schemas
├── types.ts            # TypeScript types derived from schemas
├── errors.ts           # Domain-specific error classes
└── __tests__/          # Module-level tests
    ├── service.test.ts
    └── repository.test.ts
```

### The Module Boundary Rule

> A module must **never import** from another module's internal files.
>
> ✅ Allowed: `import { getApplication } from '@/modules/applications'`
>
> ❌ Forbidden: `import { applicationRepository } from '@/modules/applications/repository'`

This rule is enforced through ESLint. Violations are build-time errors.

---

## 5. Technology Layer Map

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  React Server Components  │  React Client Components        │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP / RSC
┌──────────────────▼──────────────────────────────────────────┐
│                    Next.js App Router                        │
│  Pages (app/)    │  Layouts    │  Route Handlers (app/api/)  │
└──────────────────┬──────────────────────────────────────────┘
                   │ Function calls
┌──────────────────▼──────────────────────────────────────────┐
│                  Module Service Layer                        │
│  applications  interviews  documents  emails  ai  analytics  │
│  calendar      offers      notifications       salary        │
└──────────────────┬──────────────────────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────────────────────┐
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘

External:
  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐
  │  Google OAuth│  │ Gmail API    │  │ Google Calendar   │
  └──────────────┘  └──────────────┘  └───────────────────┘
  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐
  │  OpenAI API  │  │ Anthropic API│  │ Google Gemini API │
  └──────────────┘  └──────────────┘  └───────────────────┘
```

---

## 6. Data Flow Principles

### Server-Side Data Fetching

- Server Components fetch data directly by calling the module service layer
- No API calls from Server Components to Route Handlers (avoids unnecessary HTTP round trips)
- Data is fetched at the lowest component in the tree that needs it

### Client-Side Data Management

- Use React Query for client-side data that needs caching, polling, or optimistic updates
- Use React Server Component revalidation (`revalidatePath`, `revalidateTag`) for server-driven mutations
- Never store sensitive data in client state (localStorage, sessionStorage)

### Mutations

- All writes go through Route Handlers
- Route Handlers validate with Zod, then call the service layer
- Services return typed results — never raw Prisma models

---

## 7. Security Architecture

- **Authentication:** Auth.js v5 with Google OAuth
- **Authorization:** Session-based, validated on every request in middleware
- **Input Validation:** Zod schemas on all Route Handler inputs
- **Secrets:** Environment variables only, validated on startup via `src/lib/env.ts`
- **CORS:** Handled by Next.js; API routes are same-origin only (no public API surface)
- **Rate Limiting:** Applied at the middleware layer for AI and auth endpoints

Full security standards → [`docs/security/README.md`](../security/README.md)

---

## 8. AI Architecture

Avenor uses a **provider abstraction layer** that wraps OpenAI, Anthropic, and Google AI behind a single interface. Switching providers requires only a configuration change, not code changes.

All AI operations are:
- Asynchronous (no blocking AI calls in request handlers)
- Logged (every prompt, response, token count, and latency)
- Validated (outputs are parsed through Zod schemas before use)
- Auditable (stored in the database for debugging and cost tracking)

Full AI architecture → [`docs/ai/README.md`](../ai/README.md)

---

## 9. Scalability Design

The modular monolith is designed for **vertical extraction** — individual modules can be extracted into separate services as load demands it.

Priority extraction candidates (if scale demands):
1. `ai` module → separate AI service (heavy compute, independent scaling)
2. `emails` module → separate email ingestion service (high volume, async)
3. `analytics` module → separate read-only replica queries

These are future decisions, not current architecture. Today, everything runs in one process.

---

## 10. Related Documents

- [`stack.md`](./stack.md) — Full technology stack with rationale
- [`folder-structure.md`](./folder-structure.md) — Complete repository layout
- [`modules.md`](./modules.md) — Domain module boundaries and ownership
- [`decisions/`](../decisions/) — All Architecture Decision Records
