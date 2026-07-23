# Design Tokens — Master Registry

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth — Non-Negotiable

This is the **master registry of every design token** used in Avenor. All tokens are defined once here and referenced everywhere. If a value is not here, it does not exist in the design system.

> **Rule:** Change a token here → the entire application updates. This is the power of a token-first system.

---

## Token Naming Convention

```
--token-category-variant-state

Examples:
--color-primary
--color-primary-hover
--color-text-secondary
--radius-card
--shadow-sm
--spacing-4
--font-size-body
--duration-fast
```

---

## 1. Color Tokens

### Neutral / Surface

| Token Name | Value | Description |
|---|---|---|
| `--color-bg-primary` | `#FAF8F5` | Page background |
| `--color-surface` | `#F4F1EC` | Sidebar, section backgrounds |
| `--color-card` | `#FFFFFF` | Card, panel background |
| `--color-border` | `#E9E3DA` | Default borders |
| `--color-muted` | `#F0ECE6` | Muted fills, skeleton, disabled |
| `--color-text-primary` | `#222222` | Primary text |
| `--color-text-secondary` | `#6B7280` | Secondary, metadata text |
| `--color-text-disabled` | `#B0ABA4` | Disabled state text |
| `--color-text-inverse` | `#FFFFFF` | Text on dark/primary backgrounds |

### Brand / Semantic

| Token Name | Value | Description |
|---|---|---|
| `--color-primary` | `#B56A45` | Terracotta — CTAs, active states, brand |
| `--color-primary-hover` | `#9F5A39` | Primary hover |
| `--color-primary-active` | `#8A4C30` | Primary pressed |
| `--color-primary-subtle` | `#FAF0EB` | Primary tint for backgrounds |
| `--color-primary-muted` | `#EDD9CF` | Muted primary for borders |
| `--color-secondary` | `#7ABF73` | Sage — success, progress, positive |
| `--color-secondary-hover` | `#68A861` | Secondary hover |
| `--color-secondary-subtle` | `#EEF6EC` | Secondary tint |
| `--color-success` | `#6BBF71` | Success state |
| `--color-success-subtle` | `#EDF7EE` | Success background tint |
| `--color-warning` | `#D6A25E` | Soft amber — warnings |
| `--color-warning-subtle` | `#FBF4E8` | Warning background tint |
| `--color-danger` | `#E07A7A` | Danger, error, rejection |
| `--color-danger-subtle` | `#FCEEED` | Danger background tint |
| `--color-info` | `#6EA8D7` | Info, links, neutral indicators |
| `--color-info-subtle` | `#EBF4FB` | Info background tint |

### Interactive States

| Token Name | Value | Description |
|---|---|---|
| `--color-focus-ring` | `#B56A45` | Focus outline color |
| `--color-overlay` | `rgba(34, 34, 34, 0.32)` | Modal/dialog backdrop |
| `--color-hover-bg` | `rgba(181, 106, 69, 0.06)` | Hover state background on light |
| `--color-active-bg` | `rgba(181, 106, 69, 0.10)` | Active/selected state background |

---

## 2. Typography Tokens

| Token Name | Value | Description |
|---|---|---|
| `--font-family-sans` | `'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif` | Primary UI font |
| `--font-family-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Code, IDs, timestamps |
| `--font-size-display` | `3rem` / `48px` | Marketing display headings |
| `--font-size-h1` | `2rem` / `32px` | Page titles |
| `--font-size-h2` | `1.5rem` / `24px` | Section headings |
| `--font-size-h3` | `1.25rem` / `20px` | Card titles, subsections |
| `--font-size-h4` | `1.0625rem` / `17px` | Labels, minor headings |
| `--font-size-body-lg` | `1rem` / `16px` | Primary body |
| `--font-size-body` | `0.9375rem` / `15px` | Default body — dashboard |
| `--font-size-sm` | `0.875rem` / `14px` | Secondary, metadata |
| `--font-size-xs` | `0.75rem` / `12px` | Captions, badges |
| `--font-size-xxs` | `0.6875rem` / `11px` | Overline labels |
| `--font-weight-regular` | `400` | Body text |
| `--font-weight-medium` | `500` | Labels, sidebar items |
| `--font-weight-semibold` | `600` | Card titles, stat values |
| `--font-weight-bold` | `700` | H1, display, CTA text |
| `--font-weight-extrabold` | `800` | Marketing display only |
| `--line-height-tight` | `1.2` | Display, large headings |
| `--line-height-snug` | `1.35` | H1–H3 |
| `--line-height-normal` | `1.5` | Body text |
| `--line-height-relaxed` | `1.65` | Long-form reading |
| `--letter-spacing-tight` | `-0.025em` | Display headings |
| `--letter-spacing-normal` | `0em` | Body |
| `--letter-spacing-wide` | `0.04em` | Overline, badge labels |
| `--letter-spacing-widest` | `0.08em` | Small caps overlines |

---

## 3. Spacing Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--spacing-0` | `0px` | — |
| `--spacing-1` | `4px` | Icon gap, tight inline |
| `--spacing-2` | `8px` | Badge padding, icon margin |
| `--spacing-3` | `12px` | Small padding |
| `--spacing-4` | `16px` | Standard padding unit |
| `--spacing-5` | `20px` | Form field gap |
| `--spacing-6` | `24px` | Card internal padding |
| `--spacing-7` | `28px` | — |
| `--spacing-8` | `32px` | Section gaps |
| `--spacing-10` | `40px` | Large section gap |
| `--spacing-12` | `48px` | Dashboard section spacing |
| `--spacing-16` | `64px` | Page section spacing |
| `--spacing-20` | `80px` | Hero spacing |
| `--spacing-24` | `96px` | Large marketing blocks |

