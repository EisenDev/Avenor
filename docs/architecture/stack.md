# Technology Stack

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

This document lists every technology in the Avenor stack with the rationale for each choice. Rationale is critical — it prevents future contributors from replacing tools without understanding why they were chosen.

---

## Framework

### Next.js 15 (App Router)

**Why:**
- App Router enables React Server Components by default — the right architectural default for a data-heavy application
- Eliminates the need for a separate Express/Fastify API server (Route Handlers serve this role)
- Full-stack TypeScript in a single codebase reduces context switching and eliminates REST boundary boilerplate for internal communication
- Built-in streaming, suspense boundaries, and layout system reduce UI infrastructure code
- First-class Vercel deployment target with Docker as the alternative for self-hosting

**Trade-offs accepted:**
- App Router has a steeper learning curve than Pages Router
- React Server Components mental model requires discipline (no useState, useEffect on server)
- Caching behavior (fetch cache, router cache) requires understanding to avoid bugs

---

## Language

### TypeScript (strict mode)

**Why:**
- Type safety catches entire categories of bugs at compile time
- `strict` mode is non-negotiable — it enables `strictNullChecks`, `noImplicitAny`, and more
- Types serve as living documentation for AI assistants and future contributors
- Zod + TypeScript together create a single source of truth (Zod schema → inferred type)

**Configuration:** `tsconfig.json` with `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`

---

## Database

### PostgreSQL

**Why:**
- Relational model fits career management data (applications have interviews have offers — relational, not document-oriented)
- ACID transactions are critical for operations like offer acceptance (touches multiple tables)
- Full-text search capability (for resume and document search) without a separate search engine
- JSON/JSONB columns available for flexible AI metadata storage
- Proven, production-grade, widely supported

**Hosting:** Docker for local development; managed PostgreSQL (Railway, Supabase, or RDS) for production

---

## ORM

### Prisma

**Why:**
- Type-safe database client generated from the schema — eliminates SQL injection surface and type mismatches
- Schema-as-code with migration history (reproducible, version-controlled)
- Excellent TypeScript integration — IDE autocomplete for every query
- Prisma Studio for database inspection during development

**Rules:**
- No raw SQL unless approved by ADR (see [`docs/decisions/`](../decisions/))
- All database access goes through `src/lib/db.ts` (single Prisma client instance)
- Repository pattern wraps Prisma — services never call Prisma directly

---

## Authentication

### Auth.js v5 (formerly NextAuth)

**Why:**
- Native Next.js App Router support (v5 is built for this)
- Google OAuth built-in — essential for Gmail/Calendar integration scopes
- Session management, CSRF protection, and JWT/database sessions handled automatically
- Extensible for future OAuth providers without architecture change

**Configuration:** Database sessions (not JWT) for better server-side invalidation control

---

## Validation

### Zod

**Why:**
- Runtime validation with TypeScript type inference — one schema, two benefits
- Composable schema building allows complex validation trees
- Excellent error messages for API responses
- Works identically on server and client (shared schemas)
- Integrates natively with React Hook Form

**Rule:** Every external input (API route bodies, URL params, environment variables, AI outputs) must pass through a Zod schema before use.

---

## Forms

### React Hook Form

**Why:**
- Uncontrolled form approach — zero re-renders on input change
- First-class Zod integration via `@hookform/resolvers/zod`
- Minimal bundle size
- Handles complex form state (multi-step forms, dynamic fields) cleanly

---

## Styling

### TailwindCSS v4

**Why:**
- Utility-first CSS eliminates dead CSS and specificity conflicts
- Co-located styles with markup improve readability
- shadcn/ui is built on Tailwind — the two must be used together
- AI assistants generate correct Tailwind code reliably

**Rules:**
- No inline styles
- No CSS modules (Tailwind is the single CSS strategy)
- Custom design tokens are defined in `tailwind.config.ts`, not scattered in components

---

## UI Components

### shadcn/ui

**Why:**
- Not a dependency — components are copied into the project and owned completely
- Built on Radix UI primitives (accessible by default)
- Fully customizable via Tailwind
- AI assistants understand shadcn/ui patterns well
- Consistent with the design system without locking into a third-party release cycle

**Rules:**
- All UI primitives come from `src/components/ui/` (shadcn copies)
- Do not modify shadcn components directly — extend them with wrapper components in `src/components/shared/`

---

## Charts

### Recharts

**Why:**
- React-native charting library (no D3 dependency management)
- Composable API fits React's component model
- Responsive by default
- Sufficient for career analytics use cases (line, bar, area, pie charts)

---

## AI

### Provider Abstraction (OpenAI / Anthropic / Google Gemini)

**Why a abstraction layer:**
- AI provider landscape is evolving rapidly — locking into one provider is a risk
- Different providers have different strengths (code generation, long context, vision)
- Cost optimization requires being able to route different task types to different providers
- Testing is easier with a mockable interface

**Current supported providers:**
- OpenAI (GPT-4o, GPT-4o-mini)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku)
- Google (Gemini 1.5 Pro, Gemini 1.5 Flash)

Full design → [`docs/ai/provider-abstraction.md`](../ai/provider-abstraction.md)

---

## Email Integration

### Google Gmail API

**Why:**
- Users need to connect their work/personal Gmail to automatically classify job-related emails
- OAuth flow is already established for Google auth — adding Gmail scope is incremental
- Gmail API provides full read/write access needed for automated follow-up detection

---

## Calendar Integration

### Google Calendar API

**Why:**
- Interview scheduling is a core use case
- Google Calendar is the dominant platform for professional scheduling
- Shares the OAuth infrastructure with Gmail integration

---

## Deployment

### Docker

**Why:**
- Reproducible builds eliminate "works on my machine" problems
- Single `docker-compose.yml` for local development (app + PostgreSQL)
- Production deployment to any container platform (Railway, Fly.io, AWS ECS, GCP Cloud Run)
- Future Kubernetes migration is possible if needed

Full deployment architecture → [`docs/deployment/README.md`](../deployment/README.md)

---

## Package Manager

### pnpm

**Why:**
- Faster than npm and yarn via content-addressable storage
- Strict dependency resolution prevents phantom dependencies
- Workspace support for potential future monorepo expansion
- Lock file is smaller and more readable than npm's

---

## What Is NOT in the Stack (and Why)

| Technology | Why Excluded |
|---|---|
| tRPC | Adds complexity without benefit — Route Handlers + Zod serve the same role with less magic |
| GraphQL | Over-engineered for this use case — REST patterns with typed responses are sufficient |
| Redux | React Server Components + React Query replace most state management needs |
| Mongoose / MongoDB | Relational data model is the right fit; no document DB needed |
| Express / Fastify | Next.js Route Handlers eliminate the need for a separate API server |
| Turborepo | No monorepo needed at this scale — single package |
| Storybook | Added only if UI component library grows to need isolated development |
