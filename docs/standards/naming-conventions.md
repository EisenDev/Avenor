# Naming Conventions

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth — Non-Negotiable

Consistent naming is not aesthetic preference — it is a communication contract between developers, AI assistants, and the codebase. Inconsistent naming is a bug waiting to happen.

---

## Quick Reference

| Context | Convention | Example |
|---|---|---|
| Files (most) | `kebab-case` | `application-service.ts` |
| Files (React components) | `PascalCase` | `ApplicationCard.tsx` |
| Directories | `kebab-case` | `src/modules/applications/` |
| TypeScript types | `PascalCase` | `ApplicationStatus` |
| TypeScript interfaces | `PascalCase` | `ApplicationRepository` |
| TypeScript enums | `PascalCase` | `InterviewType` |
| TypeScript enum values | `SCREAMING_SNAKE_CASE` | `PHONE_SCREEN` |
| Variables | `camelCase` | `applicationCount` |
| Functions | `camelCase` | `getApplicationById` |
| React components | `PascalCase` | `ApplicationCard` |
| React hooks | `camelCase` prefixed with `use` | `useApplicationStatus` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `DATABASE_URL` |
| CSS class names | `kebab-case` (Tailwind utilities) | `text-sm`, `bg-primary` |
| DB tables | `snake_case` (plural) | `job_applications` |
| DB columns | `snake_case` | `applied_at` |
| DB indexes | `snake_case` | `job_applications_user_id_idx` |
| API routes | `kebab-case` | `/api/job-applications` |
| API query params | `camelCase` | `?companyName=Acme` |
| Git branches | `kebab-case` with prefix | `feat/application-status-filter` |

---

## File Naming

### TypeScript Files

```
# Service layer
src/modules/applications/service.ts          ✅
src/modules/applications/ApplicationService.ts  ❌

# Repository layer
src/modules/applications/repository.ts       ✅

# Utility files
src/lib/api-utils.ts                         ✅
src/lib/apiUtils.ts                          ❌

# Route handlers
src/app/api/applications/route.ts            ✅
src/app/api/applications/[id]/route.ts       ✅
```

### React Component Files

```
# Components use PascalCase (filename matches component name)
src/components/shared/ApplicationCard.tsx    ✅
src/components/shared/application-card.tsx  ❌

# Page files use lowercase (Next.js App Router convention)
src/app/(auth)/applications/page.tsx         ✅
src/app/(auth)/applications/loading.tsx      ✅
src/app/(auth)/applications/error.tsx        ✅
```

### Test Files

```
# Tests mirror the file they test with .test.ts suffix
src/modules/applications/__tests__/service.test.ts
src/modules/applications/__tests__/repository.test.ts

# E2E tests
tests/e2e/applications.spec.ts
```

---

## TypeScript Naming

### Zod Schemas

```ts
// ✅ Schema names end with "Schema"
const ApplicationSchema = z.object({ ... })
const CreateApplicationInputSchema = z.object({ ... })
const UpdateApplicationInputSchema = z.object({ ... })
const ApplicationListResponseSchema = z.array(ApplicationSchema)
```

### Types and Interfaces

```ts
// ✅ Types derived from schemas match schema name without "Schema"
type Application = z.infer<typeof ApplicationSchema>
type CreateApplicationInput = z.infer<typeof CreateApplicationInputSchema>

// ✅ Prop types are [ComponentName]Props
interface ApplicationCardProps { ... }

// ✅ Repository interfaces are [Domain]Repository
interface ApplicationRepository {
  findById(id: string): Promise<Application | null>
}

// ✅ Service interfaces are [Domain]Service
interface ApplicationService {
  create(input: CreateApplicationInput): Promise<Application>
}
```

### Function Naming Patterns

```ts
// Data fetching — starts with verb describing action
async function getApplicationById(id: string): Promise<Application | null>
async function listApplicationsByUser(userId: string): Promise<Application[]>
async function searchApplications(query: SearchQuery): Promise<Application[]>

// Mutations — starts with action verb
async function createApplication(input: CreateApplicationInput): Promise<Application>
async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void>
async function deleteApplication(id: string): Promise<void>

// Boolean functions — starts with is/has/can/should
function isApplicationExpired(application: Application): boolean
function hasReachedInterviewStage(application: Application): boolean
function canUserModifyApplication(userId: string, application: Application): boolean

// Event handlers — starts with handle or on
function handleStatusChange(status: ApplicationStatus): void
function onFormSubmit(data: FormData): void

// React Server Actions — ends with Action
async function createApplicationAction(prev: ActionState, form: FormData): Promise<ActionState>
```

---

## Database Naming

### Tables

```sql
-- ✅ snake_case, plural
job_applications
interview_sessions
document_versions
email_threads
calendar_events
salary_records
expense_records
notification_rules
offer_components
ai_requests

-- ❌ Never
JobApplications     (PascalCase)
job_application     (singular)
jobApplications     (camelCase)
```

### Columns

```sql
-- ✅ snake_case
id                  -- always UUID, named simply "id"
user_id             -- foreign keys: [referenced_table_singular]_id
company_name        
applied_at          -- timestamps: verb + "_at"
created_at
updated_at
deleted_at          -- soft delete column
is_active           -- booleans: "is_" or "has_" prefix
interview_count     -- counts: noun + "_count"
```

### Indexes

```sql
-- Pattern: [table]_[column(s)]_idx
-- Unique: [table]_[column(s)]_unique
-- Foreign key: [table]_[fk_column]_fk

job_applications_user_id_idx
job_applications_status_created_at_idx
job_applications_user_id_company_name_unique
```

### Enum Types

```sql
-- snake_case with _type or _status suffix
application_status
interview_type
notification_channel
document_type
```

---

## API Route Naming

### URL Patterns

```
# Resource collections
GET  /api/applications
POST /api/applications

# Individual resources
GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id

# Nested resources
GET  /api/applications/:id/interviews
POST /api/applications/:id/interviews

# Actions (when REST doesn't fit cleanly)
POST /api/applications/:id/status        # Update status
POST /api/ai/analyze-resume             # AI operations
POST /api/ai/generate-cover-letter

# Always kebab-case, never camelCase or underscores
GET /api/job-applications               ✅
GET /api/jobApplications               ❌
GET /api/job_applications              ❌
```

### Query Parameters

```
# camelCase query params
GET /api/applications?companyName=Acme&status=applied&page=1&pageSize=20

# Date filters
GET /api/applications?appliedAfter=2024-01-01&appliedBefore=2024-12-31

# Sorting
GET /api/applications?sortBy=appliedAt&sortOrder=desc
```

---

## Git Branch Naming

```bash
# Feature branches
feat/application-status-filter
feat/ai-cover-letter-generation
feat/gmail-integration

# Bug fixes
fix/application-delete-cascade
fix/interview-date-timezone

# Documentation
docs/architecture-overview
docs/api-contracts

# Refactoring
refactor/application-service-split
refactor/move-to-repository-pattern

# Configuration / Infrastructure
chore/update-prisma-schema
chore/github-actions-ci

# Experiments (not merged directly)
spike/ai-provider-comparison
```

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Scopes** match domain module names: `applications`, `interviews`, `ai`, `emails`, `docs`, `auth`, etc.

```bash
# Examples
feat(applications): add status filter to application list API
fix(interviews): correct timezone conversion for interview dates
docs(architecture): add module dependency graph
refactor(ai): extract provider configuration to env module
test(applications): add service unit tests for create operation
chore(prisma): add index on applications.user_id column
```
