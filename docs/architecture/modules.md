# Domain Modules

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

This document maps every business domain to its module, defines module boundaries, and assigns team ownership. No domain logic lives outside a module.

---

## Module Map

| Module | Path | Team Owner | Core Responsibility |
|---|---|---|---|
| `applications` | `src/modules/applications/` | Backend Team | Job application lifecycle and status |
| `interviews` | `src/modules/interviews/` | Backend Team | Interview scheduling and tracking |
| `documents` | `src/modules/documents/` | Backend Team | Resume and document management |
| `emails` | `src/modules/emails/` | AI Team + Backend | Gmail integration and email classification |
| `calendar` | `src/modules/calendar/` | Backend Team | Google Calendar integration |
| `ai` | `src/modules/ai/` | AI Team | Provider abstraction and prompt management |
| `analytics` | `src/modules/analytics/` | Backend Team | Career analytics queries and aggregations |
| `offers` | `src/modules/offers/` | Backend Team | Offer comparison and negotiation tracking |
| `notifications` | `src/modules/notifications/` | Backend Team | Reminders, alerts, and notifications |
| `salary` | `src/modules/salary/` | Backend Team | Salary and expense tracking |

---

## Module Anatomy

Every module follows this exact structure. No exceptions:

```
src/modules/<domain>/
├── index.ts            # Public API — ONLY file imported by external code
├── service.ts          # Business logic — the heart of the module
├── repository.ts       # Database access — Prisma calls only
├── schemas.ts          # Zod validation schemas
├── types.ts            # TypeScript types (inferred from schemas)
├── errors.ts           # Domain-specific error classes
└── __tests__/
    ├── service.test.ts
    └── repository.test.ts
```

### `index.ts` — The Public API Contract

This file is the only file other modules are allowed to import from. It explicitly re-exports what is publicly available.

```ts
// Example: src/modules/applications/index.ts
export { ApplicationService } from './service'
export type { Application, ApplicationStatus, CreateApplicationInput } from './types'
export { ApplicationNotFoundError, DuplicateApplicationError } from './errors'
```

If something is not exported from `index.ts`, it is private to the module.

### `service.ts` — Business Logic

- Contains all business rules and orchestration logic
- Calls `repository.ts` for data access
- Calls other modules only via their `index.ts` public API
- Returns domain types (never raw Prisma models)
- Throws domain-specific errors from `errors.ts`

### `repository.ts` — Data Access

- The only file that imports Prisma
- No business logic — pure data access
- Methods mirror CRUD operations + domain-specific queries
- Returns Prisma types or mapped domain types

### `schemas.ts` — Validation

- All Zod schemas for the domain
- Input schemas (for API validation)
- Output schemas (for AI output validation)
- Types are **inferred** from schemas, not hand-written

### `types.ts` — TypeScript Types

```ts
// Always derive types from Zod schemas — never write them manually
import type { z } from 'zod'
import { ApplicationSchema, CreateApplicationInputSchema } from './schemas'

export type Application = z.infer<typeof ApplicationSchema>
export type CreateApplicationInput = z.infer<typeof CreateApplicationInputSchema>
```

### `errors.ts` — Domain Errors

```ts
// Each module defines its own error hierarchy
export class ApplicationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = 'ApplicationError'
  }
}

export class ApplicationNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(`Application with id "${id}" not found`, 'APPLICATION_NOT_FOUND')
  }
}
```

---

## Cross-Module Communication Rules

### Allowed

```ts
// ✅ Module A imports from Module B's public index
import { getApplication } from '@/modules/applications'
```

### Forbidden

```ts
// ❌ Never import from another module's internals
import { applicationRepository } from '@/modules/applications/repository'
import { buildApplicationQuery } from '@/modules/applications/service'
```

### Circular Dependency Rule

Circular module dependencies are **forbidden**. If Module A depends on Module B, Module B must never depend on Module A.

Current dependency graph:

```
applications ──depends on──► ai (for resume analysis)
interviews   ──depends on──► applications (interview belongs to application)
interviews   ──depends on──► calendar (creates calendar events)
emails       ──depends on──► ai (for email classification)
emails       ──depends on──► applications (links emails to applications)
offers       ──depends on──► applications (offer belongs to application)
notifications──depends on──► applications, interviews, offers (triggers)
analytics    ──depends on──► applications, interviews, offers, salary (reads)
```

All arrows are one-directional. No cycles.

---

## Module Descriptions

### `applications`

The central domain of Avenor. Manages the full job application lifecycle.

**Core entities:** Application, ApplicationStatus, ApplicationTimeline
**Key operations:**
- Create, update, delete applications
- Track status transitions (Applied → Interviewing → Offered → Accepted/Rejected)
- Timeline event logging
- Application search and filtering

---

### `interviews`

Tracks interviews within an application lifecycle.

**Core entities:** Interview, InterviewType, InterviewFeedback
**Key operations:**
- Schedule interviews (linked to applications)
- Track interview types (phone, technical, behavioral, final)
- Record feedback and outcomes
- Sync with Google Calendar via the `calendar` module

---

### `documents`

Manages all career-related documents (resumes, cover letters, portfolios).

**Core entities:** Document, DocumentVersion, DocumentType
**Key operations:**
- Upload and store documents (file storage integration)
- Version history for resumes
- Link documents to specific applications
- Trigger AI analysis via the `ai` module

---

### `emails`

Gmail integration and AI-powered email classification.

**Core entities:** EmailConnection, EmailThread, EmailClassification
**Key operations:**
- OAuth connection to Gmail account
- Sync relevant email threads
- AI classification of emails (offer, rejection, interview invite, etc.)
- Link email threads to applications

---

### `calendar`

Google Calendar integration for interview scheduling.

**Core entities:** CalendarConnection, CalendarEvent
**Key operations:**
- OAuth connection to Google Calendar
- Create and update calendar events for interviews
- Sync interview schedules from calendar to Avenor

---

### `ai`

Provider abstraction layer. No business logic — pure infrastructure.

**Core entities:** AIRequest, AIResponse (both logged to DB)
**Key operations:**
- Route AI requests to configured provider
- Log all prompts, responses, token counts, and latency
- Manage prompt templates
- Parse and validate AI output with Zod

---

### `analytics`

Read-only domain that aggregates data from other domains.

**Core entities:** No owned entities — reads from other modules' tables
**Key operations:**
- Application funnel analysis (applied → offered rate)
- Interview-to-offer conversion rate
- Average time-to-offer by company/role type
- Salary progression tracking
- Monthly application volume trends

---

### `offers`

Tracks and compares job offers.

**Core entities:** Offer, OfferComponent (salary, equity, benefits)
**Key operations:**
- Record offer details (salary, equity, benefits, deadline)
- Compare multiple offers side-by-side
- Calculate total compensation
- Track negotiation history

---

### `notifications`

Manages reminders and alerts.

**Core entities:** Notification, NotificationRule, NotificationChannel
**Key operations:**
- Follow-up reminders (e.g., "Follow up with Company X in 5 days")
- Interview preparation reminders
- Offer deadline alerts
- In-app and email notification delivery

---

### `salary`

Tracks salary expectations, received offers, and expenses.

**Core entities:** SalaryRecord, ExpenseRecord, Currency
**Key operations:**
- Log salary history
- Track job-search expenses (courses, certifications, travel)
- Compare offer salaries to market data
- Expense reporting
