# Authentication

> **Document Owner:** Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

Avenor uses **Auth.js v5** (formerly NextAuth.js) for authentication. The single supported login method is **Google OAuth** — this is a deliberate choice because Google OAuth is also the gateway to Gmail and Google Calendar integrations.

Auth.js is configured in `src/lib/auth.ts`. Do not put auth configuration anywhere else.

---

## Auth Flow

```
User clicks "Sign in with Google"
           │
           ▼
Google OAuth consent screen
           │
           ▼
Google redirects to /api/auth/callback/google
           │
           ▼
Auth.js exchanges code for tokens
           │
           ├─ Stores session in database (sessions table)
           ├─ Stores/updates user record (users table)
           └─ Stores OAuth tokens for Gmail/Calendar access
           │
           ▼
User is redirected to /dashboard
```

---

## Session Strategy

**Database sessions** are used — not JWT sessions.

**Why database sessions over JWT:**
- Server-side invalidation (force-logout a user instantly)
- OAuth refresh tokens can be stored securely in the session record
- No client-side token storage (localStorage) vulnerabilities
- Session data can be extended without re-authentication

---

## Google OAuth Scopes

The OAuth consent requests the following scopes:

| Scope | Purpose |
|---|---|
| `openid` | Base authentication |
| `email` | User identity |
| `profile` | User display name and avatar |
| `https://www.googleapis.com/auth/gmail.readonly` | Read emails for classification |
| `https://www.googleapis.com/auth/gmail.modify` | Mark emails as read, add labels |
| `https://www.googleapis.com/auth/calendar.events` | Create and read calendar events |

Scopes are requested incrementally — Gmail and Calendar scopes are requested only when the user explicitly connects those integrations, not at initial sign-in.

---

## Accessing the Session

### In Server Components (direct)

```ts
// src/app/(auth)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // session.user.id is always available and typed
  const applications = await ApplicationService.listByUser(session.user.id)
  ...
}
```

### In Route Handlers

```ts
// src/app/api/applications/route.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  ...
}
```

### In Middleware (route protection)

```ts
// src/middleware.ts
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')
  const isPublicPage = req.nextUrl.pathname.startsWith('/(marketing)')

  if (!isAuthenticated && !isAuthPage && !isPublicPage) {
    return Response.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Auth.js Type Augmentation

The session type must be extended to include the user `id` and OAuth tokens:

```ts
// src/types/next-auth.d.ts
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      hasGmailAccess: boolean
      hasCalendarAccess: boolean
    }
  }
}
```

---

## Storing OAuth Tokens

Gmail and Calendar access tokens must be stored securely for background operations (email sync, calendar sync). These tokens are:

- Stored in the database, encrypted at rest
- Never sent to the client
- Refreshed automatically using the refresh token
- Revocable per integration (user can disconnect Gmail without disconnecting Calendar)

The token refresh logic lives in `src/modules/emails/` and `src/modules/calendar/` respectively.

---

## Security Rules

- Never store tokens in `localStorage` or `sessionStorage`
- Never expose OAuth tokens in API responses
- Always validate the session user owns the resource being accessed
- Force session invalidation on account deletion
- Log auth failures (wrong scope, expired token) at `warn` level

Full security standards → [`docs/security/README.md`](../security/README.md)
