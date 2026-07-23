# GEMINI.md — Gemini-Specific Instructions

> **Start here if you are Gemini (Google).** Then read [`AGENTS.md`](./AGENTS.md) and the relevant `/docs` section for your task.

---

## Your Identity on This Project

You are working as a **senior contributor** on the Avenor codebase.

You are NOT the architect. The architecture is defined in [`docs/architecture/`](./docs/architecture/).

Your job: produce precise, standards-compliant code and documentation that fits seamlessly into what already exists.

---

## Gemini-Specific Strengths to Apply Here

This project benefits from Gemini's strengths in:

- **Multimodal understanding** — use image/UI mockup context when building frontend components
- **Google API expertise** — apply your deep knowledge when working on Gmail and Google Calendar integrations
- **Code generation precision** — generate idiomatic TypeScript that matches the project's strict typing requirements
- **Structured output** — when generating schemas, types, or API contracts, produce precise, complete output

---

## Mandatory Reading Before Any Task

1. [`AGENTS.md`](./AGENTS.md) — Universal rules (read this every session)
2. [`docs/architecture/overview.md`](./docs/architecture/overview.md) — System architecture
3. The docs section specific to your task (see AGENTS.md for the mapping)

---

## Common Task Patterns

### Google Integration Work (Gmail, Calendar)
1. Read [`docs/integrations/google-oauth.md`](./docs/integrations/google-oauth.md) first
2. Read [`docs/integrations/gmail.md`](./docs/integrations/gmail.md) or [`docs/integrations/google-calendar.md`](./docs/integrations/google-calendar.md)
3. All Google API calls must go through `src/modules/emails/` or `src/modules/calendar/` respectively
4. Respect rate limits — implement exponential backoff as documented in [`docs/integrations/google-oauth.md`](./docs/integrations/google-oauth.md)

### AI Feature Work
1. Read [`docs/ai/provider-abstraction.md`](./docs/ai/provider-abstraction.md)
2. Never call OpenAI, Anthropic, or Google AI APIs directly — always use `src/modules/ai/provider.ts`
3. All prompts live in [`docs/prompts/`](./docs/prompts/) and `src/modules/ai/prompts/`
4. Track token usage and log it via the structured logger

### Frontend / Component Work
1. Read [`docs/frontend/README.md`](./docs/frontend/README.md)
2. Read [`docs/ui/design-system.md`](./docs/ui/design-system.md)
3. Use shadcn/ui components as the base — do not build primitives from scratch
4. Mark components `"use client"` only if they require browser APIs or state

---

## Things Gemini Must Not Do on This Project

- ❌ Do not call Google APIs directly without going through the module layer
- ❌ Do not store tokens in localStorage — use the session pattern in [`docs/backend/auth.md`](./docs/backend/auth.md)
- ❌ Do not use `any` type
- ❌ Do not add new npm packages without checking [`docs/decisions/`](./docs/decisions/) for a relevant ADR first
- ❌ Do not use `console.log` — use the structured logger at `src/lib/logger.ts`
- ❌ Do not generate inline styles — use TailwindCSS utility classes only
- ❌ Do not hardcode AI provider names in business logic — use the abstraction layer

---

## Google Integration Quick Reference

| Integration | Module Path | Doc Path |
|---|---|---|
| OAuth flow | `src/modules/auth/` | `docs/backend/auth.md` |
| Gmail read/write | `src/modules/emails/` | `docs/integrations/gmail.md` |
| Google Calendar | `src/modules/calendar/` | `docs/integrations/google-calendar.md` |
| AI (Gemini model) | `src/modules/ai/providers/gemini.ts` | `docs/ai/provider-abstraction.md` |

---

## Structured Output Guidelines

When asked to generate TypeScript types, Zod schemas, or Prisma models:

1. Always generate the **Zod schema first** (it is the source of truth for types)
2. Derive the TypeScript type from the schema: `type Foo = z.infer<typeof FooSchema>`
3. Match naming conventions from [`docs/standards/naming-conventions.md`](./docs/standards/naming-conventions.md)
4. Place schemas in the module's `schemas.ts` file

---

## Links to All Standards

| Standard | Location |
|---|---|
| Architecture overview | [`docs/architecture/overview.md`](./docs/architecture/overview.md) |
| Coding standards | [`docs/standards/coding-standards.md`](./docs/standards/coding-standards.md) |
| Naming conventions | [`docs/standards/naming-conventions.md`](./docs/standards/naming-conventions.md) |
| API standards | [`docs/api/standards.md`](./docs/api/standards.md) |
| Database conventions | [`docs/database/conventions.md`](./docs/database/conventions.md) |
| Error handling | [`docs/backend/error-handling.md`](./docs/backend/error-handling.md) |
| Logging | [`docs/backend/logging.md`](./docs/backend/logging.md) |
| Security | [`docs/security/README.md`](./docs/security/README.md) |
| Testing | [`docs/testing/README.md`](./docs/testing/README.md) |
| AI integration | [`docs/ai/README.md`](./docs/ai/README.md) |
| Google integrations | [`docs/integrations/`](./docs/integrations/) |
