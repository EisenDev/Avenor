# Spacing System

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Philosophy

Avenor's spacing system is built on a **4px base unit**. Every spatial value in the application is a multiple of 4. This creates mathematical harmony — elements always align to a grid, even when you can't see one.

> **The rule:** If a spacing value is not a multiple of 4, it's wrong.

Spacing is the invisible architecture of the interface. Generous, consistent spacing is what separates a premium tool from a cluttered one.

---

## Base Scale

| Token | px | rem | Description |
|---|---|---|---|
| `--spacing-0` | 0px | 0 | Reset |
| `--spacing-1` | 4px | 0.25rem | Micro — icon padding, tight inline |
| `--spacing-2` | 8px | 0.5rem | XSmall — badge padding, icon-to-label |
| `--spacing-3` | 12px | 0.75rem | Small — compact button, tight list |
| `--spacing-4` | 16px | 1rem | Default — standard padding unit |
| `--spacing-5` | 20px | 1.25rem | Medium — form field gaps |
| `--spacing-6` | 24px | 1.5rem | Large — card internal padding |
| `--spacing-7` | 28px | 1.75rem | — |
| `--spacing-8` | 32px | 2rem | XLarge — section gaps |
| `--spacing-10` | 40px | 2.5rem | — |
| `--spacing-12` | 48px | 3rem | XXLarge — dashboard sections |
| `--spacing-16` | 64px | 4rem | Page section spacing |
| `--spacing-20` | 80px | 5rem | Hero / marketing spacing |
| `--spacing-24` | 96px | 6rem | Large marketing blocks |

---

## Semantic Spacing — Application

### Page Layout

```
┌─────────────────────────────────────────────────┐
│  Sidebar (220px)    │    Content Area            │
│                     │  padding: 32px (--spacing-page) │
│                     │                            │
│                     │  content...                │
│                     │                            │
└─────────────────────────────────────────────────┘
```

| Token | Value | Where |
|---|---|---|
| `--spacing-page-x` | 32px | Dashboard content left/right padding |
| `--spacing-page-y` | 32px | Dashboard content top/bottom padding |
| `--spacing-section` | 48px | Between major dashboard sections (Upcoming vs. Pipeline) |

### Card Spacing

```
┌─────────────────────────────┐
│  ← 24px padding (--spacing-card-inner) →  │
│                             │
│   Card content here         │
│                             │
└─────────────────────────────┘
     ↕ 16px gap (--spacing-card-gap) between cards
```

| Token | Value | Where |
|---|---|---|
| `--spacing-card-inner` | 24px | All internal card padding |
| `--spacing-card-gap` | 16px | Between cards in a grid |
| `--spacing-card-header-gap` | 16px | Gap between card title and content |

### Grid Layout (Dashboard)

```
Stat Cards: 4-column grid, 16px gap
   [App Count] [Interviews] [Offers] [Response Rate]

Content Grid: 2-column, 50/50 or 60/40
   [Upcoming Interviews]   [AI Assistant]
   [Application Pipeline]  [Recent Email Activity]
   [Analytics Overview — full width]
```

| Token | Value | Context |
|---|---|---|
| `--grid-gap` | 16px | Stat card grid |
| `--grid-gap-lg` | 24px | Section card grid |
| `--grid-col-sidebar` | 220px | Sidebar fixed width |

### Form Spacing

```
Label
↕ 6px
[                Input Field                ]
↕ 4px
Hint / Error text

↕ 20px (--spacing-form-gap) between fields
```

| Token | Value | Where |
|---|---|---|
| `--spacing-form-gap` | 20px | Between form fields (vertical) |
| `--spacing-label-input` | 6px | Label to input gap |
| `--spacing-input-hint` | 4px | Input to hint/error text |
| `--spacing-input-x` | 14px | Input horizontal padding |
| `--spacing-input-y` | 10px | Input vertical padding |
| `--spacing-form-section` | 32px | Between form sections |

### Button Spacing

| Token | Value | Button Size |
|---|---|---|
| `--spacing-btn-x` | 20px | Default button horizontal |
| `--spacing-btn-y` | 10px | Default button vertical |
| `--spacing-btn-x-sm` | 14px | Small button horizontal |
| `--spacing-btn-y-sm` | 6px | Small button vertical |
| `--spacing-btn-x-lg` | 28px | Large button horizontal |
| `--spacing-btn-y-lg` | 14px | Large button vertical |
| `--spacing-btn-icon-gap` | 8px | Gap between icon and button label |

### Sidebar Spacing

```
┌──────────────────┐
│  ← 16px padding  │
│  ↑ 4px item gap  │
│ [icon] Label     │ ← 36px height, 16px x-padding, 8px icon-to-label
│ [icon] Label     │
│  ↓ 4px item gap  │
└──────────────────┘
```

| Token | Value | Where |
|---|---|---|
| `--spacing-sidebar-x` | 16px | Sidebar item horizontal padding |
| `--spacing-sidebar-gap` | 4px | Gap between sidebar nav items |
| `--spacing-sidebar-section` | 24px | Between sidebar sections |
| `--spacing-sidebar-icon-label` | 10px | Icon to label gap in sidebar |

### Table Spacing

| Token | Value | Where |
|---|---|---|
| `--spacing-table-cell` | `12px 16px` | Table cell padding (v h) |
| `--spacing-table-header` | `10px 16px` | Table header cell padding |
| `--spacing-table-row-gap` | 0px | Rows are divided by border, not gap |

---

## Dashboard Layout Blueprint

The dashboard observed in the mockup follows this spatial structure:

```
┌─[Sidebar 220px]─────[Content Area: padding 32px]─────────────────┐
│                  │                                                 │
│  Logo            │  [Header: h 56px] [Search] [Bell] [Avatar]    │
│  ──────          │  ─────────────────────────────────────────────│
│  Overview        │                                                 │
│  Applications    │  Good morning, Arjay 👋              [+ Add]   │
│  Interviews      │  Here's what's happening...                     │
│  Calendar        │                                    ↕ 24px      │
│  Emails          │  [Stat][Stat][Stat][Stat]  ← 4-col, 16px gap  │
│  Documents       │                                    ↕ 32px      │
│  Analytics       │  [Upcoming 60%]      [AI Assistant 40%]        │
│  Expenses        │                                    ↕ 24px      │
│  Salary & Offers │  [Pipeline 60%]      [Email Activity 40%]     │
│  Goals           │                                    ↕ 24px      │
│  Settings        │  [Analytics Overview — full width]             │
│                  │                                                 │
└──────────────────┴─────────────────────────────────────────────┘
```

---

## Spacing Rules

- ✅ All spacing values are multiples of 4
- ✅ Use semantic tokens (`--spacing-card-inner`) over raw scale tokens inside components
- ✅ Cards always have the same internal padding
- ✅ Sections have consistent gaps
- ❌ Never use values not in the scale (e.g., 7px, 13px, 22px)
- ❌ Never use padding > 32px inside a card
- ❌ Never use arbitrary margin to create visual separation — use the gap utilities
