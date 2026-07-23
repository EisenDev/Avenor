# Layout System

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Page Architecture

All authenticated pages share the same shell:

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (height: 56px, sticky top, z: 300)                  │
├──────────────────────────────────────────────────────────────┤
│           │                                                  │
│  SIDEBAR  │             CONTENT AREA                        │
│  (220px)  │   padding: 32px all sides                       │
│  fixed    │                                                  │
│  left 0   │   max-width: 1400px, centered if wider          │
│  top 0    │                                                  │
│  z: 200   │                                                  │
└───────────┴─────────────────────────────────────────────────┘

Body background:    --color-bg-primary (#FAF8F5)
Content starts at: left: 220px (sidebar-width)
Content top:       56px (header-height)
```

---

## Content Area

```
Margin-left:    --sidebar-width (220px)
Padding:        --spacing-page-x (32px) horizontal
                --spacing-page-y (32px) vertical
Max-width:      --content-max-width (1400px)

On wide screens (>1620px):
  The content area is centered within its max-width.
```

---

## Dashboard Grid System

### Top Row: Stat Cards

```
Display:      grid
Columns:      repeat(4, 1fr)
Gap:          --grid-gap (16px)

Responsive:
  768–1023px: repeat(2, 1fr)
  <768px:     repeat(2, 1fr) or 1fr per card
```

### Main Content Grid

```
Display:      grid
Columns:      3fr 2fr (60% / 40%)
Gap:          --grid-gap-lg (24px)

Rows:
  Row 1: Upcoming Interviews | AI Assistant
  Row 2: Application Pipeline | Recent Email Activity
  Row 3: Analytics Overview (full width — grid-column: 1 / -1)

Responsive:
  <1024px: 1fr (single column, stacked)
```

---

## Page Templates

### Dashboard (`/dashboard`)

```
Header (sticky)
└── Content Area
    ├── Page title + subtitle + CTA button
    ├── Stat cards grid (4-col)
    ├── Main content grid (3:2)
    │   ├── Upcoming Interviews card
    │   ├── AI Assistant card
    │   ├── Application Pipeline card
    │   └── Recent Email Activity card
    └── Analytics Overview card (full width)
```

### List Page (e.g., `/applications`)

```
Header (sticky)
└── Content Area
    ├── Page title + filter bar + CTA button
    └── Data table card (full width)
```

### Detail Page (e.g., `/applications/[id]`)

```
Header (sticky)
└── Content Area
    ├── Breadcrumb + page title
    ├── Detail grid (2:1)
    │   ├── Main panel (left — primary info)
    │   └── Meta panel (right — status, dates, links)
    └── Related section (full width — timeline, emails, documents)
```

### Form / Settings Page

```
Header (sticky)
└── Content Area
    ├── Page title
    └── Form container (max-width: --container-md, 768px, centered)
```

### Auth Pages (Sign-up / Login)

```
Background:   --color-surface (#F4F1EC)
Center:       100vh flex center
└── Auth card (max-width: 480px, --radius-2xl, padding: 40px 48px)
    ├── Logo mark + "Avenor" wordmark
    ├── Title + subtitle
    ├── Social auth buttons (Google, Apple, Email)
    ├── Divider "or"
    └── Manual form fields + submit
```

### Marketing / Landing Page

```
Full-width sections:
├── Hero section (100vh or 80vh)
│   ├── Navigation header
│   ├── Eyebrow label + headline + subtitle
│   ├── CTA buttons
│   └── Preview card/modal (floating)
├── Logo strip (trust signals)
├── Features grid (2 or 3 columns)
├── Secondary CTA section
└── Footer
```

---

## Container Widths

| Token | Width | Use |
|---|---|---|
| `--container-sm` | 640px | Narrow content, focused tasks |
| `--container-md` | 768px | Forms, settings pages |
| `--container-lg` | 1024px | Standard content |
| `--content-max-width` | 1400px | Dashboard max constraint |

---

## Responsive Breakpoints

| Name | Width | Layout changes |
|---|---|---|
| Mobile | < 768px | Sidebar → drawer, single-column grid, full-width buttons |
| Tablet | 768–1023px | Sidebar → hidden (hamburger), 2-col stat cards |
| Desktop | ≥ 1024px | Full sidebar, 4-col stats, 3:2 content grid |
| Wide | ≥ 1440px | Content centered, max-width applied |

---

## Section Spacing

Between sections in the dashboard content:

```
Between major sections:  --spacing-section (48px)
Between subsections:     --spacing-8 (32px)
Between cards in grid:   --grid-gap-lg (24px)
Between stat cards:      --grid-gap (16px)
```

---

## Page Title Block

Every page has a consistent title block:

```
┌───────────────────────────────────────────────────────┐
│  [Heading 1 — page title]            [Primary Action]  │
│  [Subtitle / context — secondary color]               │
└───────────────────────────────────────────────────────┘

Title:     --font-size-h1 (32px), --font-weight-bold, --color-text-primary
Subtitle:  --font-size-body (15px), --color-text-secondary
CTA:       Primary button (right-aligned on desktop)
Block margin-bottom: --spacing-8 (32px) before first card
```

Dashboard example: "Good morning, Arjay 👋" / "Here's what's happening with your career today." / `[+ Add Application]`
