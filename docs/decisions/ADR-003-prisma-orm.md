# ADR-003: Use Prisma as the ORM

> **Document Owner:** Architecture Team
> **Date:** 2026-07-13
> **Status:** Accepted
> **Deciders:** Lead Architect

---

## Context

Avenor needs a database access strategy that is:
- Type-safe (integration with TypeScript strict mode)
- Migration-managed (reproducible schema across environments)
- Maintainable by AI assistants (clear, readable query API)
- Productive (fast to write correct queries)

The options considered were Prisma, Drizzle ORM, Knex.js, and raw SQL (pg driver).

---

## Decision

**We will use Prisma as the sole ORM. All database access goes through Prisma — no raw SQL without ADR approval.**

---

## Rationale

1. **Generated TypeScript client** — Prisma generates a fully type-safe client from the schema. No type mismatches between code and database are possible without being caught at compile time.
2. **Schema-as-code** — `prisma/schema.prisma` is the canonical database definition. Migrations are generated from it and version-controlled.
3. **AI assistant familiarity** — Prisma is widely known by all major AI coding assistants. Code generation is accurate and idiomatic.
4. **Prisma Studio** — Built-in database UI for development inspection without external tools.
5. **Repository pattern compatibility** — Prisma's API is clean enough to wrap behind repositories without friction.

---

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Drizzle ORM | Excellent type safety but smaller ecosystem; AI assistants generate less reliable code; migration workflow more complex |
| Knex.js | Query builder only, no type generation without extra tooling; essentially writing raw SQL with JavaScript syntax |
| Raw SQL (pg driver) | No type safety; SQL injection risk without discipline; no migration management built in |
| TypeORM | Decorator-based approach conflicts with functional patterns; historically buggy with TypeScript |

---

## Consequences

### Positive
- Type-safe queries without writing types manually
- Schema changes are version-controlled migrations
- Clear query API reduces learning curve

### Negative / Trade-offs
- Prisma client startup time is notable in cold-start environments (mitigated by Next.js always-on server)
- Complex queries (recursive CTEs, window functions) require Prisma's raw query escape hatch — use sparingly and document via ADR when needed
- Prisma's abstraction occasionally generates suboptimal SQL for complex joins — repository layer can optimize with `select` + `include` tuning

### Neutral
- Prisma version upgrades must be tested — migration format changes occasionally

---

## Implementation Notes

- Single Prisma client instance in `src/lib/db.ts`
- Repository pattern wraps all Prisma calls
- No `db` import allowed outside of `repository.ts` files (enforced by ESLint)
- Run `pnpm prisma generate` after every schema change

---

## Related Documents

- [`docs/database/README.md`](../database/README.md)
- [`docs/database/conventions.md`](../database/conventions.md)
- [`docs/architecture/stack.md`](../architecture/stack.md)
