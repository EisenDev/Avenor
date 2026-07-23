# Iconography

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Icon Library — Lucide

All icons in Avenor use **Lucide Icons** exclusively. No other icon library is permitted.

**Why Lucide:**
- Clean, consistent 24px grid with 1.5px stroke
- Perfectly matches the warm-minimal aesthetic
- Covers all required categories (navigation, status, action, data)
- Ships as React components — tree-shakeable
- Accessible by default (SVG with ARIA support)

---

## Icon Size Tokens

| Token | Size | Usage |
|---|---|---|
| `--icon-xs` | 12px | Inline text embellishments, tiny status dots |
| `--icon-sm` | 14px | Badge icons, table row action icons |
| `--icon-md` | 16px | **Primary icon size** — sidebar nav, buttons, inputs |
| `--icon-lg` | 20px | Section headers, large buttons, prominent actions |
| `--icon-xl` | 24px | Feature area icons, empty state markers |
| `--icon-2xl` | 32px | Empty state illustrations (simple icons only) |
| `--icon-3xl` | 48px | Marketing feature grid icons |

---

## Stroke Width

| Token | Value | Usage |
|---|---|---|
| `--icon-stroke` | `1.5px` | Default — all standard icons |
| `--icon-stroke-bold` | `2px` | Emphasized icons (active nav, primary actions) |

**Rule:** Sidebar active items use `--icon-stroke-bold` (2px). All other icons use `--icon-stroke` (1.5px). Never exceed 2px.

---

## Icon-to-Label Spacing

When an icon appears alongside text:

| Context | Gap |
|---|---|
| Button icon + label | `--spacing-2` (8px) |
| Sidebar icon + label | `--spacing-sidebar-icon-label` (10px) |
| Badge icon + label | `--spacing-1` (4px) |
| Input prefix icon | `--spacing-2` (8px) from icon to input edge |
| Inline text icon | `--spacing-1` (4px) |

---

## Icon Alignment

- Icons are always **vertically centered** with their adjacent text (`align-items: center`)
- Icons are positioned with `flex` — never absolute positioning
- The icon's visual center aligns with the text's cap height (Lucide handles this naturally)

---

## Sidebar Navigation Icons

| Section | Icon (Lucide name) |
|---|---|
| Overview / Dashboard | `LayoutDashboard` |
| Applications | `Briefcase` |
| Interviews | `MessageSquare` |
| Calendar | `Calendar` |
| Emails | `Mail` |
| Documents | `FileText` |
| Analytics | `BarChart2` |
| Expenses | `Receipt` |
| Salary & Offers | `DollarSign` |
| Goals | `Target` |
| Settings | `Settings` |
| AI Assistant | `Sparkles` |

---

## Dashboard & Content Icons

| Context | Icon (Lucide name) |
|---|---|
| Add / Create | `Plus` |
| Search | `Search` |
| Notifications (bell) | `Bell` |
| More options (3-dot) | `MoreHorizontal` |
| External link | `ExternalLink` |
| View / Open | `Eye` |
| Edit | `Pen` |
| Delete | `Trash2` |
| Archive | `Archive` |
| Copy | `Copy` |
| Download | `Download` |
| Upload | `Upload` |
| Share | `Share2` |
| Filter | `Filter` |
| Sort | `ArrowUpDown` |
| Chevron right | `ChevronRight` |
| Chevron down | `ChevronDown` |
| Close | `X` |
| Check / Confirm | `Check` |
| Star / Favorite | `Star` |
| Link / URL | `Link` |
| AI / Sparkle | `Sparkles` |
| Company logo fallback | `Building2` |

---

## Status Icons

| Status | Icon | Color |
|---|---|---|
| Success / Accepted | `CheckCircle2` | `--color-success` |
| Rejected | `XCircle` | `--color-danger` |
| Warning / Attention | `AlertTriangle` | `--color-warning` |
| Info | `Info` | `--color-info` |
| Pending / Loading | `Clock` | `--color-text-secondary` |
| Ghosted | `Ghost` | `--color-text-disabled` |
| Active / Online | `Circle` (filled) | `--color-success` |

---

## Icon Button Rules

An icon button is a button containing only an icon (no label):

```
Size:         32px × 32px (default), 28px × 28px (small)
Radius:       --radius-sm (6px) for square, --radius-full for circular
Background:   transparent at rest
              --color-hover-bg on hover
              --color-active-bg on active/pressed
Padding:      Equal all sides (centered icon)
Icon size:    --icon-md (16px) in default, --icon-sm (14px) in small
```

All icon buttons must have an `aria-label` or `title` attribute.

---

## Rules

- ✅ Only Lucide Icons — no mixing with Heroicons, Font Awesome, or custom SVGs
- ✅ Always use defined size tokens — never arbitrary px values
- ✅ All icon buttons have accessible labels
- ✅ Active sidebar icons use bold stroke (2px)
- ❌ Never use icons above 48px in the app UI (marketing only)
- ❌ Never fill icons solid unless it's a status indicator dot
- ❌ Never rotate icons with CSS transforms unless explicitly documenting the directional meaning
- ❌ No emoji as icons in the UI (only in user-generated content)
