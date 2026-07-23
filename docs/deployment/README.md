# Deployment & Infrastructure

> **Document Owner:** Infrastructure Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

Avenor is deployed as a Docker container. A single `docker-compose.yml` orchestrates local development. Production runs the same Docker image on a container platform (Railway, Fly.io, or AWS ECS).

The deployment philosophy: **identical environments, zero surprises**. The Docker image that runs in production is built from the same `Dockerfile` as the one tested in CI.

---

## Environment Architecture

| Environment | Purpose | DB | AI Providers |
|---|---|---|---|
| `development` | Local developer machine | Docker PostgreSQL | All providers (test keys) |
| `test` | CI pipeline | Docker PostgreSQL (ephemeral) | Mock provider |
| `staging` | Pre-production validation | Managed PostgreSQL | All providers (test keys with limits) |
| `production` | Live user traffic | Managed PostgreSQL | All providers (production keys) |

---

## Local Development Stack

```yaml
# docker-compose.yml (local dev only)
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports: ['3000:3000']
    volumes: ['.:/app', '/app/node_modules']
    environment:
      DATABASE_URL: 'postgresql://avenor:password@postgres:5432/avenor_dev'
    depends_on: [postgres]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: avenor_dev
      POSTGRES_USER: avenor
      POSTGRES_PASSWORD: password
    ports: ['5432:5432']
    volumes: ['postgres_data:/var/lib/postgresql/data']

volumes:
  postgres_data:
```

---

## Docker Image

### Production Dockerfile

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run as non-root user (security)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### Key Docker Principles

- Multi-stage build — production image contains no dev dependencies
- Non-root user — `nextjs` user, not `root`
- Alpine base — minimal attack surface
- `.dockerignore` excludes: `node_modules`, `.git`, `.env*`, `__tests__`

---

## CI/CD Pipeline

### Pull Request Checks (`.github/workflows/ci.yml`)

```
On every PR:
  1. pnpm install (cached)
  2. tsc --noEmit (TypeScript)
  3. pnpm lint (ESLint)
  4. pnpm test:unit (Vitest)
  5. pnpm test:integration (Vitest + test DB)
  6. Docker build (verify image builds)
```

### Staging Deployment (`.github/workflows/deploy-staging.yml`)

```
On merge to main:
  1. Build Docker image
  2. Push to container registry
  3. Run database migrations (prisma migrate deploy)
  4. Deploy to staging environment
  5. Run smoke tests
```

### Production Deployment (`.github/workflows/deploy-prod.yml`)

```
On release tag (v*.*.*):
  1. Build Docker image (tagged with version)
  2. Push to container registry
  3. Require manual approval
  4. Run database migrations
  5. Deploy to production (rolling update)
  6. Health check
  7. Alert on failure
```

---

## Database Migrations in Production

Migrations run **before** the new application version is deployed:

```bash
# Run during deployment, before app swap
npx prisma migrate deploy
```

**Migration safety rules:**
- Every migration must be backward-compatible with the previous app version
- Never drop columns — add `nullable` columns first, migrate data, then drop in a separate migration
- Never rename columns — add new column, copy data, update code, then drop old column
- Test migrations against a production data snapshot before deploying

---

## Environment Variables

See `docs/deployment/environments.md` for the complete variable reference.

All environment variables are validated at startup via `src/lib/env.ts`. The app crashes immediately if a required variable is missing — this prevents silent misconfiguration.

---

## Scaling Strategy

The current architecture scales vertically (larger container). Horizontal scaling is possible with:
- Session storage moved from database to Redis (Auth.js supports this)
- Stateless application server (already the case — no in-memory state)
- Database read replica for analytics queries
- Background job queue (BullMQ + Redis) for email sync and AI processing

Full scaling plan → [`scaling.md`](./scaling.md)

---

## Health Checks

```
GET /api/health
Response: { "status": "ok", "version": "1.0.0", "db": "connected" }
```

The health endpoint checks:
- Database connectivity (Prisma `$queryRaw SELECT 1`)
- App startup completion

Used by container orchestrators to determine when the app is ready to receive traffic.

---

## Monitoring (Future)

- **Error tracking:** Sentry (planned)
- **Uptime monitoring:** Better Uptime or Checkly (planned)
- **Log aggregation:** Logtail or Datadog Logs (planned)
- **APM:** Datadog APM or OpenTelemetry (planned)
