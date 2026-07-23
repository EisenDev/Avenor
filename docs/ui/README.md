# UI Design System — Overview

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth
> **Version:** 1.0.0

---

## What Is This?

This directory is the **complete UI Design System for Avenor**. It is the single source of truth for every visual decision made in the application. Every developer, every AI assistant, and every designer must follow these documents before building any interface.

**No component is allowed to exist that does not reference a token defined in this system.**

---

## Design Personality

Avenor's visual language is inspired by:

| Reference | What We Take From It |
|---|---|
| **Linear** | Tight information density, clean keyboard-first layout |
| **Raycast** | Purposeful motion, refined command interface |
| **Attio** | Warm data visualization, relationship-aware layouts |
| **Apple** | Whitespace as content, typographic restraint |
| **Arc Browser** | Expressive but not chaotic; structured warmth |
| **Notion** | Editorial spacing, comfortable long reading |
| **Muji / Japanese Interior** | Stillness, "less but better", function before decoration |

**What Avenor is NOT:**
- Not Bootstrap or Material Design
- Not glassmorphism or neon
- Not corporate cold blue
- Not "another AI startup"

---

## Five Design Principles

### 1. Warm & Calm
The interface should feel like a well-organized desk, not a command center. Users spend hours inside Avenor — it should feel restful, not stimulating.

### 2. Minimal & Clean
Every element earns its place. If removing something doesn't break understanding, remove it. Whitespace is not empty space — it is breathing room.

### 3. Human & Friendly
Data-dense screens are softened by warm neutrals, rounded corners, and careful typographic hierarchy. The machine serves the human.

### 4. Focused on Content
Navigation, chrome, and decoration recede. Application data — applications, interviews, offers — is always the visual center of gravity.

### 5. Consistent & Scalable
Every color, every shadow, every radius comes from a token. Change one token, update the entire product. No exceptions.

---

## Document Index

### Foundation

| Document | Purpose |
|---|---|
| [`design-tokens.md`](./design-tokens.md) | Master token registry — the single source of all values |
| [`colors.md`](./colors.md) | Full color system with usage rules |
| [`typography.md`](./typography.md) | Type scale, font choices, rationale |
| [`spacing.md`](./spacing.md) | Spacing system and page layout |
| [`radius.md`](./radius.md) | Border radius scale |
| [`borders.md`](./borders.md) | Border widths, colors, states |
| [`shadows.md`](./shadows.md) | Elevation and shadow system |
| [`icons.md`](./icons.md) | Icon library, sizes, usage rules |
| [`motion.md`](./motion.md) | Animation and transition standards |
| [`layout.md`](./layout.md) | Grid, containers, page composition |
| [`accessibility.md`](./accessibility.md) | A11y standards and requirements |
| [`design-principles.md`](./design-principles.md) | HIG-style design principles |

### Components

| Document | Components Covered |
|---|---|
| [`components/buttons.md`](./components/buttons.md) | Primary, secondary, ghost, icon, destructive |
| [`components/cards.md`](./components/cards.md) | Content cards, stat cards, metric cards |
| [`components/inputs.md`](./components/inputs.md) | Text input, textarea, select, search |
| [`components/forms.md`](./components/forms.md) | Form layout, labels, validation, fieldsets |
| [`components/sidebar.md`](./components/sidebar.md) | App sidebar navigation |
| [`components/navbar.md`](./components/navbar.md) | Top header / navigation bar |
| [`components/tables.md`](./components/tables.md) | Data tables, sorting, pagination |
| [`components/badges.md`](./components/badges.md) | Status badges, tags, labels |
| [`components/alerts.md`](./components/alerts.md) | Alert banners, inline messages |
| [`components/dialogs.md`](./components/dialogs.md) | Modals, confirmation dialogs, drawers |
| [`components/dropdowns.md`](./components/dropdowns.md) | Dropdown menus, command menus |
| [`components/avatars.md`](./components/avatars.md) | User avatars, company logos |
| [`components/charts.md`](./components/charts.md) | Line, bar, donut, progress charts |
| [`components/navigation.md`](./components/navigation.md) | Tabs, breadcrumbs, pagination |
| [`components/stat-cards.md`](./components/stat-cards.md) | Dashboard KPI cards |
| [`components/activity-feed.md`](./components/activity-feed.md) | Timeline, activity, email feed |

---

## The Token Rule

```
NEVER hardcode:
  • colors
  • spacing values
  • border radius
  • border widths
  • shadows
  • font sizes
  • font weights
  • line heights
  • animation durations
  • z-index values

ALWAYS reference a token from design-tokens.md
```

If a value you need is not in the token system, add it to `design-tokens.md` first, then use it. Never go directly to a hardcoded value.

---

## Visual Reference

The UI mockups provided show three primary screens:

1. **Landing Page** — Public marketing surface. Warm `#FAF8F5` background, hero with terracotta CTA, features grid, organic plant illustrations.

2. **Sign-Up Page** — Centered authentication card on muted background. Social auth (Google, Apple, Email) + manual form. Clean, minimal.

3. **Dashboard** — Left sidebar (fixed, 220px), top header (search + notifications + user), content area with stat cards, upcoming section, AI assistant panel, pipeline chart, email activity feed, analytics chart.

These three screens define the visual grammar for the entire application.
