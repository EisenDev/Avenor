# Environment Variables Reference

> **Document Owner:** Infrastructure Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

All environment variables are validated at application startup via `src/lib/env.ts`. If a required variable is missing, the app throws a clear error immediately — preventing silent misconfiguration.

This document is the reference for all environment variables. The `.env.example` file is the canonical template.

---

## Variable Categories

### Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | — | `development`, `test`, or `production` |
| `NEXTAUTH_URL` | Yes | — | Full URL of the app (e.g., `http://localhost:3000`) |
| `AUTH_SECRET` | Yes | — | Secret for Auth.js session encryption (32+ char random string) |

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

### Google OAuth

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth app Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth app Client Secret |

### AI Providers

| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | Yes | Active provider: `openai`, `anthropic`, or `gemini` |
| `AI_OPENAI_API_KEY` | If using OpenAI | OpenAI API key |
| `AI_OPENAI_DEFAULT_MODEL` | No | Default: `gpt-4o-mini` |
| `AI_ANTHROPIC_API_KEY` | If using Anthropic | Anthropic API key |
| `AI_ANTHROPIC_DEFAULT_MODEL` | No | Default: `claude-3-5-haiku-20241022` |
| `AI_GEMINI_API_KEY` | If using Gemini | Google AI API key |
| `AI_GEMINI_DEFAULT_MODEL` | No | Default: `gemini-1.5-flash` |

### Feature Flags

| Variable | Required | Default | Description |
|---|---|---|---|
| `FEATURE_GMAIL_INTEGRATION` | No | `false` | Enable Gmail integration |
| `FEATURE_CALENDAR_INTEGRATION` | No | `false` | Enable Calendar integration |
| `FEATURE_AI_FEATURES` | No | `false` | Enable all AI features |

---

## Adding a New Variable

1. Add to `.env.example` with a description comment
2. Add to `src/lib/env.ts` Zod schema (with `z.string()`, `z.enum()`, etc.)
3. Update this document
4. Update Docker configurations if needed (`docker-compose.yml`, `Dockerfile`)
5. Add to CI secrets in GitHub Actions settings

**Never** add a variable to code without adding it to all of the above.

---

## Generating Secrets

```bash
# Generate AUTH_SECRET (32-byte base64 string)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
