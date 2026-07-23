# Coding Standards

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth — Non-Negotiable

These standards apply to every file in the codebase. No exceptions. Code that violates these standards will not pass code review.

---

## 1. TypeScript Standards

### Strict Mode

`tsconfig.json` must always contain:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Discipline

```ts
// ❌ NEVER use `any`
function process(data: any) { ... }

// ✅ Use `unknown` and narrow with type guards or Zod
function process(data: unknown) {
  const parsed = InputSchema.parse(data) // Zod narrows to the correct type
  ...
}

// ❌ NEVER use non-null assertion without justification comment
const user = getUser()!

// ✅ Handle null explicitly
const user = getUser()
if (!user) throw new UserNotFoundError(id)

// ❌ NEVER use type assertions without comment
const element = document.getElementById('app') as HTMLDivElement

// ✅ Use type guards
const element = document.getElementById('app')
if (!(element instanceof HTMLDivElement)) {
  throw new Error('Expected HTMLDivElement')
}
```

### Type Definition Rules

```ts
// ✅ Always derive types from Zod schemas
import { z } from 'zod'
const UserSchema = z.object({ id: z.string(), email: z.string().email() })
type User = z.infer<typeof UserSchema>

// ✅ Use `interface` for objects that will be extended
interface Repository<T> {
  findById(id: string): Promise<T | null>
  findMany(filters: unknown): Promise<T[]>
  create(data: unknown): Promise<T>
}

// ✅ Use `type` for unions, intersections, and aliases
type ApplicationStatus = 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date }
```

---

## 2. Import Standards

### Import Order (enforced by ESLint)

```ts
// 1. Node.js built-ins
import { readFile } from 'fs/promises'

// 2. External packages
import { z } from 'zod'
import { NextResponse } from 'next/server'

// 3. Internal absolute imports (aliases)
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { ApplicationService } from '@/modules/applications'

// 4. Relative imports
import { buildFilters } from './utils'

// 5. Type-only imports (last)
import type { Application } from '@/modules/applications'
import type { NextRequest } from 'next/server'
```

### Path Aliases

Always use `@/` alias, never relative paths that go up more than one level:

```ts
// ✅ Always use path aliases
import { db } from '@/lib/db'
import { getApplication } from '@/modules/applications'

// ❌ Never use deep relative paths
import { db } from '../../../lib/db'
```

### Barrel File Policy

- **Modules:** Each module has one `index.ts` barrel (public API). This is required.
- **Components:** Component directories do NOT use barrel files (they cause large bundle sizes).
- **lib/:** Individual imports only, no barrel. Import `@/lib/db`, `@/lib/logger` directly.

---

## 3. Function Standards

```ts
// ✅ Named function declarations for top-level functions
async function getApplicationById(id: string): Promise<Application> {
  ...
}

// ✅ Arrow functions for callbacks and inline functions
const filtered = applications.filter((app) => app.status === 'active')

// ✅ Async/await — never .then()/.catch() chaining
const result = await getApplicationById(id)

// ❌ Never mix async paradigms
getApplicationById(id)
  .then((result) => { ... })
  .catch((err) => { ... })

// ✅ Always specify return types on exported functions
export async function createApplication(
  input: CreateApplicationInput
): Promise<Application> { ... }

// ✅ Use early returns to reduce nesting
async function processApplication(id: string): Promise<void> {
  const app = await getApplicationById(id)
  if (!app) throw new ApplicationNotFoundError(id)
  if (app.status === 'closed') return // Early return

  // Main logic follows with no nesting
  await updateApplicationStatus(id, 'processing')
}
```

---

## 4. Error Handling Standards

```ts
// ✅ Always handle errors explicitly — never swallow them
try {
  await riskyOperation()
} catch (error) {
  // ✅ Log structured error with context
  logger.error('Failed to process application', {
    applicationId: id,
    error: error instanceof Error ? error.message : String(error),
  })
  // ✅ Re-throw or convert to domain error
  throw new ApplicationProcessingError(id)
}

// ✅ Route Handlers return typed error responses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = CreateApplicationInputSchema.parse(body) // Throws ZodError
    const result = await ApplicationService.create(input)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error) // Centralized error handler in lib/errors.ts
  }
}
```

