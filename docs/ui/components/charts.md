# Charts & Data Visualization

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Library

All charts use **Recharts**. No other chart library is permitted.

---

## Design Philosophy

Charts in Avenor should be **readable at a glance** and never decorative. The data is the hero. Chart chrome (axes, gridlines, tooltips) should recede and support, not compete.

- Use warm color palette — never use default Recharts blue
- Gridlines are barely visible (`--color-border-subtle`)
- Axis labels use `--color-text-secondary`
- Tooltips are clean white cards with `--shadow-lg`
- Animations are smooth and fast

---

## Chart Color Palette

Chart data series use the design system's semantic colors in order of use:

| Series | Color | Token | Usage |
|---|---|---|---|
| Primary series | `#B56A45` | `--color-primary` | Main trend line (applications) |
| Secondary series | `#7ABF73` | `--color-secondary` | Positive comparisons |
| Tertiary series | `#6EA8D7` | `--color-info` | Third metric |
| Quaternary series | `#D6A25E` | `--color-warning` | Fourth metric |
| Danger series | `#E07A7A` | `--color-danger` | Rejection / negative metrics |

---

## Line Chart (Analytics Overview)

Used in the dashboard Analytics section for application trends.

```
From mockup: Single terracotta line showing applications over time (Jul–Jul)
Y-axis: Count values (0%, 25%, 50%, 75%, 100%)
X-axis: Date labels (Jul 19, Jun 22, Jun 29, Jul 6, Jul 13)

Specs:
  Line stroke:      --color-primary (#B56A45)
  Stroke width:     2px
  Line type:        curved (monotone)
  Area fill:        Gradient from --color-primary-subtle to transparent (5% opacity)
  Data point:       4px circle, filled --color-primary, white stroke 2px
  Active point:     6px circle on hover

Axes:
  Stroke color:     --color-border (#E9E3DA)
  Tick color:       --color-text-secondary (#6B7280)
  Tick font:        --font-size-xs (12px), Inter
  Grid lines:       Horizontal only, 1px dashed --color-border-subtle

Tooltip:
  Background:       --color-card (#FFFFFF)
  Border:           1px solid --color-border
  Radius:           --radius-md (8px)
  Shadow:           --shadow-lg
  Padding:          10px 14px
  Font:             --font-size-sm (14px)

Animation:
  stroke-dashoffset: full → 0
  Duration:          --duration-slowest (600ms)
  Easing:            --ease-out
```

---

## Horizontal Bar Chart (Pipeline)

Used in the Application Pipeline section.

```
From mockup: Horizontal bars per status (Wishlist, Applied, Screening, etc.)
Label: Status name (left, 80px)
Bar: Horizontal fill bar (expandable width)
Count: Number at bar end (right, --font-size-sm)

Status → Color mapping: see colors.md Pipeline Color Map

Specs:
  Bar height:       8px
  Bar radius:       --radius-full (9999px)
  Bar track:        --color-muted (#F0ECE6)
  Row height:       28px (label + bar)
  Row gap:          8px

Label:
  Font:             --font-size-sm (14px), --font-weight-regular
  Color:            --color-text-secondary (#6B7280)
  Width:            72px (right-aligned text)
  Right gap:        12px

Count (right of bar):
  Font:             --font-size-sm (14px), --font-weight-semibold
  Color:            --color-text-primary (#222222)
  Width:            20px (right-aligned)

Animation:
  Width: 0 → final width
  Duration: --duration-slower (400ms)
  Easing: --ease-out
  Stagger: 40ms per row
```

---

## Donut / Circular Chart

Used for Application Progress percentage (seen in the landing page mockup modal):

```
From mockup: Circle with "68%" center text, rings showing status distribution

Size:           80px × 80px (or 120px × 120px in full page)
Stroke width:   8px
Gap between segments: 2px
Center text:    --font-size-h3 (20px), --font-weight-bold

Colors: Same as pipeline color map
```

---

## Chart Axis Conventions

```
Y-Axis:
  Position:     Left
  Tick count:   5 maximum
  Format:       Integer only (no decimals on counts)
  Percentage:   "50%" format

X-Axis:
  Date format:  "Jul 13" (short month + date)
  Month format: "Jun" (short month only)
  Tick gap:     Minimum 40px to prevent overlap

Gridlines:
  Direction:    Horizontal only (never vertical)
  Style:        1px dashed
  Color:        --color-border-subtle (#F0ECE6)
  Opacity:      0.6
```

---

## Tooltip Standard

All chart tooltips follow this format:

```
┌──────────────────────┐
│  Jul 13, 2026        │  ← Date / X value, --font-size-xs, secondary
│  ──────────────────  │  ← 1px divider
│  Applications  24    │  ← Label + value, --font-size-sm, primary
│  Interviews    5     │
└──────────────────────┘

Background:   --color-card
Border:       1px solid --color-border
Radius:       --radius-md (8px)
Shadow:       --shadow-lg
Padding:      10px 14px
```

---

## Chart Responsiveness

| Breakpoint | Behavior |
|---|---|
| ≥ 1024px | Full chart with both axes |
| 768–1023px | Compressed chart, fewer x-axis ticks |
| < 768px | Simplified sparkline or stacked layout |

---

## Rules

- ✅ Use only the defined chart color palette (terracotta first)
- ✅ All charts animate in on page load
- ✅ All charts show a tooltip on hover
- ✅ Charts respect `prefers-reduced-motion`
- ❌ Never use 3D charts
- ❌ Never show more than 5 data series in one chart
- ❌ Never use pie charts — use donut charts or horizontal bars
- ❌ Never show chart data without a label or legend
- ❌ Never start Y-axis at a non-zero value without explicit callout
