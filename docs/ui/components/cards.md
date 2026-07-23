# Cards Component

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

Cards are the fundamental organizing container of the Avenor dashboard. They group related information into digestible units, floating above the warm page background on a clean white surface.

---

## Base Card Anatomy

```
┌─────────────────────────────────────────────────┐  ← --radius-xl (16px)
│  Card Header                                     │
│  ┌─ Title (H3/H4)        ─────── [Action/Badge] ┐│
│  └──────────────────────────────────────────────┘│
│  ─────────────────────── (optional divider)       │
│                                                   │
│  Card Body                                        │
│  Content lives here                               │
│                                                   │
│  Card Footer (optional)                           │
│  ─────────────────────────────────────────────── │
│  [Secondary link]                  [Action btn]  │
└─────────────────────────────────────────────────┘
     ↑ Padding: --spacing-card-inner (24px) all sides
     ↑ Background: --color-card (#FFFFFF)
     ↑ Border: 1px solid --color-border (#E9E3DA)
     ↑ Shadow: --shadow-sm
```

---

## Card Variants

### Default Content Card

Used for: Upcoming interviews, AI Assistant panel, Email Activity feed.

```
Background:   --color-card (#FFFFFF)
Border:       1px solid --color-border (#E9E3DA)
Radius:       --radius-xl (16px)
Shadow:       --shadow-sm
Padding:      --spacing-card-inner (24px)

Hover (interactive cards):
  Shadow:     --shadow-hover
  Transform:  translateY(-1px)
  Transition: --duration-normal (200ms), --ease-out
```

---

### Stat Card

Compact cards for dashboard KPIs. Four across the top of the dashboard.

```
┌──────────────────────────────┐
│  Label (xs, secondary)       │
│  Value (h2, bold, primary)   │
│  Delta (xs, success/danger)  │
└──────────────────────────────┘

Background:   --color-card (#FFFFFF)
Border:       1px solid --color-border (#E9E3DA)
Radius:       --radius-xl (16px)
Shadow:       --shadow-sm
Padding:      20px 24px
Height:       --height-stat-card (100px)
```

**Anatomy detail:**
```
Applications        ← --font-size-xs, --font-weight-medium, --color-text-secondary
24                  ← --font-size-h2, --font-weight-bold, --color-text-primary (Inter tabular)
+12% this month     ← --font-size-xs, --color-success (with ↑ arrow icon)
```

---

### Metric Card (Analytics)

Used in the Analytics Overview section with chart + metrics.

```
Header row: Metric + time period selector
Body: chart area (min 120px tall)
Footer: supporting numbers

Same visual treatment as Default Content Card.
```

---

### Application List Item (Row Card)

Used in the Upcoming Interviews list — a compact horizontal card row.

```
┌────────────────────────────────────────────────────────┐
│  [Company Logo 32px]  Company Name     Date + Time     │
│                       Role Title       +N more         │
│                                        [⋯]             │
└────────────────────────────────────────────────────────┘

Padding:      16px 0px (no left/right padding — flush with card edges)
Height:       ~64px per item
Separator:    1px solid --color-border-subtle between items
```

---

### Auth Card (Sign-Up / Login)

The centered authentication container.

```
Background:   --color-card (#FFFFFF)
Border:       1px solid --color-border (#E9E3DA)
Radius:       --radius-2xl (20px)
Shadow:       --shadow-md
Padding:      40px 48px
Max-width:    480px
Centered:     Horizontally and vertically on --color-surface bg
```

---

### AI Assistant Card

The AI panel on the dashboard — distinguished from regular cards.

```
Same base as Default Content Card
Header: "AI Assistant" label + "BETA" badge (right-aligned)
Body: AI suggestions as checklist items
Footer: "Open Assistant" button (ghost style)
```

---

## Card Header Anatomy

```
Left:  Card title (--font-size-h4 or --font-size-h3, --font-weight-semibold)
Right: Action button | Badge | Period selector | BETA tag

Header bottom padding: --spacing-4 (16px)
Divider (if used): 1px solid --color-border-subtle
```

---

## Card Grid Layouts

### 4-Column Stat Cards (Dashboard Top)
```
grid: repeat(4, 1fr)
gap: --grid-gap (16px)
```

### 2-Column Content Grid (60/40)
```
grid: 3fr 2fr
gap: --grid-gap-lg (24px)
```

### 2-Column Equal Split
```
grid: 1fr 1fr
gap: --grid-gap-lg (24px)
```

### Full Width
```
grid: 1fr
Used for: Analytics Overview, Application Pipeline (when standalone)
```

---

## States

| State | Description |
|---|---|
| Default | White card, hairline border, subtle shadow |
| Hover (interactive) | `translateY(-1px)`, warm shadow tint |
| Selected | Left border `3px solid --color-primary`, subtle bg tint |
| Loading | Replaced by skeleton shimmer |
| Empty | Empty state illustration + CTA |

---

## Empty State Pattern

When a card has no data:

```
Center-aligned vertically and horizontally:
  Icon:    --icon-2xl (32px), --color-muted
  Title:   --font-size-body, --font-weight-medium, --color-text-primary
  Body:    --font-size-sm, --color-text-secondary
  Action:  Primary or Secondary button (optional)

Example:
  📋  (FileText icon)
  "No applications yet"
  "Start tracking your job search"
  [Add Application]
```

---

## Do

- ✅ Cards always use `--spacing-card-inner` (24px) internal padding
- ✅ Card titles use `--font-weight-semibold`
- ✅ All cards have the same base border and shadow
- ✅ Empty states are always provided

## Don't

- ❌ Never nest cards inside cards
- ❌ Never use card variants interchangeably (stat cards ≠ content cards)
- ❌ Never exceed two levels of visual hierarchy inside one card
- ❌ Never use a card without defined purpose and content

---

## Token Reference

| Property | Token |
|---|---|
| Background | `--color-card` |
| Border | `1px solid --color-border` |
| Radius | `--radius-xl` |
| Shadow (default) | `--shadow-sm` |
| Shadow (hover) | `--shadow-hover` |
| Inner padding | `--spacing-card-inner` |
| Card gap | `--spacing-card-gap` |
| Title font | `--font-size-h4`, `--font-weight-semibold` |
| Body font | `--font-size-body` |
| Transition | `--duration-normal`, `--ease-out` |
