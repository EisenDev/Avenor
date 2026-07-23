# Error Handling Strategy

> **Document Owner:** Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Philosophy

Errors in Avenor are **first-class citizens**. Every error has a type, a message, and an HTTP status code. Silent failures are bugs. Uncaught errors are bugs. Generic "Something went wrong" messages are unacceptable.

The error handling system has three levels:
1. **Domain errors** — business logic failures (e.g., ApplicationNotFoundError)
2. **Validation errors** — invalid input (Zod errors)
3. **Infrastructure errors** — database, network, external API failures

---

## Error Class Hierarchy

```
Error (JavaScript built-in)
└── AppError                          src/lib/errors.ts
    ├── ValidationError               (wraps ZodError)
    ├── AuthenticationError           (401)
    ├── AuthorizationError            (403)
    ├── NotFoundError                 (404)
    └── [Domain]Error                 src/modules/[domain]/errors.ts
        ├── ApplicationNotFoundError
        ├── DuplicateApplicationError
        ├── InterviewConflictError
        └── ...
```

### Base Error Class

```ts
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
    // Preserve prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, 'NOT_FOUND', 404)
  }
}

export class AuthenticationError extends AppError {
  constructor() {
    super('Authentication required', 'UNAUTHENTICATED', 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(action: string) {
    super(`Not authorized to ${action}`, 'FORBIDDEN', 403)
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, unknown>) {
    super('Validation failed', 'VALIDATION_ERROR', 422, details)
  }
}
```

### Domain Error Pattern

```ts
// src/modules/applications/errors.ts

import { AppError, NotFoundError } from '@/lib/errors'

export class ApplicationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Application', id)
  }
}

export class DuplicateApplicationError extends AppError {
  constructor(company: string, role: string) {
    super(
      `An application for "${role}" at "${company}" already exists`,
      'DUPLICATE_APPLICATION',
      409,
    )
  }
}
```

---

## Centralized API Error Handler

```ts
// src/lib/errors.ts

import { ZodError } from 'zod'
import { NextResponse } from 'next/server'

export function handleApiError(error: unknown): NextResponse {
  // Domain / app errors — typed and expected
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.httpStatus },
    )
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    )
  }

  // Unexpected errors — log and return generic 500
  logger.error('Unhandled error in Route Handler', { error })
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 },
  )
}
```

---

## Error Response Format

All error responses follow this schema:

```json
{
  "error": {
    "code": "APPLICATION_NOT_FOUND",
    "message": "Application with id \"abc-123\" not found",
    "details": {}
  }
}
```

| Field | Type | Description |
|---|---|---|
| `code` | `string` | Machine-readable error code in SCREAMING_SNAKE_CASE |
| `message` | `string` | Human-readable error message |
| `details` | `object?` | Additional error context (validation field errors, etc.) |

---

## Service Layer Error Handling

Services throw domain errors — they never return `null` for not-found cases:

```ts
// ✅ Throw domain-specific errors
async function getById(id: string, userId: string): Promise<Application> {
  const application = await applicationRepository.findById(id)
  if (!application) throw new ApplicationNotFoundError(id)
  if (application.userId !== userId) throw new AuthorizationError('view this application')
  return application
}

// ❌ Never return null when the resource must exist
async function getById(id: string): Promise<Application | null> {
  return applicationRepository.findById(id) // Caller has to check null — easily forgotten
}
```

---

## Frontend Error Handling

- All pages have an `error.tsx` error boundary file
- Server Components errors are caught by the nearest `error.tsx`
- Client-side errors from mutations show a toast notification
- Network errors (Route Handler failures) display an inline error state

---

## Logging Errors

Every caught error at the Route Handler level is logged with structured context:

```ts
logger.error('Operation failed', {
  operation: 'createApplication',
  userId: session.user.id,
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
})
```

Never log: passwords, tokens, full PII, raw API keys.

Full logging guide → [`logging.md`](./logging.md)
