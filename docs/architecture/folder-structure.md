# Repository Folder Structure

> **Document Owner:** Architecture Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

This document defines the canonical repository layout. Every file and directory has a defined purpose. Do not create directories or files outside this structure without updating this document and creating an ADR if the change affects architecture.

---

## Root Layout

```
avenor/
│
├── .github/                    # GitHub configuration
│   ├── workflows/              # GitHub Actions CI/CD pipelines
│   │   ├── ci.yml              # Lint, typecheck, test on every PR
│   │   ├── deploy-staging.yml  # Deploy to staging on merge to main
│   │   └── deploy-prod.yml     # Deploy to production on release tag
│   ├── ISSUE_TEMPLATE/         # GitHub issue templates
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docker/                     # Docker configuration
│   ├── Dockerfile              # Production image
│   ├── Dockerfile.dev          # Development image
│   └── nginx/                  # Nginx reverse proxy config (if used)
│
├── docs/                       # All documentation (source of truth)
│   └── [see Documentation Structure below]
│
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Prisma schema (canonical DB definition)
│   ├── migrations/             # Auto-generated migration files
│   └── seed.ts                 # Development seed data
│
├── public/                     # Static assets (served at /)
│   ├── icons/                  # App icons
│   ├── images/                 # Static images
│   └── fonts/                  # Self-hosted fonts (if any)
│
├── scripts/                    # Utility scripts (not application code)
│   ├── setup.sh                # Local environment setup script
│   ├── seed-dev.ts             # Run development seed
│   └── generate-types.ts       # Type generation utilities
│
├── src/                        # Application source code
│   └── [see Source Structure below]
│
├── .env.example                # Example environment variables (committed)
├── .env.local                  # Local environment variables (gitignored)
├── .eslintrc.json              # ESLint configuration
├── .gitignore
├── .prettierrc                 # Prettier configuration
├── AGENTS.md                   # Universal AI assistant instructions
├── CLAUDE.md                   # Claude-specific instructions
├── GEMINI.md                   # Gemini-specific instructions
├── README.md                   # Project overview and navigation
├── docker-compose.yml          # Local development services
├── docker-compose.prod.yml     # Production compose override
├── next.config.ts              # Next.js configuration
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js           # PostCSS for Tailwind
├── tailwind.config.ts          # TailwindCSS configuration
└── tsconfig.json               # TypeScript configuration (strict mode)
```

---

## Source Structure (`src/`)

