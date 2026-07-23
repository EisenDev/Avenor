# Input Components

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

Inputs are the primary mechanism for user data entry. In Avenor, inputs are clean, calm, and low-friction. They should feel easy to interact with and never anxious or confusing.

---

## Text Input Anatomy

```
[Label text]
↕ 6px
┌──────────────────────────────────────────────┐
│  [Left Icon?]  Value or placeholder text  [✕]│
└──────────────────────────────────────────────┘
↕ 4px
[Hint text or Error message]
```

```
Background:     --color-card (#FFFFFF)
Border:         1px solid --color-border (#E9E3DA)
Radius:         --radius-sm (6px)
Height:         --height-input (38px)
Padding:        --spacing-input-y --spacing-input-x (10px 14px)
Font:           --font-size-body (15px), --font-weight-regular
Color:          --color-text-primary
Shadow:         --shadow-xs (subtle lift from page bg)
```

---

## States

### Default
```
Border:   1px solid --color-border (#E9E3DA)
```

### Placeholder
```
Color:    --color-text-secondary with opacity 0.65
```

### Hover
```
Border:   1px solid --color-border-hover (#C8BFB3)
Transition: --duration-fast (120ms)
```

### Focus
```
Border:   1px solid --color-border-focus (#B56A45)
Shadow:   --shadow-focus (0 0 0 3px rgba(181,106,69,0.20))
Outline:  none (replaced by shadow ring)
Transition: --duration-normal (200ms)
```

### Filled (has value)
```
Border:   1px solid --color-border
Color:    --color-text-primary (#222222)
```

### Error
```
Border:   1px solid --color-danger (#E07A7A)
Shadow:   0 0 0 3px rgba(224,122,122,0.20)
Background: --color-danger-subtle (#FCEEED) (optional, subtle)
```

### Disabled
```
Background: --color-muted (#F0ECE6)
Border:   1px solid --color-border-subtle (#F0ECE6)
Text:     --color-text-disabled (#B0ABA4)
Cursor:   not-allowed
```

---

## Label

```
Font:       --font-size-sm (14px), --font-weight-medium (500)
Color:      --color-text-primary (#222222)
Spacing:    6px below label, above input
Required:   Small * in --color-danger after the label text
```

---

## Hint / Helper Text

```
Font:       --font-size-xs (12px), --font-weight-regular (400)
Color:      --color-text-secondary (#6B7280)
Spacing:    4px above hint, below input
```

---

## Error Message

```
Font:       --font-size-xs (12px), --font-weight-medium (500)
Color:      --color-danger (#E07A7A)
Spacing:    4px above error, below input
Icon:       AlertCircle (--icon-xs, 12px) left of error text
```

**Sign-up form validation observed in mockup:**
```
Password must contain:
✓ At least 8 characters
✓ One uppercase letter
✓ One number

Each rule:
  Unchecked: Circle icon, --color-text-secondary
  Passed:    CheckCircle2, --color-success (#6BBF71)
```

---

## Textarea

Same as text input but:

```
Height:     auto (min 96px, max 240px)
Resize:     vertical only
Padding:    --spacing-input-y --spacing-input-x (10px 14px)
Font:       --font-size-body (15px), line-height 1.5
```

---

## Search Input

Used in the top header bar:

```
Background: rgba(255,255,255,0.7) or --color-card
Border:     1px solid --color-border
Radius:     --radius-md (8px)
Height:     --height-input-sm (30px) (compact)
Width:      240px (desktop), full width (mobile)
Left icon:  Search (--icon-md, 16px), --color-text-secondary
Shortcut:   "⌘ K" label right-aligned inside input (--font-size-xs, muted)
```

---

## Select (Dropdown)

```
Appearance:   custom — looks like text input with ChevronDown icon right
Background:   --color-card
Border:       1px solid --color-border
Radius:       --radius-sm (6px)
Height:       --height-input (38px)
Padding:      --spacing-input-y --spacing-input-x
Chevron:      --icon-sm (14px), right-aligned, --color-text-secondary

Options dropdown:
  Background:   --color-card
  Border:       1px solid --color-border
  Radius:       --radius-md (8px)
  Shadow:       --shadow-lg
  Max height:   240px (scrollable)
  Option height: 36px
  Option hover: --color-hover-bg
  Option selected: --color-active-bg, --color-primary text
```

---

## Checkbox

```
Size:           16px × 16px
Radius:         --radius-xs (4px)
Border:         1.5px solid --color-border

Checked:
  Background:   --color-primary (#B56A45)
  Border:       --color-primary
  Checkmark:    --color-text-inverse, animated stroke-dashoffset
  Animation:    --duration-fast (120ms), --ease-spring

Focused:
  Shadow:       --shadow-focus

Label gap:      --spacing-2 (8px)
Label font:     --font-size-sm, --font-weight-regular
```

---

## Radio Button

```
Size:           16px × 16px
Radius:         --radius-full
Border:         1.5px solid --color-border

Selected:
  Border:       --color-primary
  Inner dot:    6px circle, --color-primary, centered

Focused:
  Shadow:       --shadow-focus
```

---

## Toggle / Switch

```
Track size:     36px × 20px
Thumb size:     16px × 16px
Radius:         --radius-full

Off:
  Track bg:     --color-border (#E9E3DA)
  Thumb bg:     --color-card (#FFFFFF)
  Thumb shadow: --shadow-sm

On:
  Track bg:     --color-primary (#B56A45)
  Thumb bg:     --color-card (#FFFFFF)

Animation:
  Thumb translate: --duration-normal (200ms), --ease-out
  Track color: --duration-fast (120ms), --ease-out
```

---

## Token Reference

| Property | Token |
|---|---|
| Background | `--color-card` |
| Border | `--color-border` |
| Focus border | `--color-border-focus` |
| Error border | `--color-danger` |
| Radius | `--radius-sm` |
| Height | `--height-input` |
| H-padding | `--spacing-input-x` |
| V-padding | `--spacing-input-y` |
| Label font | `--font-size-sm`, `--font-weight-medium` |
| Value font | `--font-size-body` |
| Placeholder color | `--color-text-secondary` |
| Error color | `--color-danger` |
| Hint color | `--color-text-secondary` |
| Focus shadow | `--shadow-focus` |
| Shadow (lift) | `--shadow-xs` |
| Disabled bg | `--color-muted` |
| Transition | `--duration-normal`, `--ease-out` |
