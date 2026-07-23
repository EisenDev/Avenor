# Frontend Standards

> **Document Owner:** Frontend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

The Avenor frontend is built within Next.js 15 App Router. It uses React Server Components by default, with Client Components used only when browser interaction is required. Styling is done exclusively with TailwindCSS. UI primitives come from shadcn/ui.

---

## Required Reading by Topic

| Topic | Document |
|---|---|
| Server vs. Client Components | [`server-components.md`](./server-components.md) |
| Data fetching patterns | [`data-fetching.md`](./data-fetching.md) |
| Form patterns | [`forms.md`](./forms.md) |
| Client Components | [`client-components.md`](./client-components.md) |
| Performance | [`performance.md`](./performance.md) |
| Design system | [`docs/ui/design-system.md`](../ui/design-system.md) |

---

## The Default: Server Components

**Every component is a Server Component unless it explicitly needs to be a Client Component.**

Server Components:
- Run on the server only
- Have no `useState`, `useEffect`, or event handlers
- Can `await` data directly
- Never need `"use client"` directive
- Reduce bundle size (their code never ships to the browser)

```tsx
// ✅ Server Component — no directive, async, direct data access
// src/app/(auth)/applications/page.tsx
import { auth } from '@/lib/auth'
import { ApplicationService } from '@/modules/applications'
import { ApplicationList } from '@/components/shared/ApplicationList'

export default async function ApplicationsPage() {
  const session = await auth()
  const applications = await ApplicationService.listByUser(session!.user.id)

  return (
    <div>
      <h1>Your Applications</h1>
      <ApplicationList applications={applications} />
    </div>
  )
}
```

---

## When to Use Client Components

Only add `"use client"` when the component requires:

| Requirement | Examples |
|---|---|
| Browser event handlers | `onClick`, `onChange`, `onSubmit` |
| React state | `useState`, `useReducer` |
| React effects | `useEffect`, `useLayoutEffect` |
| Browser APIs | `localStorage`, `window`, `navigator` |
| Real-time updates | WebSocket, polling hooks |

```tsx
// ✅ Client Component — justified with a comment
'use client'
// Requires client: interactive form with real-time validation

import { useState } from 'react'
import { useForm } from 'react-hook-form'

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const form = useForm<CreateApplicationInput>({ ... })
  ...
}
```

---

## Component Architecture

### Directory Structure

```
src/
├── app/              # Pages and layouts (mostly Server Components)
├── components/
│   ├── ui/           # shadcn/ui primitives — never modify directly
│   └── shared/       # Composite components (built from ui/ primitives)
```

### Component Naming Rules

```tsx
// ✅ PascalCase filename matching the component name
// ApplicationCard.tsx
export function ApplicationCard({ application }: ApplicationCardProps) { ... }

// ✅ Props interfaces are always [ComponentName]Props
interface ApplicationCardProps {
  application: Application
  onStatusChange?: (status: ApplicationStatus) => void
}

// ✅ Server-specific components use descriptive names
// ApplicationsPageContent.tsx — clearly a Server Component
export async function ApplicationsPageContent({ userId }: { userId: string }) { ... }
```

### Component Hierarchy Rule

```
Page (Server Component — fetches data)
  └── Feature Component (Server Component — renders domain data)
        └── Interactive Widget (Client Component — handles events)
              └── UI Primitive (shadcn/ui component)
```

Push interactivity as deep into the tree as possible. The shallower the Client Component boundary, the more of the page stays server-rendered.

---

## Styling Rules

1. **TailwindCSS only** — no inline styles, no CSS modules, no styled-components
2. **Use `cn()` utility** for conditional class merging (from `src/lib/utils.ts`)
3. **Design tokens from `tailwind.config.ts`** — never hardcode color values
4. **Responsive by default** — mobile-first design with `sm:`, `md:`, `lg:` breakpoints

```tsx
// ✅ cn() for conditional classes
import { cn } from '@/lib/utils'

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-blue-100 text-blue-700': status === 'APPLIED',
          'bg-yellow-100 text-yellow-700': status === 'INTERVIEWING',
          'bg-green-100 text-green-700': status === 'OFFERED',
          'bg-red-100 text-red-700': status === 'REJECTED',
        },
      )}
    >
      {status}
    </span>
  )
}
```

---

## Error and Loading States

Every page that fetches data must handle all three states:

```tsx
// Loading state — loading.tsx in the same directory
export default function Loading() {
  return <ApplicationListSkeleton />
}

// Error state — error.tsx in the same directory
'use client' // error.tsx must be a client component
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorDisplay error={error} onRetry={reset} />
}

// Empty state — inside the component
if (applications.length === 0) {
  return <EmptyState title="No applications yet" action="Add your first application" />
}
```

---

## Data Fetching Rule

Server Components fetch data by calling the service layer directly:

```tsx
// ✅ Direct service call in Server Component
const applications = await ApplicationService.listByUser(userId)

// ❌ Never fetch from a Route Handler inside a Server Component
const res = await fetch('/api/applications')  // Unnecessary HTTP round trip
```

Client Components use React Query for data that needs caching, background refetching, or optimistic updates. See [`data-fetching.md`](./data-fetching.md).
