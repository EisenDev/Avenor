# Scaling Strategy

> **Document Owner:** Infrastructure Team / Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active

---

## Current Architecture Scaling Limits

The modular monolith running on a single container can handle:
- ~500 concurrent users (estimated)
- ~50,000 requests/hour
- ~1M AI API calls/month (rate-limited)

These limits will not be reached in the early phase. Scaling work begins when metrics show approaching capacity, not before.

---

## Phase 1: Vertical Scaling (Current)

**Trigger:** Response time p95 > 500ms

- Increase container CPU/memory allocation
- Add PostgreSQL connection pooling (PgBouncer)
- Enable Next.js Partial Prerendering for heavily-trafficked pages
- Cache frequently-read, rarely-written data (analytics aggregations) in memory

No architectural changes needed.

---

## Phase 2: Database Optimization (Early scaling)

**Trigger:** Database query time p95 > 100ms

- Add PostgreSQL read replica for analytics queries
- Move analytics queries exclusively to the read replica
- Add Redis for session caching (Auth.js supports Redis adapter)
- Implement database-level materialized views for complex analytics aggregations

No application re-architecture needed — only infrastructure additions.

---

## Phase 3: Background Job Queue (Medium scaling)

**Trigger:** AI response time affecting UX; email sync becoming unreliable

- Add BullMQ + Redis for background job processing
- Move email sync, AI processing, and notification delivery to background jobs
- These operations are already isolated in domain modules — extraction is surgical

**Modules affected:** `emails`, `ai`, `notifications`

---

## Phase 4: Module Extraction (High scaling)

**Trigger:** AI processing consuming > 40% of container resources

The modular monolith is designed for this moment. Modules can be extracted as separate services because:
- Each module has a well-defined public API (its `index.ts`)
- Modules communicate through service interfaces, not DB joins
- The data access pattern (repository layer) is already isolated

**Extraction candidates in priority order:**
1. `ai` module → Separate AI service (highest CPU/memory, independent scaling)
2. `emails` module → Separate email ingestion service (high volume, async)
3. `analytics` module → Separate read-only analytics service (read replica + aggregations)

Extraction process:
1. Create a new service repository
2. Copy the module code
3. Replace in-process calls with HTTP API calls
4. Update the calling module to use the HTTP client
5. Deploy independently

---

## Phase 5: Full Service Mesh (Enterprise scale)

This phase is intentionally out of scope. If Avenor reaches this scale:
- Full microservices with Kubernetes
- Distributed tracing (OpenTelemetry)
- Service mesh (Istio)
- Event-driven architecture (Kafka/RabbitMQ)

This would require a significant rewrite and is not planned.

---

## What We Will NOT Do Prematurely

| Premature Optimization | Why We Avoid It |
|---|---|
| Microservices from day one | Operational overhead without user benefit |
| Redis cache everywhere | Adds complexity; most data can be fetched fresh |
| CDN for API responses | Our API is personalized per-user; CDN doesn't help |
| GraphQL | REST patterns are sufficient; GraphQL adds client complexity |
| Message queue without need | Background jobs can wait until we need them |

> "Make it work. Make it right. Make it fast." — Kent Beck
>
> We are in the "Make it work" phase. We will "Make it fast" when slowness is measured.
