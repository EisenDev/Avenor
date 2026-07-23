# Security Standards

> **Document Owner:** Security Team / Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth — Non-Negotiable

---

## Security Philosophy

Security is not a feature — it is a baseline. These standards are non-negotiable and enforced at code review. A PR that violates any of the rules in this document is not merged.

---

## Threat Model

Avenor handles:
- Career data (applications, salary expectations, offers)
- Google OAuth tokens (access to Gmail and Calendar)
- AI API keys (OpenAI, Anthropic, Google)
- Personally Identifiable Information (name, email, resume content)

These are the primary attack surfaces:

| Threat | Mitigation |
|---|---|
| OAuth token theft | Database sessions (not localStorage), encrypted at rest |
| SQL injection | Prisma ORM (parameterized queries by default) |
| XSS | React escapes by default; `dangerouslySetInnerHTML` is banned |
| CSRF | Auth.js built-in CSRF protection on mutations |
| API key exposure | Env vars only, validated at startup, never logged |
| Unauthorized data access | User ID check on every data operation |
| Brute force auth | Rate limiting on auth endpoints (10 req/min) |
| Dependency vulnerabilities | `pnpm audit` in CI pipeline |

---

## Authentication Security

- Auth.js v5 manages session creation, rotation, and invalidation
- Sessions are stored server-side in the database (not JWT in cookies)
- Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`
- Sessions expire after 30 days of inactivity
- Sessions are invalidated immediately on password change or explicit logout

Full auth patterns → [`docs/backend/auth.md`](../backend/auth.md)

---

## Authorization Model

Every data operation checks that the authenticated user owns or has rights to the resource:

```ts
// ✅ Always verify ownership in the service layer
async function getApplicationById(id: string, userId: string): Promise<Application> {
  const application = await applicationRepository.findById(id)
  if (!application) throw new ApplicationNotFoundError(id)

  // Authorization check — never skip this
  if (application.userId !== userId) {
    throw new AuthorizationError('view this application')
  }

  return application
}

// ❌ Never trust the client-supplied userId
// (always get userId from the server-side session)
async function getApplicationById(id: string, userIdFromClient: string) {
  // WRONG: userIdFromClient can be spoofed
}
```

**Rule:** `userId` always comes from `session.user.id` (server-side), never from the request body or URL parameters.

---

## Input Validation

All external input is validated with Zod before any processing:

```ts
// ✅ Parse immediately — never access raw body
const body: unknown = await req.json()
const input = CreateApplicationInputSchema.parse(body)
// input is now fully typed and validated

// ❌ Never cast raw input
const input = (await req.json()) as CreateApplicationInput
```

Zod validation errors are converted to `422 Unprocessable Entity` responses automatically by `handleApiError`.

### Validation Rules for Common Fields

```ts
const CreateApplicationInputSchema = z.object({
  company: z.string().min(1).max(100).trim(),
  role: z.string().min(1).max(200).trim(),
  url: z.string().url().optional(),         // Must be a valid URL if provided
  notes: z.string().max(5000).optional(),
  salary: z.number().positive().optional(), // Must be positive if provided
})
```

---

## Secrets Management

```ts
// ✅ All secrets via environment variables, validated on startup
// src/lib/env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,  // Zod validates presence
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ...
}

// ❌ Never hardcode secrets
const OPENAI_API_KEY = 'sk-abc123'  // FORBIDDEN — blocked by pre-commit hook

// ❌ Never log secrets
logger.info('Request sent', { apiKey: env.OPENAI_API_KEY })  // FORBIDDEN
```

### `.env` File Rules

| File | Committed | Purpose |
|---|---|---|
| `.env.example` | ✅ Yes | Template with descriptions, no real values |
| `.env.local` | ❌ No (gitignored) | Local development secrets |
| `.env.production` | ❌ No | Never created — use platform env vars |

---

## Forbidden Patterns

These patterns are rejected at code review, no exceptions:

```tsx
// ❌ dangerouslySetInnerHTML — XSS vector
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ❌ Direct process.env access in application code
const key = process.env.SECRET_KEY

// ❌ Storing tokens client-side
localStorage.setItem('accessToken', token)

// ❌ Raw SQL (without ADR approval)
await db.$queryRaw`SELECT * FROM users WHERE id = ${id}`

// ❌ Logging sensitive data
logger.info('User login', { password: formData.password })

// ❌ Trusting client-supplied user ID
const userId = req.body.userId  // Must come from session
```

---

## Content Security Policy (CSP)

CSP headers are configured in `next.config.ts`:

```ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Required for Next.js
      "style-src 'self' 'unsafe-inline'",                  // Required for Tailwind
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

---

## Dependency Security

- Run `pnpm audit` before every release
- Dependabot alerts are reviewed within 24 hours for critical vulnerabilities
- Never install packages from unverified sources
- Lock file (`pnpm-lock.yaml`) is always committed

---

## Incident Response

If a security vulnerability is discovered:
1. Do not commit or push code that contains the vulnerability
2. Immediately revoke any exposed credentials (API keys, OAuth tokens)
3. Document the vulnerability and mitigation in a private issue
4. Deploy the fix with a patch release
5. Update the threat model if a new attack surface was identified
