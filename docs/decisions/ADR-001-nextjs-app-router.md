# ADR-001: Use Next.js 15 with App Router

> **Document Owner:** Architecture Team
> **Date:** 2026-07-13
> **Status:** Accepted
> **Deciders:** Lead Architect

---

## Context

Avenor is a full-stack web application that requires:
- Server-side rendering for SEO (marketing pages)
- Authenticated, data-heavy dashboard pages
- API endpoints for form submissions and external webhooks
- Real-time-like UI updates (interview status, email sync)
- AI streaming responses (cover letter generation)

We needed to choose between building a separate frontend (e.g., Vite/React SPA) + backend (Express/Fastify), or using a full-stack framework. We also needed to decide between Next.js Pages Router and App Router.

---

## Decision

**We will use Next.js 15 with the App Router as our full-stack framework.**

---

## Rationale

Next.js App Router with React Server Components is the correct fit because:

1. **Single codebase** eliminates API boundary boilerplate between frontend and backend for internal operations
2. **React Server Components** allow data fetching at the component level without client-side state management overhead — critical for data-heavy pages like the application dashboard
3. **Route Handlers** replace a separate Express server for all API needs
4. **Streaming support** is essential for AI-generated content (cover letters, resume analysis)
5. **Built-in optimization** (image, font, script) reduces performance engineering effort
6. **App Router** is the future direction of Next.js — Pages Router is in maintenance mode

---

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Vite (React SPA) + Express API | Two separate codebases to maintain; no SSR without extra setup; network boundary between frontend and backend for every data operation |
| Next.js Pages Router | Maintenance mode; no React Server Components; weaker caching model; won't receive new features |
| Remix | Excellent framework but smaller ecosystem; fewer AI assistant training examples; shadcn/ui integration less mature |
| SvelteKit | Strong framework but TypeScript ecosystem and AI code generation less mature than React/Next.js |

---

## Consequences

### Positive
- Single deployment unit (Vercel or Docker)
- React Server Components eliminate most client-state management complexity
- AI streaming responses built-in
- Shared TypeScript types between frontend and backend

### Negative / Trade-offs
- App Router mental model (Server vs. Client Components, caching) requires discipline
- Caching in Next.js 15 is opt-in and requires explicit configuration
- Larger initial bundle vs. a pure API approach

### Neutral
- Locks us into React ecosystem for the foreseeable future

---

## Implementation Notes

- Use `src/` directory structure
- Route groups `(auth)` and `(marketing)` for layout separation
- All data fetching in Server Components uses direct service layer calls — never fetch from Route Handlers within RSC
- Client Components are additive: use only when browser APIs, event handlers, or React state are needed

---

## Related Documents

- [`docs/architecture/overview.md`](../architecture/overview.md)
- [`docs/architecture/stack.md`](../architecture/stack.md)
- [`docs/frontend/server-components.md`](../frontend/server-components.md)
