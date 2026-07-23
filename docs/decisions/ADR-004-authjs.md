# ADR-004: Use Auth.js v5 for Authentication

> **Document Owner:** Architecture Team
> **Date:** 2026-07-13
> **Status:** Accepted
> **Deciders:** Lead Architect

---

## Context

Avenor requires authentication that:
- Integrates seamlessly with Next.js 15 App Router
- Supports Google OAuth (required for Gmail/Calendar access)
- Manages OAuth refresh tokens for API access on behalf of users
- Handles session lifecycle securely
- Requires minimal security infrastructure to maintain ourselves

The primary constraint: we need more than simple authentication — we need Google's OAuth tokens stored and refreshed to enable Gmail and Calendar API access.

---

## Decision

**We will use Auth.js v5 (the App Router-compatible version of NextAuth.js) with Google as the sole OAuth provider and database sessions.**

---

## Rationale

1. **Native App Router support** — Auth.js v5 was rebuilt specifically for Next.js App Router. The `auth()` function works in Server Components, Route Handlers, and middleware without wrappers.
2. **Google OAuth built-in** — The Google provider handles the OAuth flow, token exchange, and scope management out of the box.
3. **Token storage** — Auth.js stores OAuth tokens in the `accounts` table, which we extend for our refresh token management needs.
4. **Database sessions** — Server-side sessions are essential for being able to invalidate sessions immediately (account deletion, suspicious activity). JWT sessions cannot be revoked before expiry.
5. **Security defaults** — CSRF protection, secure cookie settings, and session rotation are handled by the library.

---

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Clerk | Third-party service; adds dependency on external availability; limited control over OAuth token storage for API access |
| Lucia Auth | Excellent library but more manual setup; Auth.js has better Google OAuth + token storage integration |
| Custom OAuth implementation | Security-critical code should not be written from scratch; Auth.js is battle-tested |
| Firebase Auth | Google product lock-in; no direct server-side session equivalent; token storage for API access requires custom work |

---

## Consequences

### Positive
- Minimal authentication infrastructure to maintain
- Google OAuth token lifecycle handled automatically
- App Router integration is first-class
- Database sessions enable immediate invalidation

### Negative / Trade-offs
- Auth.js v5 is still maturing — some APIs may change in minor versions
- Database sessions add latency vs. JWT (one DB lookup per request) — acceptable at current scale
- OAuth token storage customization requires understanding Auth.js internals

### Neutral
- Limited to Google OAuth for now — adding other providers later is additive

---

## Implementation Notes

- Configuration lives exclusively in `src/lib/auth.ts`
- Session type is augmented in `src/types/next-auth.d.ts`
- Middleware in `src/middleware.ts` handles route protection
- Gmail and Calendar tokens are stored in separate tables managed by the `emails` and `calendar` modules respectively (not in the Auth.js `accounts` table, to maintain module ownership)

---

## Related Documents

- [`docs/backend/auth.md`](../backend/auth.md)
- [`docs/integrations/google-oauth.md`](../integrations/google-oauth.md)
- [`docs/security/README.md`](../security/README.md)
