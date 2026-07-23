# Development Workflow

> **Document Owner:** Development Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

This document describes the end-to-end development workflow for Avenor. Every feature, bug fix, and change follows this process.

---

## The Development Pipeline

```
1. DOCUMENTATION
   ↓
2. ARCHITECTURE (if new patterns)
   ↓
3. DATABASE DESIGN (if schema changes)
   ↓
4. API CONTRACTS (if new endpoints)
   ↓
5. UI DESIGN (if new screens)
   ↓
6. IMPLEMENTATION
   ↓
7. TESTING
   ↓
8. CODE REVIEW
   ↓
9. DEPLOYMENT
```

**No step is skipped. No step is reordered.**

The most common shortcut is starting with implementation. This is the most expensive mistake in software development. Documentation-first development prevents it.

---

## Step 1: Documentation

Before writing any code, write the documentation for the feature.

**For a new feature:**
- Update or create the product spec: `docs/product/domains/[domain].md`
- Write user stories if they don't exist
- Identify which modules are involved

**For a bug fix:**
- Document the root cause in a comment on the issue
- Identify if the bug reveals a missing standard (if yes, update the relevant standard doc)

**For a refactor:**
- Write the ADR explaining the current problem and the proposed improvement
- Get the ADR reviewed before touching code

---

## Step 2: Architecture

If the feature requires new patterns or architectural decisions:

- Check `docs/decisions/` for prior ADRs that apply
- If a new decision is needed, create an ADR: `docs/decisions/ADR-[next].md`
- Get the ADR accepted before proceeding

If the feature fits existing patterns, skip this step.

---

## Step 3: Database Design

If the feature requires schema changes:

- Draft the schema in `docs/database/schema-design.md`
- Follow conventions from `docs/database/conventions.md`
- Consider: indexes needed? migrations safe to run zero-downtime?
- Get schema design reviewed before writing Prisma schema

---

## Step 4: API Contracts

If the feature requires new API endpoints:

- Document the contract in `docs/api/contracts/[domain].md`
- Include: method, path, request shape, response shape, error responses
- Use the standard response format from `docs/api/standards.md`
- Get contract reviewed before implementing the Route Handler

---

## Step 5: UI Design

If the feature requires new screens or significant UI changes:

- Create wireframes or mockups (even rough ones)
- Identify which shadcn/ui components will be used
- Document component hierarchy
- Get design reviewed before building

---

## Step 6: Implementation

With documentation complete, implement in this order:

1. **Prisma schema** (if DB changes) → Run migration
2. **Module types** (`types.ts`, `schemas.ts`) → The source of truth for the module
3. **Repository** (`repository.ts`) → Data access layer
4. **Service** (`service.ts`) → Business logic
5. **Route Handler** (`src/app/api/[domain]/route.ts`) → HTTP interface
6. **Server Component** (page) → Data fetching
7. **Client Components** (interactive UI) → Only what requires client

Each layer is tested before moving to the next.

---

## Step 7: Testing

- Write unit tests for the service layer
- Write integration tests for the Route Handler
- Write E2E tests for critical user flows
- All tests must pass before opening a PR

See `docs/testing/README.md` for full testing strategy.

---

## Step 8: Code Review

Every PR requires review. Checklist:

**Documentation**
- [ ] Relevant docs updated (API contracts, schema docs, ADRs if applicable)
- [ ] `.env.example` updated if new env vars added

**Code Quality**
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No ESLint errors
- [ ] No `any` types introduced
- [ ] No `console.log` statements
- [ ] All new functions have explicit return types

**Testing**
- [ ] New functionality has unit tests
- [ ] All existing tests pass
- [ ] Edge cases handled

**Security**
- [ ] No secrets in code
- [ ] All input validated with Zod
- [ ] Auth check on new protected endpoints

**Architecture**
- [ ] No cross-module internal imports
- [ ] Business logic in service layer (not Route Handler or component)
- [ ] No new patterns introduced without ADR

---

## Step 9: Deployment

- Merge to `main` triggers staging deployment
- Manual approval required for production
- Database migrations run before app deployment
- Zero-downtime deployment strategy (see `docs/deployment/README.md`)

---

## Git Workflow

See [`git-workflow.md`](./git-workflow.md) for:
- Branch naming conventions
- Commit message format
- PR size guidelines
- Merge strategy