### Semantic Spacing

| Token Name | Value | Context |
|---|---|---|
| `--spacing-page-x` | `32px` | Dashboard horizontal page padding |
| `--spacing-page-y` | `32px` | Dashboard vertical page padding |
| `--spacing-section` | `48px` | Between dashboard sections |
| `--spacing-card-inner` | `24px` | Inside cards |
| `--spacing-card-gap` | `16px` | Between cards in a grid |
| `--spacing-form-gap` | `20px` | Between form fields |
| `--spacing-btn-x` | `20px` | Button horizontal padding |
| `--spacing-btn-y` | `10px` | Button vertical padding |
| `--spacing-btn-x-sm` | `14px` | Small button horizontal |
| `--spacing-btn-y-sm` | `6px` | Small button vertical |
| `--spacing-input-x` | `14px` | Input horizontal padding |
| `--spacing-input-y` | `10px` | Input vertical padding |
| `--spacing-sidebar-x` | `16px` | Sidebar item horizontal padding |
| `--spacing-sidebar-gap` | `4px` | Gap between sidebar items |
| `--spacing-table-cell` | `12px 16px` | Table cell padding |

---

## 4. Border Radius Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--radius-none` | `0px` | — |
| `--radius-xs` | `4px` | Badges, tags, small chips |
| `--radius-sm` | `6px` | Inputs, small buttons |
| `--radius-md` | `8px` | Buttons, dropdowns |
| `--radius-lg` | `12px` | Cards, panels |
| `--radius-xl` | `16px` | Large cards, dashboard cards |
| `--radius-2xl` | `20px` | Modals, dialogs |
| `--radius-full` | `9999px` | Pills, avatars, toggles |

---

## 5. Border Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--border-width-hairline` | `1px` | All standard borders |
| `--border-width-thick` | `2px` | Focus rings, active states |
| `--border-color` | `#E9E3DA` | Default border |
| `--border-color-strong` | `#D4CDBF` | Emphasized borders |
| `--border-color-subtle` | `#F0ECE6` | Very subtle dividers |
| `--border-color-focus` | `#B56A45` | Focus ring color |
| `--border-color-hover` | `#C8BFB3` | Hovered border |
| `--border-color-primary` | `#B56A45` | Primary-accented border |
| `--border-color-danger` | `#E07A7A` | Error state border |
| `--border-color-success` | `#7ABF73` | Success state border |

---

## 6. Shadow Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Flat surfaces |
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift — inputs on bg |
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards, panels |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)` | Elevated cards |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)` | Dropdowns, popovers |
| `--shadow-xl` | `0 16px 40px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)` | Modals, dialogs |
| `--shadow-hover` | `0 4px 16px rgba(181,106,69,0.12), 0 1px 4px rgba(0,0,0,0.06)` | Card hover state |
| `--shadow-focus` | `0 0 0 3px rgba(181,106,69,0.20)` | Focus ring glow |
| `--shadow-primary-btn` | `0 2px 8px rgba(181,106,69,0.30)` | Primary button shadow |

---

## 7. Motion Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--duration-instant` | `75ms` | Immediate feedback |
| `--duration-fast` | `120ms` | Hover states, micro |
| `--duration-normal` | `200ms` | Standard transitions |
| `--duration-slow` | `300ms` | Panel open/close |
| `--duration-slower` | `400ms` | Page transitions |
| `--duration-slowest` | `600ms` | Loading, first-paint |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances (element appears) |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exits (element disappears) |
| `--ease-inout` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions |

---

## 8. Z-Index Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--z-below` | `-1` | Behind everything |
| `--z-base` | `0` | Default document flow |
| `--z-raised` | `10` | Slightly raised elements |
| `--z-sticky` | `100` | Sticky headers |
| `--z-sidebar` | `200` | Sidebar |
| `--z-header` | `300` | Top header bar |
| `--z-dropdown` | `400` | Dropdowns, popovers |
| `--z-modal-backdrop` | `500` | Modal backdrop |
| `--z-modal` | `600` | Modal dialog |
| `--z-toast` | `700` | Toast notifications |
| `--z-tooltip` | `800` | Tooltips (always on top) |

---

## 9. Icon Size Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--icon-xs` | `12px` | Inline text icons |
| `--icon-sm` | `14px` | Badge icons |
| `--icon-md` | `16px` | Sidebar, nav, button icons |
| `--icon-lg` | `20px` | Feature icons, headers |
| `--icon-xl` | `24px` | Section icons |
| `--icon-2xl` | `32px` | Empty state icons |
| `--icon-3xl` | `48px` | Marketing feature icons |
| `--icon-stroke` | `1.5px` | Standard Lucide stroke width |
| `--icon-stroke-bold` | `2px` | Emphasized icons |

---

## 10. Layout Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--sidebar-width` | `220px` | App sidebar |
| `--sidebar-width-collapsed` | `56px` | Collapsed sidebar (future) |
| `--header-height` | `56px` | Top header bar |
| `--content-max-width` | `1400px` | Max dashboard content width |
| `--container-sm` | `640px` | Small content width |
| `--container-md` | `768px` | Medium content width |
| `--container-lg` | `1024px` | Large content width |
| `--grid-gap` | `16px` | Standard grid gap |
| `--grid-gap-lg` | `24px` | Large grid gap |

---

## 11. Component Height Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--height-btn-sm` | `30px` | Small button |
| `--height-btn-md` | `38px` | Default button |
| `--height-btn-lg` | `46px` | Large button |
| `--height-input` | `38px` | Default input |
| `--height-input-sm` | `30px` | Small input |
| `--height-sidebar-item` | `36px` | Sidebar nav item |
| `--height-header` | `56px` | Top header bar |
| `--height-stat-card` | `100px` | Dashboard stat card |
