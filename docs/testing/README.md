# Testing Strategy

> **Document Owner:** QA Team / Development Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Testing Philosophy

Tests in Avenor are **investments, not overhead**. They are written to:
1. Catch regressions before they reach production
2. Document expected behavior
3. Enable confident refactoring
4. Serve as executable specifications

**Testing mindset:** Test behavior, not implementation. If you can refactor without touching tests, your tests are good.

---

## Testing Pyramid

```
        ╱╲
       ╱E2E╲          Few — critical user flows only
      ╱──────╲
     ╱Integr. ╲       Some — API contracts, DB operations
    ╱────────── ╲
   ╱  Unit Tests  ╲   Many — service layer, utilities, schemas
  ╱────────────────╲
```

| Layer | What to Test | Tool | Target Coverage |
|---|---|---|---|
| Unit | Service layer logic, schemas, utilities | Vitest | 80%+ |
| Integration | Route Handlers, repository layer | Vitest + test DB | Key paths |
| E2E | Critical user flows | Playwright | Core journeys |

---

## Unit Testing

### What to Unit Test

- Service layer functions (business logic)
- Zod schema validation
- Utility functions in `src/lib/`
- Error class behavior
- Pure calculation functions (analytics, salary calculations)

### What Not to Unit Test

- Prisma repository layer (test with integration tests against a real DB)
- React components (test with E2E)
- Route Handlers (test with integration tests)

### Testing Tool: Vitest

Vitest is used for unit and integration tests. It is configured in `vitest.config.ts`.

```ts
// src/modules/applications/__tests__/service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApplicationService } from '../service'
import { ApplicationNotFoundError } from '../errors'

// Mock the repository — unit tests don't touch the database
vi.mock('../repository', () => ({
  applicationRepository: {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('ApplicationService', () => {
  describe('getById', () => {
    it('should return application when found and owned by user', async () => {
      // Arrange
      const mockApp = { id: 'app-1', userId: 'user-1', company: 'Acme', ... }
      vi.mocked(applicationRepository.findById).mockResolvedValue(mockApp)

      // Act
      const result = await ApplicationService.getById('app-1', 'user-1')

      // Assert
      expect(result).toEqual(mockApp)
    })

    it('should throw ApplicationNotFoundError when not found', async () => {
      // Arrange
      vi.mocked(applicationRepository.findById).mockResolvedValue(null)

      // Act & Assert
      await expect(
        ApplicationService.getById('missing-id', 'user-1'),
      ).rejects.toThrow(ApplicationNotFoundError)
    })

    it('should throw AuthorizationError when user does not own the application', async () => {
      // Arrange — owned by different user
      const mockApp = { id: 'app-1', userId: 'other-user', ... }
      vi.mocked(applicationRepository.findById).mockResolvedValue(mockApp)

      // Act & Assert
      await expect(
        ApplicationService.getById('app-1', 'user-1'),
      ).rejects.toThrow(AuthorizationError)
    })
  })
})
```

### AAA Pattern

All tests follow **Arrange, Act, Assert**:

```ts
it('should do X when Y', async () => {
  // Arrange — set up state and mocks
  const input = { ... }
  mockRepository.findById.mockResolvedValue(existingRecord)

  // Act — call the thing being tested
  const result = await service.doSomething(input)

  // Assert — verify the outcome
  expect(result.status).toBe('expected')
  expect(mockRepository.update).toHaveBeenCalledWith(expect.objectContaining({ id: input.id }))
})
```

---

## Integration Testing

### What to Integration Test

- Route Handlers (full request → response cycle)
- Repository layer (real database queries)
- Auth middleware behavior

### Integration Test Setup

Integration tests run against a real PostgreSQL test database (not the development database):

```ts
// vitest.config.ts — integration test config
export default defineConfig({
  test: {
    include: ['**/*.integration.test.ts'],
    globalSetup: './tests/setup/global-setup.ts',    // Start test DB
    setup: './tests/setup/setup.ts',                  // Clear DB between tests
  },
})
```

---

## E2E Testing

### What to E2E Test

Only critical user flows — those that would cause major business impact if broken:

1. Sign in with Google → Dashboard loads
2. Create an application → Appears in list
3. Update application status → Status reflected everywhere
4. Add an interview → Interview appears on timeline
5. Connect Gmail → Email sync starts

### E2E Testing Tool: Playwright

```ts
// tests/e2e/applications.spec.ts
import { test, expect } from '@playwright/test'

test('user can create and view an application', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('[data-testid="add-application-btn"]')
  await page.fill('[data-testid="company-input"]', 'Test Corp')
  await page.fill('[data-testid="role-input"]', 'Senior Engineer')
  await page.click('[data-testid="submit-btn"]')

  await expect(page.getByText('Test Corp')).toBeVisible()
  await expect(page.getByText('Senior Engineer')).toBeVisible()
})
```

### Test IDs

All interactive elements have `data-testid` attributes for E2E targeting:

```tsx
// ✅ Always add data-testid to interactive elements
<Button data-testid="add-application-btn">Add Application</Button>
<Input data-testid="company-input" ... />
```

---

## Test Coverage Requirements

| Module | Minimum Coverage |
|---|---|
| `src/modules/*/service.ts` | 85% |
| `src/lib/errors.ts` | 90% |
| `src/lib/env.ts` | 100% |
| `src/modules/*/schemas.ts` | 100% |
| `src/modules/*/repository.ts` | 60% (integration tests) |
| Route Handlers | Key paths via integration tests |

Coverage is checked in CI. PRs that drop coverage below thresholds are blocked.

---

## Mocking Rules

- **Mock at the boundary** — mock the repository (not the DB), mock the AI provider (not the SDK)
- **Never mock the module under test**
- **AI tests always use the mock provider** — never call real AI APIs in tests
- **Time-sensitive tests use `vi.setSystemTime()`** — never rely on actual time

---

## CI Test Execution

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - run: pnpm run typecheck          # TypeScript check
      - run: pnpm run lint               # ESLint
      - run: pnpm run test:unit          # Vitest unit tests
      - run: pnpm run test:integration   # Vitest integration tests
      - run: pnpm run test:e2e           # Playwright E2E tests
```

All checks must pass before a PR can be merged.
