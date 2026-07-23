# Google OAuth Integration

> **Document Owner:** Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

Avenor uses Google OAuth for two purposes:
1. **Authentication** — User sign-in via Google account
2. **API Access** — Reading Gmail and Google Calendar on behalf of the user

Both use the same OAuth 2.0 flow but request different scopes. Authentication scopes are requested at sign-in. Gmail and Calendar scopes are requested incrementally when the user connects those integrations.

---

## Prerequisites

1. Google Cloud Console project created
2. OAuth 2.0 credentials (Client ID + Client Secret) generated
3. Authorized redirect URIs configured:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://[staging-domain]/api/auth/callback/google` (staging)
   - `https://[production-domain]/api/auth/callback/google` (production)
4. Required APIs enabled in Google Cloud Console:
   - Google Identity (included by default)
   - Gmail API
   - Google Calendar API

---

## Environment Variables

```env
# .env.local
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## Scope Strategy: Incremental Authorization

Requesting all scopes at sign-in results in an intimidating consent screen and lower conversion. Avenor uses **incremental authorization** — request only what is needed, when it is needed.

| When | Scopes Requested |
|---|---|
| Initial sign-in | `openid email profile` |
| User connects Gmail | `gmail.readonly gmail.modify` |
| User connects Calendar | `calendar.events` |

This pattern requires storing the OAuth tokens incrementally and re-running the OAuth flow when new scopes are needed.

---

## Token Storage

OAuth tokens (access token + refresh token) are stored in the `accounts` table managed by Auth.js, with additional integration-specific tokens stored in the `email_connections` and `calendar_connections` tables.

**Security rules:**
- Tokens are encrypted at rest using the `AUTH_SECRET` environment variable
- Tokens are never sent to the client
- Access tokens are refreshed automatically before expiry
- Refresh tokens are rotated on use (Google's default behavior)

---

## Token Refresh Pattern

Google access tokens expire after 1 hour. The refresh pattern:

```ts
// In src/modules/emails/service.ts or src/modules/calendar/service.ts
async function getValidAccessToken(connectionId: string): Promise<string> {
  const connection = await connectionRepository.findById(connectionId)

  // Check if token is within 5 minutes of expiry
  const isExpiringSoon = connection.tokenExpiresAt <= new Date(Date.now() + 5 * 60 * 1000)

  if (!isExpiringSoon) {
    return connection.accessToken
  }

  // Refresh the token
  const refreshed = await refreshGoogleToken(connection.refreshToken)
  await connectionRepository.updateTokens(connectionId, refreshed)

  return refreshed.accessToken
}
```

---

## Rate Limits

| API | Quota |
|---|---|
| Gmail API | 250 quota units/user/second; 1,000,000,000 units/day |
| Calendar API | 500 requests/100 seconds/user |
| OAuth token refresh | No explicit limit, but excessive refreshing triggers alerts |

Implement **exponential backoff** on all Google API calls:

| Attempt | Wait |
|---|---|
| 1 | Immediate |
| 2 | 1 second |
| 3 | 4 seconds |
| 4 | 16 seconds |
| 5 | Throw `ExternalAPIError` |

---

## Testing Integration

For local development, use a real Google account with test data. Production API keys are never used locally.

For unit/integration tests, mock the Google API clients entirely — never make real API calls in the test suite.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "redirect_uri_mismatch" | Add the current URL to Authorized Redirect URIs in Google Cloud Console |
| "invalid_grant" | Refresh token expired or revoked — user must re-authenticate |
| Token refresh fails | Check `AUTH_SECRET` is set and consistent across deployments |
| Quota exceeded | Check Google Cloud Console quotas; implement request batching |
