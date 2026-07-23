# Tables

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

Data tables display structured lists of applications, interviews, expenses, and offers. They must be scannable at speed, sortable, and comfortable for long sessions.

---

## Table Anatomy

```
┌─────────────────────────────────────────────────────────────┐ ← card container
│  Table Header (with title + filter/sort controls)           │
│  ─────────────────────────────────────────────────────────  │
│  COMPANY       ROLE          STATUS     DATE       ACTIONS  │ ← header row
│  ─────────────────────────────────────────────────────────  │
│  [Logo] Acme   Sr. Frontend  [Applied]  Jul 18     [⋯]     │ ← data row
│  [Logo] Stripe Full Stack    [Screened] Jul 16     [⋯]     │
│  [Logo] MSFT   Eng II        [Offer]    Jul 22     [⋯]     │
│  ─────────────────────────────────────────────────────────  │
│  Showing 1–10 of 24                        [← 1 2 3 →]     │ ← pagination
└─────────────────────────────────────────────────────────────┘
```

---

## Container

```
Background:   --color-card (#FFFFFF)
Border:       1px solid --color-border (#E9E3DA)
Radius:       --radius-lg (12px)
Shadow:       --shadow-sm
Overflow:     hidden (so rows don't break the radius)
```

---

## Table Header Row

```
Background:   --color-surface (#F4F1EC)
Border-bottom: 1px solid --color-border-strong (#D4CDBF)
Cell padding:  10px 16px (--spacing-table-header)
Font:          --font-size-xs (12px), --font-weight-semibold, uppercase
Color:         --color-text-secondary (#6B7280)
Letter-spacing: --letter-spacing-widest (0.08em)
```

---

## Data Row

```
Background:     --color-card (#FFFFFF) default
                --color-hover-bg on hover
Border-bottom:  1px solid --color-border-subtle (#F0ECE6)
Cell padding:   12px 16px (--spacing-table-cell)
Row height:     ~52px
Font:           --font-size-sm (14px), --color-text-primary

Row states:
  Hover:    background --color-hover-bg, cursor pointer (if clickable)
  Selected: background --color-active-bg, left border 2px --color-primary
  Loading:  skeleton shimmer replacing cell content
```

### Cell Content Guidelines

| Column Type | Treatment |
|---|---|
| Company name | Logo (28px, --radius-xs) + bold text |
| Role/Position | Regular text |
| Status | Badge component |
| Date | --font-size-sm, --font-size-xs, secondary color |
| Salary | Tabular figures (Inter), right-aligned |
| Progress | Mini progress bar or percentage |
| Actions | Icon button `⋯` (MoreHorizontal, 16px), visible on row hover |

---

## Sorting

Column headers that support sorting:

```
Icon:       ArrowUpDown (--icon-xs, 12px) next to label
            Sorted ascending: ArrowUp
            Sorted descending: ArrowDown
Hover:      Header cell background --color-hover-bg
Color:      Sorted column header → --color-primary (#B56A45)
```

---

## Pagination

```
Layout:     Space between row count and page controls
Row count:  "Showing 1–10 of 24" — --font-size-sm, --color-text-secondary
Controls:   [← Prev] [1] [2] [3] [Next →]

Page button:
  Default:  --font-size-sm, --color-text-secondary, ghost style
  Current:  --color-primary text, --color-primary-subtle background, --radius-sm
  Hover:    --color-hover-bg

Prev/Next:
  Icons:    ChevronLeft / ChevronRight
  Disabled: --color-text-disabled, cursor not-allowed
```

---

## Table Toolbar

Above the table, before the table card:

```
Layout:     Flex row, space between
Left:       Page title + result count
Right:      Search input + Filter button + column selector + export button

Search:     --height-input-sm (30px), 200px wide
Filter:     Secondary button with Filter icon
```

---

## Empty State (No Data)

When the table has no rows:

```
Center of table body (min-height: 200px):
  Icon:    --icon-2xl (32px), --color-muted
  Title:   --font-size-body, --font-weight-medium, primary text
  Body:    --font-size-sm, --color-text-secondary
  Action:  Primary button (optional)

Example:
  📋 "No applications yet"
  "Start adding jobs you've applied to."
  [Add Application]
```

---

## Rules

- ✅ Consistent column padding (`--spacing-table-cell`) across all rows
- ✅ Status values always displayed as badges
- ✅ Tables are always inside a card container (never raw `<table>` on background)
- ✅ Pagination is provided when more than 10 rows exist
- ✅ Sortable columns have sort indicators
- ❌ Never show more than 10 rows without pagination
- ❌ Never use small (<12px) text in table cells
- ❌ Never remove the empty state
- ❌ No nested tables

---

## Token Reference

| Property | Token |
|---|---|
| Container bg | `--color-card` |
| Container border | `1px solid --color-border` |
| Container radius | `--radius-lg` |
| Header bg | `--color-surface` |
| Header font | `--font-size-xs`, `--font-weight-semibold` |
| Header border | `--border-color-strong` |
| Row padding | `--spacing-table-cell` |
| Row hover bg | `--color-hover-bg` |
| Row separator | `1px solid --border-color-subtle` |
| Cell font | `--font-size-sm` |
| Selected border | `2px solid --color-primary` |
