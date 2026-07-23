# AI Workflow

> **Document Owner:** Development Team / AI Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

Avenor is designed for AI-assisted development. Multiple AI coding assistants (Claude, Gemini, ChatGPT, Codex) can contribute to the codebase simultaneously, each following the same documentation standards as the single source of truth.

This document describes how AI assistants fit into the development workflow.

---

## AI Assistant Entry Points

Every AI assistant starts with the same two files:

1. **`AGENTS.md`** — Universal rules applicable to all AI assistants
2. **Assistant-specific file** — `CLAUDE.md` or `GEMINI.md`

These files are lightweight. They do not duplicate documentation — they link to it.

---

## How AI Assistants Should Work

### Before Writing Any Code

1. Read `AGENTS.md`
2. Read the assistant-specific file (`CLAUDE.md` or `GEMINI.md`)
3. Read `docs/architecture/overview.md`
4. Read the domain-specific documentation for the task
5. Check `docs/decisions/` for relevant ADRs

### While Writing Code

- Generate code that matches existing patterns exactly
- Use the correct naming conventions from `docs/standards/naming-conventions.md`
- Add TypeScript types for everything
- Handle all error states
- Follow the module architecture rules

### Before Finishing

- Verify no `any` types were used
- Verify no `console.log` statements remain
- Verify cross-module imports only use `index.ts` public APIs
- Verify error handling is complete on all async operations

---

## AI Team Responsibilities

| Role | Responsibility |
|---|---|
| Claude | Primary backend code generation, service layer, documentation |
| Gemini | Google API integrations, AI feature development, TypeScript schemas |
| ChatGPT | General utilities, frontend components, documentation review |
| Codex | Auto-completion assistance (IDE integration only) |

These are recommended assignments, not hard rules. Any assistant can work in any area if it reads the relevant documentation first.

---

## Common AI Task Patterns

### Creating a New Feature

```
1. Confirm the feature has a product spec (docs/product/domains/)
2. Confirm relevant ADRs exist or create one
3. Write Zod schemas first (src/modules/[domain]/schemas.ts)
4. Derive TypeScript types
5. Implement repository methods
6. Implement service layer
7. Implement Route Handler
8. Implement React components
9. Write tests
```

### Adding to an Existing Module

```
1. Read the module's index.ts to understand the public API
2. Read the module's service.ts to understand business rules
3. Read the module's schemas.ts to understand data shapes
4. Add new functionality following the existing patterns
5. Export from index.ts if the new functionality is public
```

### Debugging an Issue

```
1. Read the error message and trace the call stack
2. Identify the responsible layer (route handler / service / repository)
3. Fix at the smallest possible scope
4. Add a test that would have caught the bug
5. Do not change unrelated code
```

---

## Documentation Drift Prevention

AI assistants are instructed to:
- Update documentation when they change behavior
- Never let code and docs become inconsistent
- Flag documentation that appears stale for human review

The rule: **if you changed how it works, you changed the documentation too**.