```
src/
│
├── app/                        # Next.js App Router
│   │
│   ├── (auth)/                 # Route group: authenticated pages
│   │   ├── layout.tsx          # Auth layout (sidebar, navbar)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── applications/
│   │   │   ├── page.tsx        # Application list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Application detail
│   │   │   └── new/
│   │   │       └── page.tsx    # New application form
│   │   ├── interviews/
│   │   ├── documents/
│   │   ├── analytics/
│   │   ├── offers/
│   │   ├── salary/
│   │   └── settings/
│   │
│   ├── (marketing)/            # Route group: public pages
│   │   ├── layout.tsx          # Marketing layout
│   │   ├── page.tsx            # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   │
│   ├── api/                    # API Route Handlers
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts    # Auth.js handler
│   │   ├── applications/
│   │   │   ├── route.ts        # GET /api/applications, POST /api/applications
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET/PUT/DELETE /api/applications/:id
│   │   ├── interviews/
│   │   ├── documents/
│   │   ├── emails/
│   │   ├── ai/
│   │   │   ├── analyze-resume/
│   │   │   │   └── route.ts
│   │   │   ├── generate-cover-letter/
│   │   │   │   └── route.ts
│   │   │   └── classify-email/
│   │   │       └── route.ts
│   │   ├── analytics/
│   │   ├── offers/
│   │   └── salary/
│   │
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles and CSS variables
│
├── components/                 # Shared UI components
│   │
│   ├── ui/                     # shadcn/ui primitives (do not modify directly)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── [all other shadcn components]
│   │
│   └── shared/                 # Composite components (built from ui/ primitives)
│       ├── data-table/         # Shared data table component
│       ├── page-header/        # Standard page header
│       ├── status-badge/       # Application/interview status badge
│       ├── empty-state/        # Empty state display
│       ├── error-boundary/     # React error boundary
│       ├── loading-skeleton/   # Loading state skeleton
│       └── confirm-dialog/     # Confirmation dialog
│
├── modules/                    # Business domain modules
│   │
│   ├── applications/           # Job application management
│   │   ├── index.ts            # Public API exports
│   │   ├── service.ts          # Business logic
│   │   ├── repository.ts       # Database access
│   │   ├── schemas.ts          # Zod schemas
│   │   ├── types.ts            # TypeScript types
│   │   ├── errors.ts           # Domain-specific errors
│   │   └── __tests__/
│   │
│   ├── interviews/             # Interview tracking
│   │   └── [same structure]
│   │
│   ├── documents/              # Resume and document management
│   │   └── [same structure]
│   │
│   ├── emails/                 # Gmail integration + AI classification
│   │   └── [same structure]
│   │
│   ├── calendar/               # Google Calendar integration
│   │   └── [same structure]
│   │
│   ├── ai/                     # AI provider abstraction + prompt management
│   │   ├── index.ts
│   │   ├── provider.ts         # Unified AI provider interface
│   │   ├── providers/          # Provider implementations
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   └── gemini.ts
│   │   ├── prompts/            # Prompt templates
│   │   │   ├── resume-analysis.ts
│   │   │   ├── cover-letter.ts
│   │   │   └── email-classification.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   │
│   ├── analytics/              # Career analytics and reporting
│   │   └── [same structure]
│   │
│   ├── offers/                 # Offer comparison
│   │   └── [same structure]
│   │
│   ├── notifications/          # Reminders and notifications
│   │   └── [same structure]
│   │
│   └── salary/                 # Salary and expense tracking
│       └── [same structure]
│
├── lib/                        # Shared infrastructure (not business logic)
│   ├── auth.ts                 # Auth.js configuration
│   ├── db.ts                   # Prisma client singleton
│   ├── env.ts                  # Validated environment variables (Zod)
│   ├── logger.ts               # Structured logger
│   ├── utils.ts                # Shared utility functions (cn(), etc.)
│   └── errors.ts               # Base error classes
│
├── hooks/                      # Shared React hooks (client-side only)
│   ├── use-toast.ts
│   └── use-debounce.ts
│
├── providers/                  # React context providers
│   ├── query-provider.tsx      # React Query client provider
│   ├── theme-provider.tsx      # Theme provider
│   └── session-provider.tsx    # Auth.js session provider
│
└── types/                      # Global TypeScript types
    ├── next-auth.d.ts          # Auth.js type augmentation
    └── global.d.ts             # Global type declarations
```

---

## Documentation Structure (`docs/`)

