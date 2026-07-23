# Shadows & Elevation

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Philosophy

Avenor uses **minimal elevation**. The design language is flat-first with subtle lift — not skeuomorphic, not flat-flat. Shadows communicate elevation and interactivity, never decoration.

The background `#FAF8F5` is warm, and cards are pure `#FFFFFF`. This warm-to-white contrast does most of the visual separation work. Shadows are the whisper, not the shout.

> **Rule:** If removing the shadow makes no visual difference, the shadow shouldn't be there.

---

## Elevation Scale

```
Surface hierarchy:

Level 0 — Page background (#FAF8F5)
Level 1 — Sidebar / section surfaces (#F4F1EC)
Level 2 — Cards / panels (#FFFFFF + --shadow-sm)
Level 3 — Dropdowns / popovers (#FFFFFF + --shadow-lg)
Level 4 — Modals / dialogs (#FFFFFF + --shadow-xl)
Level 5 — Toast notifications (#FFFFFF + --shadow-xl)
```

---

## Shadow Tokens

### `--shadow-none`
```
box-shadow: none
```
**Usage:** Flat backgrounds, sidebar items, disabled states, tables

---

### `--shadow-xs`
```
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04)
```
**Usage:** Inputs sitting on the page background. Creates hairline lift that separates the input from `#FAF8F5` without looking raised.

---

### `--shadow-sm`
```
box-shadow:
  0 1px 4px rgba(0, 0, 0, 0.06),
  0 1px 2px rgba(0, 0, 0, 0.04)
```
**Usage:** Default card elevation. The primary shadow used on dashboard cards, stat cards, and panels.

---

### `--shadow-md`
```
box-shadow:
  0 4px 12px rgba(0, 0, 0, 0.08),
  0 1px 3px rgba(0, 0, 0, 0.05)
```
**Usage:** Elevated cards (e.g., AI Assistant panel, featured content). Slightly more prominent sections.

---

### `--shadow-lg`
```
box-shadow:
  0 8px 24px rgba(0, 0, 0, 0.10),
  0 2px 6px rgba(0, 0, 0, 0.06)
```
**Usage:** Dropdowns, command menus, select menus, date pickers. Elements that float above the content plane.

---

### `--shadow-xl`
```
box-shadow:
  0 16px 40px rgba(0, 0, 0, 0.12),
  0 4px 8px rgba(0, 0, 0, 0.06)
```
**Usage:** Modals, dialogs, drawers. Maximum elevation in the system.

---

### `--shadow-hover`
```
box-shadow:
  0 4px 16px rgba(181, 106, 69, 0.12),
  0 1px 4px rgba(0, 0, 0, 0.06)
```
**Usage:** Card hover state. The terracotta tint in the shadow reinforces the brand color on interaction without being obvious.

---

### `--shadow-focus`
```
box-shadow: 0 0 0 3px rgba(181, 106, 69, 0.20)
```
**Usage:** Focus ring for inputs, buttons, and interactive elements. A soft terracotta glow — accessible but not harsh.

---

### `--shadow-primary-btn`
```
box-shadow: 0 2px 8px rgba(181, 106, 69, 0.30)
```
**Usage:** Primary CTA button at rest and hover. Gives the terracotta button a sense of warmth and lift.

---

## Elevation Usage Map

| Element | Shadow Token |
|---|---|
| Page background | `none` |
| Sidebar | `none` |
| Stat cards | `--shadow-sm` |
| Dashboard content cards | `--shadow-sm` |
| Card on hover | `--shadow-hover` |
| Focused input | `--shadow-focus` |
| Primary button | `--shadow-primary-btn` |
| Dropdown menus | `--shadow-lg` |
| Command palette | `--shadow-xl` |
| Modals / dialogs | `--shadow-xl` |
| Toast notifications | `--shadow-xl` |
| Tooltips | `--shadow-lg` |
| AI Assistant panel | `--shadow-md` |

---

## Shadow Rules

- ✅ Use warm-tinted shadows (`rgba(181, 106, 69, ...)`) on interactive elements
- ✅ Layer two shadow values for realism (ambient + directional)
- ✅ Shadow opacity is always under 15% for non-interactive elements
- ❌ Never use `box-shadow: 0 4px 6px rgba(0,0,0,0.5)` — too heavy
- ❌ Never use colored shadows for elevation purposes (only for focus/hover)
- ❌ Never add shadows to inline text elements
- ❌ No `text-shadow` on body text — headlines only and sparingly
