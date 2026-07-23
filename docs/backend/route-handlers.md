# Route Handler Patterns

> **Document Owner:** Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## What Route Handlers Are For

Route Handlers are the HTTP interface layer. They:
- Parse and validate the incoming request
- Call the appropriate service
- Return a typed JSON response

Route Handlers are **not** for business logic. If you find yourself writing an `if` statement that is about the domain (not about HTTP), move it to the service layer.

---

## File Location

```
src/app/api/
├── applications/
│   ├── route.ts              # GET /api/applications, POST /api/applications
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE /api/applications/:id
├── ai/
│   └── generate-cover-letter/
│       └── route.ts
```

---

## Standard Route Handler Pattern

### Collection Endpoint (GET list + POST create)

```ts
// src/app/api/applications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { ApplicationService } from '@/modules/applications'
import { CreateApplicationInputSchema } from '@/modules/applications'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'

// GET /api/applications
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined
    const page = parseInt(searchParams.get('page') ?? '1', 10)

    const result = await ApplicationService.listByUser(session.user.id, { status, page })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('GET /api/applications failed', { error })
    return handleApiError(error)
  }
}

// POST /api/applications
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const input = CreateApplicationInputSchema.parse(body)

    const application = await ApplicationService.create(session.user.id, input)

    logger.info('Application created via API', { applicationId: application.id })
    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    logger.error('POST /api/applications failed', { error })
    return handleApiError(error)
  }
}
```

### Resource Endpoint (GET single + PUT + DELETE)

```ts
// src/app/api/applications/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { ApplicationService } from '@/modules/applications'
import { UpdateApplicationInputSchema } from '@/modules/applications'
import { handleApiError } from '@/lib/errors'

interface RouteParams {
  params: { id: string }
}

// GET /api/applications/:id
export async function GET(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const application = await ApplicationService.getById(params.id, session.user.id)
    return NextResponse.json(application)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/applications/:id
export async function PUT(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const input = UpdateApplicationInputSchema.parse(body)

    const updated = await ApplicationService.update(params.id, session.user.id, input)
    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/applications/:id
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await ApplicationService.delete(params.id, session.user.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## Auth Check Pattern

Every protected Route Handler must check authentication as the **first operation**:

```ts
const session = await getServerSession()
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Do not proceed past this check without a valid session.

---

## Input Validation Pattern

Always validate input with Zod **before** calling the service:

```ts
// ✅ Parse throws ZodError automatically — caught by handleApiError
const input = CreateApplicationInputSchema.parse(body)

// ✅ For optional/partial updates, use .partial()
const input = UpdateApplicationInputSchema.partial().parse(body)

// ❌ Never trust raw request body
const input = body as CreateApplicationInput // FORBIDDEN
```

---

## Response Format

Always use the standard response shapes from `docs/api/standards.md`.

```ts
// Success (single resource)
return NextResponse.json(resource, { status: 200 })

// Success (created)
return NextResponse.json(resource, { status: 201 })

// Success (no body)
return new NextResponse(null, { status: 204 })

// Paginated list
return NextResponse.json({
  data: items,
  pagination: { page, pageSize, total, totalPages },
})
```

---

## Things Route Handlers Must Never Do

- ❌ Contain `if/else` branching on business rules
- ❌ Import from Prisma directly
- ❌ Import from a module's internal files
- ❌ Call multiple service methods without error handling between them
- ❌ Return raw Prisma types (always return service-layer types)
- ❌ Log sensitive data (passwords, tokens, PII)
