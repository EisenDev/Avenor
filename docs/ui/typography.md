# Typography System

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Font Choices

### Primary Font — Plus Jakarta Sans

**Chosen for Avenor because:**

Plus Jakarta Sans is a contemporary geometric sans-serif with humanist characteristics. The key attributes that make it right for Avenor:

1. **Warmth without softness** — It has personality and gentle curves that feel human, unlike cold geometric sans like Inter or DM Sans alone, but it remains crisp enough for data-dense dashboards.
2. **Editorial quality** — The letterforms sit confidently in large display settings (landing page hero) and remain readable at 13–14px in table cells.
3. **Variable weights** — Covers the weight range from 300–800, enabling expressive hierarchy without loading multiple font files.
4. **Premium association** — Used by several premium SaaS products. Signals quality without copying the Linear/Vercel aesthetic directly.

**Reference:** The landing page hero — "Your career, organized. Opportunities, **maximized.**" needs a typeface that can carry both editorial weight and calm information density.

---

### Secondary Font — Inter (Fallback / Numeric Data)

Inter is the system fallback and is used for numerical data in tables and charts where tabular figures are preferred. It ships with most systems and adds zero bundle weight as a fallback.

**Used for:** Large numeric values in stat cards, table cell numbers, chart axis labels.

---

### Monospace — JetBrains Mono

Used for: Application IDs, timestamps in developer-facing logs, code snippets, keyboard shortcut labels.

---

## Type Scale

| Role | Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| **Display** | `--font-size-display` | 48px / 3rem | 800 (extrabold) | 1.1 | −0.03em |
| **H1** | `--font-size-h1` | 32px / 2rem | 700 (bold) | 1.2 | −0.025em |
| **H2** | `--font-size-h2` | 24px / 1.5rem | 600 (semibold) | 1.3 | −0.015em |
| **H3** | `--font-size-h3` | 20px / 1.25rem | 600 (semibold) | 1.35 | −0.01em |
| **H4** | `--font-size-h4` | 17px / 1.0625rem | 500 (medium) | 1.4 | 0em |
| **Body Large** | `--font-size-body-lg` | 16px / 1rem | 400 (regular) | 1.65 | 0em |
| **Body** | `--font-size-body` | 15px / 0.9375rem | 400 (regular) | 1.5 | 0em |
| **Small** | `--font-size-sm` | 14px / 0.875rem | 400 (regular) | 1.5 | 0em |
| **XSmall** | `--font-size-xs` | 12px / 0.75rem | 400–500 | 1.4 | 0.01em |
| **XXSmall / Overline** | `--font-size-xxs` | 11px / 0.6875rem | 500–600 | 1.3 | 0.06em |

---

## Typographic Roles in the Application

### Dashboard Page Title
```
Token:   --font-size-h1 (32px)
Weight:  --font-weight-bold (700)
Color:   --color-text-primary (#222222)
Example: "Good morning, Arjay 👋"
```

### Dashboard Subtitle / Context Line
```
Token:   --font-size-body (15px)
Weight:  --font-weight-regular (400)
Color:   --color-text-secondary (#6B7280)
Example: "Here's what's happening with your career today."
```

### Section Headings (Within Dashboard Sections)
```
Token:   --font-size-h4 (17px)
Weight:  --font-weight-semibold (600)
Color:   --color-text-primary (#222222)
Example: "Upcoming", "Application Pipeline", "AI Assistant"
```

### Stat Card Value (Large Number)
```
Token:   --font-size-h2 (24px)
Weight:  --font-weight-bold (700)
Color:   --color-text-primary (#222222)
Font:    Inter (tabular figures preferred)
Example: "24", "68%", "5"
```

### Stat Card Label
```
Token:   --font-size-xs (12px)
Weight:  --font-weight-medium (500)
Color:   --color-text-secondary (#6B7280)
Example: "Applications", "Response Rate"
```

### Stat Card Delta
```
Token:   --font-size-xs (12px)
Weight:  --font-weight-medium (500)
Color:   --color-success (#6BBF71) or --color-danger (#E07A7A)
Example: "+12% this month", "No change"
```

### Sidebar Navigation Item
```
Token:   --font-size-sm (14px)
Weight:  --font-weight-medium (500)
Color:   --color-text-secondary (default), --color-text-primary (active)
```

### Table Column Header
```
Token:   --font-size-xs (12px)
Weight:  --font-weight-semibold (600)
Color:   --color-text-secondary (#6B7280)
Transform: uppercase
Letter Spacing: --letter-spacing-widest (0.08em)
```

### Table Cell
```
Token:   --font-size-sm (14px)
Weight:  --font-weight-regular (400)
Color:   --color-text-primary (#222222)
```

### Button (Default)
```
Token:   --font-size-sm (14px)
Weight:  --font-weight-semibold (600)
Letter Spacing: 0.01em
```

### Button (Small)
```
Token:   --font-size-xs (12px)
Weight:  --font-weight-semibold (600)
```

### Input Placeholder
```
Token:   --font-size-body (15px)
Weight:  --font-weight-regular (400)
Color:   --color-text-secondary with 0.6 opacity
```

### Badge / Tag Text
```
Token:   --font-size-xs (12px)
Weight:  --font-weight-medium (500)
```

### Chart Axis Labels
```
Token:   --font-size-xs (12px)
Weight:  --font-weight-regular (400)
Color:   --color-text-secondary (#6B7280)
Font:    Inter (for numeric consistency)
```

### Navigation (Top Bar)
```
Token:   --font-size-sm (14px)
Weight:  --font-weight-medium (500)
Color:   --color-text-primary (#222222)
```

### Overline / Eyebrow
```
Token:   --font-size-xxs (11px)
Weight:  --font-weight-semibold (600)
Transform: UPPERCASE
Letter Spacing: --letter-spacing-widest (0.08em)
Color:   --color-text-secondary (#6B7280)
Example: "AI-POWERED CAREER MANAGEMENT"
```

### Landing Page Display
```
Token:   --font-size-display (48px)
Weight:  --font-weight-extrabold (800)
Line Height: 1.1
Color:   --color-text-primary (#222222), accent in --color-primary
Example: "Your career, organized. Opportunities, maximized."
```

---

## Typographic Hierarchy Example

```
Page Title (H1 / 32px Bold)
  │
  ├─ Section Heading (H4 / 17px Semibold)
  │    ├─ Body text (15px Regular)
  │    └─ Secondary text (14px Regular, color-secondary)
  │
  └─ Card Title (H3 / 20px Semibold)
       ├─ Card body (15px Regular)
       └─ Metadata (12px Medium, color-secondary)
```

---

## Font Loading Strategy

1. Load **Plus Jakarta Sans** as a variable font from Google Fonts (woff2)
2. Use `font-display: swap` to prevent invisible text during load
3. Subset to Latin characters only to reduce bundle size
4. Inter is system fallback — no separate load required

```
Recommended Google Fonts URL:
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap
```

---

## Typographic Rules

- ✅ Use the defined scale — never introduce arbitrary font sizes
- ✅ Use Plus Jakarta Sans for all UI text
- ✅ Use letter spacing tokens — never arbitrary tracking values
- ✅ Numbers in cards/stats use tabular figures (`font-variant-numeric: tabular-nums`)
- ❌ Never use more than 3 font sizes in a single card
- ❌ Never mix weights more than 2 steps apart in a single line
- ❌ Never use all-caps on body text (only overlines / labels)
- ❌ Never rely on bold alone to convey hierarchy — pair with size changes