Full error handling guide → [`docs/backend/error-handling.md`](../backend/error-handling.md)

---

## 5. Logging Standards

```ts
// ✅ Always use the structured logger
import { logger } from '@/lib/logger'

// ✅ Provide context objects — never concatenate strings
logger.info('Application created', { applicationId: app.id, userId: user.id })
logger.warn('Rate limit approaching', { provider: 'openai', remaining: 10 })
logger.error('Database query failed', { table: 'applications', error: err.message })

// ❌ NEVER use console.log/warn/error
console.log('Application created:', app.id) // Forbidden
```

Full logging guide → [`docs/backend/logging.md`](../backend/logging.md)

---

## 6. React and Next.js Standards

### Server vs. Client Components

```tsx
// ✅ Server Component by default — no directive needed
// src/app/(auth)/applications/page.tsx
async function ApplicationsPage() {
  // Direct data fetching — no useEffect, no useState
  const applications = await ApplicationService.findByUser(userId)
  return <ApplicationList applications={applications} />
}

// ✅ Client Component — only when you need browser APIs or interactivity
// "use client" must be the FIRST line, with a comment explaining why
'use client'
// Requires client: uses useState for optimistic UI updates
import { useState } from 'react'

function ApplicationStatusToggle({ applicationId }: { applicationId: string }) {
  const [isPending, setIsPending] = useState(false)
  ...
}
```

### Component Rules

```tsx
// ✅ Props interfaces are always named [ComponentName]Props
interface ApplicationCardProps {
  application: Application
  onStatusChange?: (status: ApplicationStatus) => void
}

// ✅ Explicit return type on all exported components
export function ApplicationCard({
  application,
  onStatusChange,
}: ApplicationCardProps): React.JSX.Element {
  ...
}

// ✅ Server Actions for form mutations
'use server'
export async function createApplicationAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> { ... }
```

---

## 7. Code Organization Standards

### File Size

- Maximum 300 lines per file. If a file exceeds this, split it by responsibility.
- Exception: Generated files (Prisma client, type definitions)

### Comment Policy

```ts
// ✅ Comment WHY, not WHAT
// We use optimistic locking here because concurrent status updates
// would otherwise create silent data races on high-traffic applications
const result = await db.application.update({
  where: { id, version: currentVersion },
  data: { status, version: { increment: 1 } },
})

// ❌ Never comment what the code already says
// Update application status
await db.application.update({ where: { id }, data: { status } })
```

### Dead Code Policy

- No commented-out code in committed files
- No unused imports (ESLint will catch this)
- No TODO comments without a linked issue number: `// TODO(#123): implement rate limiting`

---

## 8. Environment Variable Standards

```ts
// ✅ All env vars go through the validated schema in src/lib/env.ts
// Never access process.env directly in application code
import { env } from '@/lib/env'
const apiKey = env.OPENAI_API_KEY // Type-safe, validated at startup

// ❌ Never access process.env directly
const apiKey = process.env.OPENAI_API_KEY // Could be undefined, unvalidated
```

### Adding New Environment Variables

1. Add to `.env.example` with a description comment
2. Add to `src/lib/env.ts` Zod schema
3. Update `docs/deployment/environments.md`
4. Update Docker configuration if needed

---

## 9. Testing Standards

```ts
// ✅ AAA pattern — Arrange, Act, Assert
describe('ApplicationService.create', () => {
  it('should create an application and return it', async () => {
    // Arrange
    const input: CreateApplicationInput = {
      company: 'Acme Corp',
      role: 'Senior Engineer',
      status: 'applied',
    }

    // Act
    const result = await ApplicationService.create(input)

    // Assert
    expect(result.id).toBeDefined()
    expect(result.company).toBe(input.company)
  })
})
```

Full testing guide → [`docs/testing/README.md`](../testing/README.md)
