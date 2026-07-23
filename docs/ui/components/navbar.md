# Header / Navbar Component

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

The top header provides global search, notification access, and user identity. It sits above all main content and below the page title. It must be visually light — a supporting element, never competing with content.

---

## App Header (Authenticated Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│  [Sidebar 220px] │  [Search bar]        [⊞] [🔔] [Avatar ▾]│
└─────────────────────────────────────────────────────────────┘

Height:         --header-height (56px)
Background:     --color-card (#FFFFFF)
Border-bottom:  1px solid --color-border (#E9E3DA)
Position:       sticky, top: 0
Z-index:        --z-header (300)
Padding:        0 --spacing-page-x (0 32px)
```

---

## Header Elements

### Search Bar (Left/Center)

```
Width:          240px (desktop)
Height:         --height-input-sm (30px)
Background:     --color-surface (#F4F1EC)
Border:         1px solid --color-border
Radius:         --radius-md (8px)
Left icon:      Search (--icon-md, 16px), --color-text-secondary
Placeholder:    "Search anything..."
Right label:    "⌘ K" — --font-size-xs, --color-text-secondary, opacity 0.6
Font:           --font-size-sm (14px)

Focus:
  Background:   --color-card (#FFFFFF)
  Border:       --color-border-focus
  Shadow:       --shadow-focus
```

### Dashboard Toggle (Grid icon)

```
Icon:           LayoutGrid or similar 2×2 grid icon (Lucide)
Size:           32px button, --icon-md icon
Appearance:     Icon button (ghost)
Position:       Right of search bar
```

### Notifications Bell

```
Icon:           Bell (--icon-md, 16px)
Size:           32px icon button
Badge:          Count badge (top-right, 6px offset)
  Background:   --color-primary (#B56A45)
  Size:         8px dot (no number) or pill with count
Tooltip:        "Notifications"
```

### User Avatar + Name

```
Layout:         Avatar | Name | Chevron
Avatar:         32px × 32px, --radius-full
  → Photo if available
  → Initials on --color-primary-subtle background if no photo
  → Initials font: --font-size-xs, --font-weight-semibold, --color-primary

Name:           --font-size-sm (14px), --font-weight-medium
Subtitle:       "Premium" badge or plan label below name
  → Badge: --color-primary-subtle bg, --color-primary text, --radius-xs

Chevron:        ChevronDown (--icon-sm, 14px), --color-text-secondary
Dropdown:       Profile menu, settings, logout
```

---

## Marketing Header (Landing Page)

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]  Features  How it works  Pricing  Resources   Log in [Get started] │
└──────────────────────────────────────────────────────────────┘

Height:         64px
Background:     transparent (on hero) → --color-card (on scroll)
Transition:     background-color --duration-normal (200ms)
Padding:        0 48px (or --container-lg centered)
Border-bottom:  none at rest, 1px --color-border on scroll/sticky

Logo:
  Same as sidebar logo: icon mark + wordmark
  Color: --color-text-primary

Nav Links:
  Font: --font-size-sm (14px), --font-weight-medium (500)
  Color: --color-text-secondary
  Hover: --color-text-primary
  Gap: --spacing-8 (32px) between items

"Log in" link:
  Ghost button style

"Get started" button:
  Primary button (--color-primary, terracotta)
  Size: small (--height-btn-sm, 30px)
```

---

## Accessibility

- Header `<header>` landmark with `role="banner"`
- Search input has `aria-label="Search"`
- Notifications button has `aria-label="View notifications"`
- Avatar button has `aria-label="User menu"`
- Skip-to-content link as first focusable element

---

## Token Reference

| Property | Token |
|---|---|
| Height | `--header-height` |
| Background | `--color-card` |
| Border | `1px solid --color-border` |
| Z-index | `--z-header` |
| Padding | `--spacing-page-x` |
| Search radius | `--radius-md` |
| Avatar size | `32px` |
| Nav font | `--font-size-sm`, `--font-weight-medium` |
| Icon size | `--icon-md` |
