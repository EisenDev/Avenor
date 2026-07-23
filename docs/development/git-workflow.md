# Git Workflow

> **Document Owner:** Development Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Branch Strategy: GitHub Flow (Simplified)

Avenor uses a simplified GitHub Flow — **not** GitFlow. GitFlow's complexity (develop, release, hotfix branches) is unnecessary overhead for our team size.

### Branch Structure

```
main                    # Production-ready code — always deployable
  └── feat/[name]       # Feature branches — short-lived
  └── fix/[name]        # Bug fix branches — short-lived
  └── docs/[name]       # Documentation-only changes
  └── chore/[name]      # Config, deps, infrastructure
  └── refactor/[name]   # Refactoring without behavior change
```

### Rules

1. **`main` is always deployable** — no broken code ever merges to main
2. **Feature branches are short-lived** — maximum 3 days from branch to merge
3. **One concern per branch** — never mix a feature with a refactor
4. **No direct commits to `main`** — all changes go through PRs
5. **Rebase before merge** — keep the commit history linear and readable

---

## Branch Naming

See [`docs/standards/naming-conventions.md`](../standards/naming-conventions.md) for the full naming table.

```bash
# Feature work
feat/application-status-filter
feat/gmail-oauth-integration
feat/ai-cover-letter-generation

# Bug fixes
fix/application-delete-cascade-issue
fix/interview-timezone-display

# Documentation
docs/api-contracts-applications
docs/update-architecture-diagrams

# Chores (config, deps, CI)
chore/upgrade-prisma-5-to-6
chore/add-github-actions-ci

# Refactoring
refactor/extract-application-repository
```

---

## Commit Message Standard

Follow [Conventional Commits](https://www.conventionalcommits.org/) v1.0.0:

```
<type>(<scope>): <short description in present tense, lowercase>

[optional body: explain WHY this change was made]

[optional footer: BREAKING CHANGE, Closes #issue]
```

### Types

| Type | Use When |
|---|---|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code change that is neither feature nor fix |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, CI |
| `perf` | Performance improvement |

### Scopes

Scopes map to domain module names or infrastructure areas:

`applications`, `interviews`, `documents`, `emails`, `calendar`, `ai`, `analytics`, `offers`, `notifications`, `salary`, `auth`, `db`, `api`, `docs`, `ci`, `docker`

### Examples

```bash
feat(applications): add status filter to application list endpoint
fix(interviews): correct UTC to local timezone conversion
docs(architecture): add module dependency graph
refactor(ai): extract provider selection to configuration module
test(applications): add unit tests for status transition validation
chore(db): add index on applications.user_id for query performance
perf(analytics): cache monthly aggregation query result for 5 minutes
```

### Commit Size

- **One logical change per commit** — if you need "and" to describe a commit, split it
- **Commits should pass tests** — never commit broken code, even on a feature branch
- **Body is optional but encouraged** for non-obvious changes

---

## Pull Request Standards

### PR Size

| Size | Lines Changed | Expected Review Time |
|---|---|---|
| Small | < 200 | < 30 minutes |
| Medium | 200–500 | 30–60 minutes |
| Large | 500–1000 | 1–2 hours |
| Too Large | > 1000 | Split the PR |

Large PRs are acceptable for initial module creation. Otherwise, split them.

### PR Title

PR titles follow the same format as commit messages:
```
feat(applications): add status filter to application list
```

### PR Description Template

```markdown
## What

[One paragraph: what does this PR change?]

## Why

[One paragraph: why is this change needed?]

## How

[Brief explanation of the approach taken]

## Testing

- [ ] Unit tests added
- [ ] Integration tests pass
- [ ] Tested manually in local environment

## Documentation Updated

- [ ] Relevant docs updated
- [ ] API contracts updated (if applicable)
- [ ] ADR created (if applicable)

## Screenshots (if UI changes)
```

---

## Merge Strategy

- **Squash and merge** for feature branches (clean history on main)
- **Merge commit** for release tags only
- **Never force push to main**

---

## Tagging and Releases

```bash
# Patch: bug fixes
v1.0.1

# Minor: new features, backward compatible
v1.1.0

# Major: breaking changes
v2.0.0
```

See [`docs/workflows/release-workflow.md`](../workflows/release-workflow.md) for the full release process.

---

## Protected Branch Rules (`main`)

Configure in GitHub Settings → Branches:
- Require PR before merging
- Require at least 1 approval (self-review OK for solo dev with 24h delay rule)
- Require status checks to pass (CI: lint, typecheck, test)
- No direct pushes
- No force pushes
