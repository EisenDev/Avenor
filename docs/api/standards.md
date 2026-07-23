# API Standards

> **Document Owner:** Backend Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

Avenor's API follows RESTful conventions. All API endpoints are Route Handlers under `src/app/api/`. This document defines the standards every API endpoint must follow.

---

## URL Design

### Resource Naming

```
# Collections — plural noun
GET  /api/applications
POST /api/applications

# Single resource — plural noun + :id
GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id

# Nested resources — when a resource belongs to another
GET  /api/applications/:id/interviews
POST /api/applications/:id/interviews

# Actions that don't fit CRUD — use verb
POST /api/applications/:id/archive
POST /api/ai/analyze-resume
POST /api/ai/generate-cover-letter

# Always kebab-case
POST /api/cover-letters           ✅
POST /api/coverLetters            ❌
POST /api/cover_letters           ❌
```

### HTTP Methods

| Method | Use Case | Idempotent |
|---|---|---|
| `GET` | Retrieve resource(s) — never modifies state | Yes |
| `POST` | Create a new resource | No |
| `PUT` | Full replacement of a resource | Yes |
| `PATCH` | Partial update of a resource | No |
| `DELETE` | Remove a resource | Yes |

---

## Standard Response Format

### Success — Single Resource

```json
{
  "id": "clx1234",
  "company": "Acme Corp",
  "role": "Senior Engineer",
  "status": "applied",
  "appliedAt": "2026-07-13T13:00:00Z",
  "createdAt": "2026-07-13T13:00:00Z",
  "updatedAt": "2026-07-13T13:00:00Z"
}
```

### Success — Paginated List

```json
{
  "data": [
    { "id": "clx1234", "company": "Acme Corp", ... },
    { "id": "clx5678", "company": "Beta Inc", ... }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 47,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "APPLICATION_NOT_FOUND",
    "message": "Application with id \"clx1234\" not found",
    "details": {}
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | When to Use |
|---|---|---|
| `200 OK` | Success | Successful GET, PUT, PATCH |
| `201 Created` | Resource created | Successful POST that creates |
| `204 No Content` | Success, no body | Successful DELETE |
| `400 Bad Request` | Client error | Malformed request body |
| `401 Unauthorized` | Not authenticated | No or invalid session |
| `403 Forbidden` | Not authorized | Authenticated but not allowed |
| `404 Not Found` | Resource missing | Resource doesn't exist |
| `409 Conflict` | State conflict | Duplicate resource, version conflict |
| `422 Unprocessable Entity` | Validation error | Zod validation failure |
| `429 Too Many Requests` | Rate limited | Rate limit exceeded |
| `500 Internal Server Error` | Server error | Unexpected failures |

---

## Pagination

All list endpoints support cursor-based pagination via query parameters:

```
GET /api/applications?page=2&pageSize=20
```

| Param | Default | Max | Description |
|---|---|---|---|
| `page` | `1` | — | Page number |
| `pageSize` | `20` | `100` | Results per page |

The response always includes the full `pagination` object.

---

## Filtering and Sorting

```
# Filtering
GET /api/applications?status=applied
GET /api/applications?status=applied,interviewing
GET /api/applications?companyName=Acme

# Sorting
GET /api/applications?sortBy=appliedAt&sortOrder=desc

# Date range
GET /api/applications?appliedAfter=2026-01-01&appliedBefore=2026-12-31
```

Allowed `sortBy` values are explicitly whitelisted per endpoint — no user-supplied column names are passed directly to queries.

---

## Request Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type: application/json` | Required for POST/PUT/PATCH | Request body format |
| `Cookie` | Automatic | Auth.js session cookie |

---

## Versioning

There is no API versioning in the current phase. The API is internal (consumed only by the Next.js frontend). When external API access is introduced, versioning strategy will be defined in a new ADR.

---

## Rate Limiting

Rate limiting is applied at the middleware layer for:
- Authentication endpoints: 10 requests/minute
- AI endpoints: 20 requests/minute per user
- General API: 200 requests/minute per user

Rate limit responses return `429` with:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": { "retryAfter": 60 }
  }
}
```
