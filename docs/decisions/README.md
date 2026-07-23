# ADR Index

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active

This index lists all Architecture Decision Records in chronological order. Every significant architectural decision must have an ADR.

---

## What Is an ADR?

An Architecture Decision Record captures a significant decision that was made about the software architecture, technology stack, or development process — including the context, reasoning, and trade-offs at the time of the decision.

ADRs are **immutable records**. When a decision changes, a new ADR is created (marked as superseding the old one). The old ADR is marked `Deprecated`. This preserves the historical context of why decisions were made.

---

## When to Create an ADR

Create an ADR when:
- Adding a new dependency or library to the project
- Changing a fundamental architectural pattern
- Choosing between multiple viable approaches
- Establishing a project-wide convention that is not obvious
- Reversing or changing a previous decision

Do NOT create an ADR for:
- Implementation details within a module
- Styling choices that follow the design system
- Bug fixes
- Routine dependency upgrades

---

## ADR Registry

| ADR | Title | Status | Date |
|---|---|---|---|
| [ADR-000](./ADR-000-template.md) | Template | Template | — |
| [ADR-001](./ADR-001-nextjs-app-router.md) | Use Next.js 15 with App Router | Accepted | 2026-07-13 |
| [ADR-002](./ADR-002-modular-monolith.md) | Modular Monolith over Microservices | Accepted | 2026-07-13 |
| [ADR-003](./ADR-003-prisma-orm.md) | Use Prisma as the ORM | Accepted | 2026-07-13 |
| [ADR-004](./ADR-004-authjs.md) | Use Auth.js v5 for Authentication | Accepted | 2026-07-13 |
| [ADR-005](./ADR-005-ai-abstraction.md) | AI Provider Abstraction Layer | Accepted | 2026-07-13 |

---

## Process for New ADRs

1. Copy `ADR-000-template.md`
2. Name it `ADR-[next number]-[short-title].md`
3. Fill in all sections — do not leave blanks
4. Set status to `Proposed`
5. Get review from at least one other person (or self-review with 24h delay for solo dev)
6. Update status to `Accepted` when approved
7. Add to the registry table above
