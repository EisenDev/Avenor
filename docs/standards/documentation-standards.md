# Documentation Standards

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Purpose

Documentation in Avenor is not supplementary — it is the **source of truth**. Code is the implementation of the documentation, not the other way around.

Every document must earn its place. If a document would not meaningfully help a new AI assistant or team member understand the system, it does not belong in `/docs`.

---

## Documentation Principles

1. **Document WHY, not WHAT** — The code already shows what. The documentation explains the reasoning, constraints, and trade-offs that shaped the decision.
2. **One source of truth** — Never duplicate documentation. Link, don't copy.
3. **Concise over comprehensive** — A dense wall of text is as useless as no documentation.
4. **Living documents** — Stale documentation is worse than no documentation. Every PR that changes behavior updates the relevant doc.
5. **AI-readable** — Write as if your primary reader is an AI assistant with limited context. Be explicit, structured, and unambiguous.

---

## Document Template

Every document in `/docs` begins with this frontmatter block:

```markdown
# [Document Title]

> **Document Owner:** [Team Name]
> **Last Updated:** [YYYY-MM-DD]
> **Status:** [Draft | Active | Deprecated]

[One-sentence purpose of this document]

---
```

**Status definitions:**
- `Draft` — Being written, not yet authoritative
- `Active` — Current source of truth, followed by all contributors
- `Deprecated` — Superseded by another document (link to replacement)

---

## Document Types and Their Standards

### Architecture Documents (`docs/architecture/`)

**Purpose:** Explain the system design — the big picture, the trade-offs, the chosen direction.

**Standard:**
- Start with "what this is" in one paragraph
- Explain the WHY before the WHAT
- Include diagrams for complex relationships
- List related ADRs for every significant decision
- Maximum 5 major sections (use sub-documents for depth)

### Standard Documents (`docs/standards/`, `docs/backend/`, `docs/frontend/`, etc.)

**Purpose:** Prescribe how to do things — concrete rules for contributors.

**Standard:**
- Lead with the rule, then explain it
- Use ✅ / ❌ code examples for every significant rule
- Keep examples minimal and focused — illustrate one concept at a time
- Group related rules under clear headers

### Architecture Decision Records (`docs/decisions/`)

**Purpose:** Record why a decision was made at a point in time.

**Standard:** Use the ADR template ([`ADR-000-template.md`](../decisions/ADR-000-template.md)) — never deviate.

### API Contracts (`docs/api/contracts/`)

**Purpose:** Define request/response shapes for every API endpoint.

**Standard:**
- OpenAPI-style structure (even though we don't generate from it)
- Include example request and example response for every endpoint
- Document all possible error responses

### Integration Guides (`docs/integrations/`)

**Purpose:** Step-by-step guides for connecting third-party services.

**Standard:**
- Prerequisites section at the top
- Step-by-step numbered list
- Configuration values and where they go (`.env.example`)
- Testing section — how to verify the integration works
- Troubleshooting section for common failures

---

## Writing Style Guide

### Tone

- Direct and technical — assume a competent audience
- Present tense — "The service validates input" not "The service will validate input"
- Active voice — "Zod validates the schema" not "The schema is validated by Zod"
- No filler phrases — "It is important to note that..." just says the thing

### Formatting

```markdown
# Level 1 — Document title only (one per document)
## Level 2 — Major sections
### Level 3 — Sub-sections
#### Level 4 — Only when necessary

**Bold** — key terms, important rules, file names
`code` — all code, file paths, variable names, commands

Tables — for comparisons, lists of options, or reference data
Code blocks — for all code examples (always specify language)
```

### Code Examples

Every code example must:
1. Be syntactically correct and runnable
2. Include the file path as a comment if relevant
3. Use ✅ / ❌ markers for good / bad examples
4. Be minimal — show only what is needed to illustrate the concept

```ts
// ✅ src/modules/applications/service.ts
// This creates an application and logs the event
export async function createApplication(
  input: CreateApplicationInput,
): Promise<Application> {
  const application = await applicationRepository.create(input)
  logger.info('Application created', { id: application.id })
  return application
}
```

---

## Maintenance Rules

### When to Update Documentation

| Event | Required Doc Update |
|---|---|
| New module added | `docs/architecture/modules.md` + module's own README |
| API endpoint added/changed | `docs/api/contracts/[domain].md` |
| Database schema changed | `docs/database/schema-design.md` |
| New environment variable | `docs/deployment/environments.md` + `.env.example` |
| New dependency added | `docs/architecture/stack.md` + an ADR |
| Architecture pattern changed | New ADR + relevant architecture doc |
| New integration added | `docs/integrations/[service].md` |

### Documentation Review Checklist (PR Requirement)

- [ ] Document has correct frontmatter (owner, date, status)
- [ ] Document follows the appropriate template for its type
- [ ] No duplicate information — links instead of copies
- [ ] Code examples are correct and use ✅/❌ markers
- [ ] Dates are current
- [ ] Links to related documents are valid

---

## Documentation Creation Order

When starting a new feature, create documentation in this order:

1. Product spec (`docs/product/domains/[domain].md`)
2. ADR if new architecture decision required (`docs/decisions/ADR-XXX.md`)
3. API contract (`docs/api/contracts/[domain].md`)
4. Database schema doc (`docs/database/schema-design.md` — update)
5. Module doc update (`docs/architecture/modules.md`)
6. Implementation begins (code follows docs)
7. Testing doc update if new patterns introduced

**Documentation is never the last step. It is always the first.**
