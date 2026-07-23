# Button Component

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

Buttons initiate actions. In Avenor, buttons are rare but decisive — they appear only when the user needs to commit to an action. The visual weight of each button variant communicates urgency and importance.

---

## Anatomy

```
┌──────────────────────────────────────┐
│  [Icon?]  Label Text  [Icon?]        │
└──────────────────────────────────────┘
     ↑
  Icon (optional, --icon-md 16px)
  Label (--font-size-sm, --font-weight-semibold)
  Padding: --spacing-btn-x / --spacing-btn-y
  Radius: --radius-md
  Height: --height-btn-md (38px)
```

---

## Variants

### Primary

The main call-to-action button. Used sparingly — maximum **one per screen section**.

```
Background:     --color-primary (#B56A45)
Text:           --color-text-inverse (#FFFFFF)
Border:         none
Shadow:         --shadow-primary-btn
Radius:         --radius-md (8px)
Height:         --height-btn-md (38px)
Padding:        --spacing-btn-y --spacing-btn-x (10px 20px)

Hover:
  Background:   --color-primary-hover (#9F5A39)
  Shadow:       0 4px 12px rgba(181,106,69,0.35)

Active:
  Background:   --color-primary-active (#8A4C30)
  Shadow:       none
  Transform:    none (no scale)

Disabled:
  Background:   --color-muted (#F0ECE6)
  Text:         --color-text-disabled (#B0ABA4)
  Shadow:       none
  Cursor:       not-allowed
```

**Observed in mockup:** "Get started for free", "Create account", "+ Add Application"

---

### Secondary

Secondary actions that support the primary action.

```
Background:     --color-card (#FFFFFF)
Text:           --color-text-primary (#222222)
Border:         1px solid --color-border (#E9E3DA)
Radius:         --radius-md (8px)
Height:         --height-btn-md (38px)

Hover:
  Background:   --color-surface (#F4F1EC)
  Border:       --color-border-hover (#C8BFB3)

Active:
  Background:   --color-muted (#F0ECE6)

Disabled:
  Background:   --color-muted
  Text:         --color-text-disabled
  Border:       --color-border-subtle
```

**Used for:** "See how it works", secondary form actions, cancel buttons

---

### Ghost

Tertiary actions — minimal visual weight.

```
Background:     transparent
Text:           --color-text-secondary (#6B7280)
Border:         none

Hover:
  Background:   --color-hover-bg (rgba(181,106,69,0.06))
  Text:         --color-text-primary (#222222)
```

**Used for:** "View all interviews →", "View all emails →", text navigation links

---

### Destructive

For delete, remove, or dangerous irreversible actions.

```
Background:     --color-danger-subtle (#FCEEED)
Text:           --color-danger (#E07A7A)
Border:         1px solid rgba(224,122,122,0.3)

Hover:
  Background:   --color-danger (#E07A7A)
  Text:         --color-text-inverse (#FFFFFF)
  Border:       none
```

**Used for:** Delete application, disconnect integration, remove document

---

### Icon Button

Icon-only button for toolbar actions.

```
Size:           32px × 32px
Background:     transparent
Icon:           --icon-md (16px), --color-text-secondary

Hover:
  Background:   --color-hover-bg
  Icon:         --color-text-primary

Active:
  Background:   --color-active-bg

Must always have: aria-label
```

---

### Social Auth Button

Used on the sign-up and login screens.

```
Background:     --color-card (#FFFFFF)
Border:         1px solid --color-border (#E9E3DA)
Text:           --color-text-primary (#222222)
Radius:         --radius-md (8px)
Height:         46px (slightly taller for auth UX)
Width:          full width
Icon:           Left-aligned, 20px

Hover:
  Background:   --color-surface (#F4F1EC)
  Border:       --color-border-hover

Example: "Sign up with Google", "Sign up with Apple"
```

---

## Sizes

| Size | Height | H-Padding | Font | Token |
|---|---|---|---|---|
| Small | 30px | 14px | 12px semibold | `--height-btn-sm` |
| Default | 38px | 20px | 14px semibold | `--height-btn-md` |
| Large | 46px | 28px | 15px semibold | `--height-btn-lg` |

---

## States

| State | Visual Change |
|---|---|
| Default | Base styles |
| Hover | Background shift, shadow increase |
| Active | Slightly darker, no shadow |
| Focus | `--shadow-focus` ring (3px terracotta glow) |
| Loading | Label replaced by spinner, same dimensions |
| Disabled | Muted, reduced opacity, `cursor: not-allowed` |

---

## Do

- ✅ Use one primary button per section maximum
- ✅ Use icon + label when the icon adds clarity
- ✅ Always provide loading state for async actions
- ✅ Use destructive variant for delete actions
- ✅ Full-width buttons on mobile and in forms

## Don't

- ❌ Never use primary for navigation (use links/tabs)
- ❌ Never place two primary buttons side by side
- ❌ Never use icon buttons without `aria-label`
- ❌ Never add uppercase text to buttons (sentence case only)
- ❌ Never animate button size on hover (only color/shadow)

---

## Token Reference

| Property | Token |
|---|---|
| Primary bg | `--color-primary` |
| Primary hover bg | `--color-primary-hover` |
| Secondary bg | `--color-card` |
| Border | `--color-border` |
| Text | `--color-text-primary` |
| Text on primary | `--color-text-inverse` |
| Disabled bg | `--color-muted` |
| Disabled text | `--color-text-disabled` |
| Radius | `--radius-md` |
| Shadow | `--shadow-primary-btn` |
| Focus ring | `--shadow-focus` |
| H. padding | `--spacing-btn-x` |
| V. padding | `--spacing-btn-y` |
| Icon gap | `--spacing-2` |
| Transition | `--duration-fast`, `--ease-out` |
