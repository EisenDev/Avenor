# Color System

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Philosophy

Avenor's color palette is built to feel **warm, calm, and professional**. Users will look at this interface for hours during a stressful job search. The palette is intentionally designed to reduce anxiety, not amplify it.

> **The palette avoids:** corporate blue, high saturation, cold grays, neon accents, and purple-heavy AI aesthetics.
>
> **The palette delivers:** warm terracotta for brand energy, sage for positive momentum, soft amber for attention, and a rich warm neutral foundation that never tires the eye.

---

## Color Scales — Exact Values

### Neutral Layer

These form the environmental foundation of every screen.

```
bg-primary   #FAF8F5   ← Page background — warm white with a hint of bone
surface      #F4F1EC   ← Sidebar, section bg — slightly deeper warm neutral
card         #FFFFFF   ← Pure white cards sit above bg-primary with clarity
border       #E9E3DA   ← Hairline borders — barely visible, warm not gray
muted        #F0ECE6   ← Muted fills, disabled fields, skeleton loaders
```

**Visual hierarchy of the neutral layer:**
```
#FAF8F5  Page bg
  └── #F4F1EC  Sidebar / section bg (slightly darker)
        └── #FFFFFF  Cards (lightest, float above)
              └── #E9E3DA  Card borders (subtle definition)
```

### Text Layer

```
text-primary    #222222   ← Near-black — primary labels, headings
text-secondary  #6B7280   ← Cool gray — metadata, timestamps, secondary labels
text-disabled   #B0ABA4   ← Warm disabled text
text-inverse    #FFFFFF   ← On primary / dark backgrounds
```

### Brand / Semantic Layer

```
primary         #B56A45   ← Terracotta — CTAs, active nav, brand
primary-hover   #9F5A39   ← Darker on hover (shift −15 lightness)
primary-active  #8A4C30   ← Pressed state
primary-subtle  #FAF0EB   ← Tint for highlighted backgrounds
primary-muted   #EDD9CF   ← Muted for decorative borders

secondary       #7ABF73   ← Sage — progress, success states, positive numbers
secondary-hover #68A861   ← Sage hover

success         #6BBF71   ← Positive confirmation, applied/offer states
warning         #D6A25E   ← Soft amber — deadlines, attention items
danger          #E07A7A   ← Error, rejection, destructive actions
info            #6EA8D7   ← Info states, links, neutral indicators
```

---

## Tint / Subtle Variants

Every semantic color has a `subtle` variant used for backgrounds (badges, alerts, highlighted rows):

| Base | Subtle | Usage |
|---|---|---|
| `#B56A45` primary | `#FAF0EB` | Active sidebar bg, highlighted selection |
| `#7ABF73` secondary | `#EEF6EC` | Progress bar track, success row bg |
| `#6BBF71` success | `#EDF7EE` | Success alert bg |
| `#D6A25E` warning | `#FBF4E8` | Warning alert bg |
| `#E07A7A` danger | `#FCEEED` | Error alert bg, rejection row bg |
| `#6EA8D7` info | `#EBF4FB` | Info alert bg |

---

## Color Usage Rules

### Primary Color (Terracotta `#B56A45`)
**Used for:**
- Primary CTA buttons ("Get Started", "Add Application", "Create Account")
- Active sidebar navigation item indicator
- Interactive links that initiate actions
- Progress indicators
- Brand logo mark accent

**Never used for:**
- Body text
- Large background fills
- Decorative dividers
- Secondary information

### Secondary Color (Sage `#7ABF73`)
**Used for:**
- Success and positive states
- Progress bars and pipeline fills (Applied, Screened status)
- Positive delta indicators (`+12% this month`)
- "Online" status indicators

**Never used for:**
- Primary actions (this is secondary for a reason)
- Warning or neutral states

### Danger Color (`#E07A7A`)
**Used for:**
- Error messages and validation states
- Rejection application status
- Destructive action buttons
- Delete confirmations

**Never used for:**
- Warning states (use `warning`)
- General emphasis

### Warning Color (`#D6A25E`)
**Used for:**
- Deadline approaching indicators
- Items needing attention
- Warning alerts
- "Offer" status (requires decision)

### Info Color (`#6EA8D7`)
**Used for:**
- Informational messages
- Neutral data points
- External links
- "Interview" status in pipeline

---

## Application Pipeline Color Map

The pipeline visualization maps application statuses to specific colors:

| Status | Color | Token |
|---|---|---|
| Wishlist | `#B0ABA4` | `--color-text-disabled` |
| Applied | `--color-primary` | `#B56A45` |
| Screening | `--color-info` | `#6EA8D7` |
| Interviewing | `--color-secondary` | `#7ABF73` |
| Offer | `--color-warning` | `#D6A25E` |
| Accepted | `--color-success` | `#6BBF71` |
| Rejected | `--color-danger` | `#E07A7A` |
| Ghosted | `#C8BFB3` | warm neutral |
| Withdrawn | `--color-muted` | `#B0ABA4` |

---

## Dark Mode

Dark mode is planned but **not in scope for v1**. The token layer is structured to support future dark mode implementation by swapping only the color token values without touching component code.

When dark mode is introduced, all color tokens will gain a `.dark` variant resolved via `prefers-color-scheme`.

---

## Accessibility / Contrast Requirements

All text/background combinations must meet WCAG 2.1 AA minimum:

| Text | Background | Ratio | Passes |
|---|---|---|---|
| `#222222` on `#FAF8F5` | 16.1:1 | ✅ AAA |
| `#222222` on `#FFFFFF` | 18.1:1 | ✅ AAA |
| `#6B7280` on `#FAF8F5` | 4.8:1 | ✅ AA |
| `#FFFFFF` on `#B56A45` | 3.2:1 | ✅ AA Large |
| `#222222` on `#F4F1EC` | 14.8:1 | ✅ AAA |
| `#B56A45` on `#FAF8F5` | 3.5:1 | ✅ AA Large |

> **Note:** `#FFFFFF` on `#B56A45` passes AA for large text (≥18pt or 14pt bold). For small text on primary backgrounds, increase contrast by using `primary-active (#8A4C30)` as the background.
