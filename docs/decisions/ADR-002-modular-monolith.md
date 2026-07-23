# ADR-002: Modular Monolith over Microservices

> **Document Owner:** Architecture Team
> **Date:** 2026-07-13
> **Status:** Accepted
> **Deciders:** Lead Architect

---

## Context

Avenor has multiple distinct business domains (applications, interviews, emails, AI, analytics, etc.). A naive implementation would either create a "big ball of mud" monolith or jump to microservices prematurely.

We needed an architecture that provides:
- Clear domain boundaries
- Independent development of each domain
- Simple deployment
- Ability to scale specific areas if needed in the future
- High AI assistant productivity (single codebase, full context)

---

## Decision

**We will use a Modular Monolith architecture: a single deployable unit internally organized into isolated business domain modules with strict public API boundaries.**

---

## Rationale

At Avenor's current scale (solo to small team, early product):

1. **Microservices operational cost is enormous** — service mesh, distributed tracing, inter-service authentication, eventual consistency, and independent CI/CD pipelines require significant engineering overhead that provides no user value at this stage
2. **Module boundaries already define the correct seams** — if we ever need to extract a service (e.g., the AI module), the module boundary is already the correct service boundary
3. **ACID transactions** — operations like "accept offer → update application status → send notification → log analytics event" must be atomic. In a microservices architecture, this requires distributed saga patterns. In a monolith, it is a single database transaction.
4. **AI assistant productivity** — an AI assistant with the entire codebase in context is dramatically more effective than one that must navigate service-to-service contracts
5. **Strict module boundaries** prevent the modular monolith from becoming a big ball of mud

---

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Pure microservices from day one | Massive operational overhead for zero current benefit; premature optimization |
| Big ball of mud monolith | No module boundaries leads to an unmaintainable codebase; rejected without consideration |
| Serverless functions per domain | Cold starts affect UX; local development complexity; no shared in-process state |

---

## Consequences

### Positive
- Single deployment unit (Docker)
- ACID transactions across domains
- Simple local development (one process)
- Full codebase context for AI assistants
- Easy to understand for new contributors

### Negative / Trade-offs
- Cannot scale individual domains independently (addressed in scaling strategy)
- All domains share the same tech stack (flexibility is intentionally constrained)
- A bug in one domain can affect all domains (mitigated by strict error boundaries)

### Neutral
- Module boundaries must be enforced via ESLint rules (not enforced by runtime)

---

## Implementation Notes

- Each module lives in `src/modules/[domain]/`
- Modules communicate only via `index.ts` public API exports
- ESLint rule enforces no cross-module internal imports
- Module boundaries are designed to be extractable as separate services if needed

---

## Related Documents

- [`docs/architecture/overview.md`](../architecture/overview.md)
- [`docs/architecture/modules.md`](../architecture/modules.md)
- [`docs/deployment/scaling.md`](../deployment/scaling.md)
