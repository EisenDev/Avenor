# Stat Cards (Dashboard KPIs)

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

Stat cards display the most important career metrics at a glance. They appear in a 4-column row at the top of the dashboard and in the Analytics Overview section. They must communicate value, label, and trend instantly — within 1–2 seconds of glancing.

---

## Anatomy

```
┌────────────────────────────────┐
│                                │
│  Label                         │
│                                │
│  Value          [Icon?]        │
│                                │
│  Delta indicator               │
│                                │
└────────────────────────────────┘

Container:
  Background:   --color-card (#FFFFFF)
  Border:       1px solid --color-border (#E9E3DA)
  Radius:       --radius-xl (16px)
  Shadow:       --shadow-sm
  Padding:      20px 24px
  Height:       100px (--height-stat-card)
```

---

## Content Hierarchy

### Label (Top)
```
Font:     --font-size-xs (12px)
Weight:   --font-weight-medium (500)
Color:    --color-text-secondary (#6B7280)
Case:     Sentence case
Example:  "Applications", "Interviews", "Offers", "Response Rate"
```

### Value (Middle — Hero Number)
```
Font:     --font-size-h2 (24px) — Inter with tabular figures
Weight:   --font-weight-bold (700)
Color:    --color-text-primary (#222222)
Example:  "24", "5", "2", "68%"

Special: If value has an emoji indicator (e.g., ⭐ for Offers), it appears inline after the number:
  Number: --font-size-h2
  Emoji:  Same size, no special styling
```

### Delta Indicator (Bottom)
```
Font:     --font-size-xs (12px)
Weight:   --font-weight-medium (500)
Color:    Positive: --color-success (#6BBF71) with ↑ arrow
          Negative: --color-danger (#E07A7A) with ↓ arrow
          Neutral:  --color-text-secondary (#6B7280) → "No change"
Example:  "+12% this month", "+20% this month", "No change", "+8% this month"

Trend arrow:
  ↑   TrendingUp icon (--icon-xs, 12px), color: --color-success
  ↓   TrendingDown icon (--icon-xs, 12px), color: --color-danger
  →   Minus icon (--icon-xs, 12px), color: --color-text-secondary
```

---

## Dashboard Stat Cards (from mockup)

| Card | Value | Label | Delta |
|---|---|---|---|
| Applications | 24 | Applications | +12% this month |
| Interviews | 5 | Interviews | +20% this month |
| Offers | 2 ⭐ | Offers | No change |
| Response Rate | 68% | Response Rate | +8% this month |

---

## Analytics Section Stat Row

A second row of stat cards appears at the bottom of the dashboard inside the Analytics Overview section:

```
Same visual as dashboard stat cards but displayed inside a card section.
Uses smaller value size: --font-size-h3 (20px) instead of h2.
Grid: 4-column, same --grid-gap (16px)
```

---

## Hover State

```
Shadow:     --shadow-hover (warm terracotta tint)
Transform:  translateY(-1px)
Transition: --duration-normal (200ms), --ease-out
Cursor:     pointer (if stat card is clickable/navigates)
```

---

## Loading / Skeleton State

When data is loading, the stat card shows a skeleton:

```
Label:   Gray shimmer bar, 60px wide, 10px tall
Value:   Gray shimmer bar, 48px wide, 24px tall
Delta:   Gray shimmer bar, 80px wide, 10px tall

Shimmer animation: translateX(-100%) → translateX(100%)
Duration: 1400ms, linear, infinite
Color: --color-muted to --color-surface gradient
```

---

## Rules

- ✅ Always show delta/trend indicators — empty states are misleading
- ✅ Use Inter for numbers (tabular figures)
- ✅ All four top stat cards are identical in height and width
- ✅ Value text is always `--font-size-h2` or larger
- ❌ Never show more than one large number per stat card
- ❌ Never add icons inside the stat card that compete with the value
- ❌ Never use a stat card for non-numeric data

---

## Token Reference

| Property | Token |
|---|---|
| Background | `--color-card` |
| Border | `1px solid --color-border` |
| Radius | `--radius-xl` |
| Shadow | `--shadow-sm` |
| Shadow hover | `--shadow-hover` |
| Padding | `20px 24px` |
| Height | `--height-stat-card` |
| Label font | `--font-size-xs`, `--font-weight-medium` |
| Label color | `--color-text-secondary` |
| Value font | `--font-size-h2`, `--font-weight-bold` |
| Value color | `--color-text-primary` |
| Delta positive | `--color-success` |
| Delta negative | `--color-danger` |
| Delta neutral | `--color-text-secondary` |
| Transition | `--duration-normal`, `--ease-out` |
