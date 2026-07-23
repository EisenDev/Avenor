# Design System

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Superseded by modular docs below — See this file as the entry point

---

## Overview

This document is the **master entry point** for Avenor's Design System. The full system is documented across multiple files in `docs/ui/`. This file provides the summary and the links.

For the full system, read [`README.md`](./README.md).

---

## Design Identity

| Attribute | Value |
|---|---|
| **Personality** | Warm, calm, minimal, premium, editorial |
| **Primary Color** | `#B56A45` (Terracotta) |
| **Background** | `#FAF8F5` (Warm bone white) |
| **Primary Font** | Plus Jakarta Sans |
| **Icon Library** | Lucide Icons |
| **Component Base** | shadcn/ui (customized to design tokens) |
| **Chart Library** | Recharts |
| **Dark Mode** | Planned for v2 (token system ready) |

---

## Design Token Summary

All values are defined in [`design-tokens.md`](./design-tokens.md). Highlights:

| Category | Key Tokens |
|---|---|
| Colors | `--color-primary: #B56A45`, `--color-bg-primary: #FAF8F5`, `--color-surface: #F4F1EC` |
| Typography | `Plus Jakarta Sans`, body: 15px, display: 48px |
| Radius | Cards: 16px (`--radius-xl`), Buttons: 8px (`--radius-md`) |
| Shadows | Cards: `--shadow-sm`, Modals: `--shadow-xl` |
| Motion | Hover: 120ms, Panels: 300ms, all `--ease-out` entrances |
| Layout | Sidebar: 220px, Header: 56px, Page padding: 32px |

---

## Full Documentation Map

| Document | Read For |
|---|---|
| [`README.md`](./README.md) | Overview, design personality, principles |
| [`design-tokens.md`](./design-tokens.md) | **Master token registry** — every value |
| [`colors.md`](./colors.md) | Color philosophy, exact hex values, usage rules |
| [`typography.md`](./typography.md) | Font choice rationale, type scale, roles |
| [`spacing.md`](./spacing.md) | Spacing system, page/card/form layouts |
| [`radius.md`](./radius.md) | Border radius scale per component |
| [`borders.md`](./borders.md) | Border widths, colors, states |
| [`shadows.md`](./shadows.md) | Elevation system, warm shadow approach |
| [`icons.md`](./icons.md) | Lucide Icon catalog, sizes, rules |
| [`motion.md`](./motion.md) | Animation durations, easings, catalog |
| [`layout.md`](./layout.md) | Dashboard grid, page templates |
| [`accessibility.md`](./accessibility.md) | WCAG 2.1 AA, contrast, ARIA |
| [`design-principles.md`](./design-principles.md) | 10 design principles with tests |
| [`components/README.md`](./components/README.md) | Component index + shadcn/ui mapping |
| [`components/buttons.md`](./components/buttons.md) | All button variants |
| [`components/cards.md`](./components/cards.md) | All card variants |
| [`components/inputs.md`](./components/inputs.md) | All input types |
| [`components/sidebar.md`](./components/sidebar.md) | App sidebar |
| [`components/navbar.md`](./components/navbar.md) | Top header |
| [`components/badges.md`](./components/badges.md) | Status badges, pills, counts |
| [`components/stat-cards.md`](./components/stat-cards.md) | Dashboard KPI cards |
| [`components/charts.md`](./components/charts.md) | Data visualization |
| [`components/activity-feed.md`](./components/activity-feed.md) | Feed + timeline |
| [`components/dialogs.md`](./components/dialogs.md) | Modals + drawers |
| [`components/tables.md`](./components/tables.md) | Data tables |

---

## The Token Rule (Summary)

```
NEVER write:   color: #B56A45
ALWAYS write:  color: var(--color-primary)

NEVER write:   border-radius: 16px
ALWAYS write:  border-radius: var(--radius-xl)

NEVER write:   padding: 24px
ALWAYS write:  padding: var(--spacing-card-inner)
```

One change to a token in `design-tokens.md` updates the entire application.
