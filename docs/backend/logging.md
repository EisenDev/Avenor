# Logging Standards

> **Document Owner:** Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Logging Philosophy

Avenor uses **structured logging** — every log entry is a JSON object, not a string. Structured logs can be queried, filtered, and aggregated. String logs cannot.

The logger is defined in `src/lib/logger.ts`. Every use of `console.log`, `console.warn`, or `console.error` in application code is a violation of these standards.

---

## Log Levels

| Level | When to Use |
|---|---|
| `error` | Unexpected failures that require investigation. Always includes error message and stack. |
| `warn` | Expected but notable conditions: rate limit approaching, deprecated feature used, retry attempted |
| `info` | Significant business events: user authenticated, application created, AI request completed |
| `debug` | Detailed diagnostic information. Only logged in development. Never in production. |

---

## Logger Interface

```ts
// src/lib/logger.ts
interface LogContext {
  [key: string]: unknown
}

interface Logger {
  error(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  debug(message: string, context?: LogContext): void
}

// Usage
import { logger } from '@/lib/logger'
```

---

## Logging Patterns

### ✅ Correct Usage

```ts
// Business events — informational
logger.info('Application created', {
  applicationId: application.id,
  userId: session.user.id,
  company: application.company,
})

// Warnings — notable but not failures
logger.warn('AI provider rate limit approaching', {
  provider: 'openai',
  remainingRequests: 15,
  resetAt: rateLimit.resetAt,
})

// Errors — with full context
logger.error('Failed to sync Gmail emails', {
  userId: session.user.id,
  emailConnectionId: connection.id,
  error: error instanceof Error ? error.message : String(error),
  attempt: 3,
})

// Debug — development only
logger.debug('Query plan for application list', {
  query: buildQuery.toString(),
  params: filters,
})
```

### ❌ Incorrect Usage

```ts
// Never use console
console.log('Application created:', app.id)
console.error('Error:', error)

// Never log raw error objects (circular references, inconsistent shape)
logger.error('Failed', { error })  // ❌
logger.error('Failed', { error: error.message })  // ✅

// Never log sensitive data
logger.info('User authenticated', { password: input.password })  // ❌ NEVER
logger.info('OAuth token received', { accessToken: token })  // ❌ NEVER
logger.info('AI request', { apiKey: env.OPENAI_API_KEY })  // ❌ NEVER
```

---

## Standard Context Fields

Use these field names consistently across all logs for easy filtering:

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Authenticated user's ID |
| `sessionId` | `string` | Auth session ID |
| `applicationId` | `string` | Job application record ID |
| `interviewId` | `string` | Interview record ID |
| `requestId` | `string` | Unique request identifier (set in middleware) |
| `provider` | `string` | AI provider name: `'openai'`, `'anthropic'`, `'gemini'` |
| `error` | `string` | `error.message` — never the raw Error object |
| `stack` | `string?` | `error.stack` — only for `error` level logs |
| `duration` | `number` | Operation duration in milliseconds |
| `attempt` | `number` | Retry attempt number |

---

## What to Log

| Event | Level | Required Fields |
|---|---|---|
| User authenticated | `info` | `userId` |
| Application created | `info` | `userId`, `applicationId` |
| Application deleted | `info` | `userId`, `applicationId` |
| AI request sent | `info` | `userId`, `provider`, `model`, `operation` |
| AI request completed | `info` | `userId`, `provider`, `tokensUsed`, `duration` |
| Gmail sync started | `info` | `userId`, `emailConnectionId` |
| External API error | `error` | `provider`, `error`, `statusCode`, `attempt` |
| Auth failure | `warn` | `userId?`, `reason` |
| Rate limit hit | `warn` | `provider`, `endpoint` |
| DB query slow (>1s) | `warn` | `query`, `duration` |
| Unhandled error | `error` | `requestId`, `error`, `stack` |

---

## What to Never Log

- Passwords or password hashes
- OAuth access tokens or refresh tokens
- API keys (OpenAI, Anthropic, Google)
- Full credit card numbers or financial PII
- Full Social Security Numbers
- Session tokens or JWT secrets
- Full email body content (log metadata only: subject, sender domain)

---

## Log Output

- **Development:** Pretty-printed JSON to stdout
- **Production:** JSON Lines (JSONL) format, shipped to log aggregation (Datadog, Logtail, etc.)

The logger implementation handles this automatically based on `NODE_ENV`.