```
docs/
│
├── architecture/               # System design
│   ├── overview.md             # Architecture overview (modular monolith rationale)
│   ├── stack.md                # Technology stack with rationale
│   ├── folder-structure.md     # This document
│   ├── modules.md              # Domain module map and ownership
│   └── diagrams/               # Architecture diagrams (Mermaid/PNG)
│
├── backend/                    # Backend development standards
│   ├── README.md               # Backend team overview
│   ├── auth.md                 # Auth.js configuration and patterns
│   ├── route-handlers.md       # Next.js Route Handler patterns
│   ├── services.md             # Service layer patterns
│   ├── repositories.md         # Repository pattern guide
│   ├── error-handling.md       # Error handling strategy
│   └── logging.md              # Logging standards
│
├── frontend/                   # Frontend development standards
│   ├── README.md               # Frontend team overview
│   ├── server-components.md    # React Server Component patterns
│   ├── client-components.md    # When and how to use client components
│   ├── data-fetching.md        # Data fetching patterns
│   ├── forms.md                # React Hook Form + Zod patterns
│   └── performance.md          # Performance guidelines
│
├── database/                   # Database design and standards
│   ├── README.md               # Database team overview
│   ├── schema-design.md        # Schema design principles
│   ├── conventions.md          # Naming and modeling conventions
│   ├── migrations.md           # Migration workflow
│   └── indexing.md             # Indexing strategy
│
├── api/                        # API standards and contracts
│   ├── README.md               # API overview
│   ├── standards.md            # REST conventions and standards
│   ├── error-responses.md      # Standardized error response format
│   ├── pagination.md           # Pagination patterns
│   └── contracts/              # Domain-specific API contracts (future)
│       ├── applications.md
│       └── interviews.md
│
├── ai/                         # AI integration
│   ├── README.md               # AI team overview
│   ├── provider-abstraction.md # Provider abstraction design
│   ├── prompt-engineering.md   # Prompt writing standards
│   ├── cost-management.md      # Token usage and cost control
│   └── safety.md               # AI output safety and validation
│
├── ui/                         # Design system and UI standards
│   ├── README.md               # Design team overview
│   ├── design-system.md        # Color, typography, spacing tokens
│   ├── component-library.md    # Component usage guide
│   ├── accessibility.md        # Accessibility standards
│   └── responsive.md           # Responsive design patterns
│
├── security/                   # Security standards
│   ├── README.md               # Security overview
│   ├── authentication.md       # Auth patterns and session management
│   ├── authorization.md        # Access control patterns
│   ├── input-validation.md     # Validation and sanitization
│   ├── secrets-management.md   # Environment variable standards
│   └── threat-model.md         # Security threat model
│
├── testing/                    # Testing strategy
│   ├── README.md               # QA team overview and strategy
│   ├── unit-testing.md         # Unit test patterns
│   ├── integration-testing.md  # Integration test patterns
│   ├── e2e-testing.md          # End-to-end test patterns
│   └── test-data.md            # Test data management
│
├── deployment/                 # Infrastructure and deployment
│   ├── README.md               # Infrastructure team overview
│   ├── docker.md               # Docker setup and usage
│   ├── environments.md         # Environment configuration guide
│   ├── ci-cd.md                # CI/CD pipeline documentation
│   └── scaling.md              # Scaling strategy
│
├── development/                # Developer workflow
│   ├── README.md               # Development team overview
│   ├── workflow.md             # Development workflow (Documentation → Deploy)
│   ├── git-workflow.md         # Git branching and commit standards
│   ├── local-setup.md          # Local environment setup guide
│   └── code-review.md          # Code review checklist and process
│
├── decisions/                  # Architecture Decision Records
│   ├── README.md               # ADR index and process
│   ├── ADR-000-template.md     # ADR template
│   ├── ADR-001-nextjs-app-router.md
│   ├── ADR-002-modular-monolith.md
│   ├── ADR-003-prisma-orm.md
│   ├── ADR-004-authjs.md
│   └── ADR-005-ai-abstraction.md
│
├── integrations/               # Third-party integration guides
│   ├── README.md               # Integrations overview
│   ├── google-oauth.md         # Google OAuth setup and scopes
│   ├── gmail.md                # Gmail API integration
│   └── google-calendar.md      # Google Calendar API integration
│
├── product/                    # Product specifications
│   ├── README.md               # Product overview
│   ├── roadmap.md              # Feature roadmap
│   ├── domains/                # Domain-specific product specs
│   │   ├── applications.md
│   │   ├── interviews.md
│   │   ├── documents.md
│   │   ├── emails.md
│   │   ├── analytics.md
│   │   ├── offers.md
│   │   └── salary.md
│   └── user-stories/           # User story library
│
├── workflows/                  # Cross-cutting workflow documentation
│   ├── ai-workflow.md          # AI-assisted development workflow
│   ├── feature-workflow.md     # Feature development lifecycle
│   └── release-workflow.md     # Release process
│
├── standards/                  # Coding and documentation standards
│   ├── coding-standards.md     # TypeScript, React, and general standards
│   ├── naming-conventions.md   # File, variable, and database naming
│   └── documentation-standards.md # How to write docs for this project
│
└── prompts/                    # AI prompt library
    ├── README.md               # Prompt management guide
    ├── resume-analysis.md      # Resume analysis prompts
    ├── cover-letter.md         # Cover letter generation prompts
    └── email-classification.md # Email classification prompts
```

---

## Key Rules

1. **No orphaned files** — every file belongs to a defined category in this structure
2. **No `utils/` dumping ground** — utility functions belong to a specific module or `src/lib/`
3. **No `helpers/` directory** — same rule as `utils/`
4. **Test files live next to their source** — `__tests__/` directories inside each module
5. **No top-level `pages/` directory** — App Router only (`src/app/`)
6. **Docs update with code** — every PR that changes architecture updates the relevant doc
