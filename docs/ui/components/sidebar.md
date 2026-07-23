# Sidebar Component

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

The sidebar is the primary navigation container for all authenticated application pages. It provides persistent access to every section of Avenor while staying visually recessive — it should never compete with the main content.

---

## Visual Specification

```
┌──────────────────────┐
│  [A] Avenor          │  ← Logo area: 56px tall
│  ────────────────    │  ← Hairline divider
│                      │
│  [icon] Overview     │  ← Nav item: --height-sidebar-item (36px)
│  [icon] Applications │
│  [icon] Interviews   │
│  [icon] Calendar     │
│  [icon] Emails  [12] │  ← With badge (unread count)
│  [icon] Documents    │
│  [icon] Analytics    │
│  [icon] Expenses     │
│  [icon] Salary...    │
│  [icon] Goals        │
│                      │
│  ────────────────    │  ← Divider before settings/footer
│  [icon] Settings     │
│                      │
│  ┌────────────────┐  │  ← AI Assistant panel at bottom
│  │ [AI] Online    │  │
│  └────────────────┘  │
└──────────────────────┘

Width:          220px (--sidebar-width)
Background:     --color-surface (#F4F1EC)
Border-right:   1px solid --color-border (#E9E3DA)
Position:       fixed, full height, left 0
Z-index:        --z-sidebar (200)
```

---

## Logo Area

```
Height:         56px (--header-height)
Padding:        0 --spacing-sidebar-x (0 16px)
Content:        App logo mark (terracotta 'A') + "Avenor" wordmark
Font:           --font-size-h4, --font-weight-bold
Color:          --color-text-primary
Alignment:      flex, align-items: center, gap: --spacing-2 (8px)
Border-bottom:  1px solid --color-border
```

---

## Navigation Item

```
┌──────────────────────────────────────┐
│  [Icon 16px]   Label text            │
└──────────────────────────────────────┘

Height:         --height-sidebar-item (36px)
Padding:        0 --spacing-sidebar-x (0 16px)
Radius:         --radius-md (8px)
Margin:         --spacing-sidebar-gap (4px) bottom
Font:           --font-size-sm (14px), --font-weight-medium (500)
Icon:           --icon-md (16px), stroke: --icon-stroke (1.5px)
Icon gap:       --spacing-sidebar-icon-label (10px)

States:
  Default:
    Background: transparent
    Text:       --color-text-secondary (#6B7280)
    Icon:       --color-text-secondary

  Hover:
    Background: --color-hover-bg
    Text:       --color-text-primary (#222222)
    Icon:       --color-text-primary
    Transition: --duration-fast (120ms), --ease-inout

  Active / Current page:
    Background: --color-active-bg (rgba(181,106,69,0.10))
    Text:       --color-primary (#B56A45)
    Icon:       --color-primary (#B56A45)
    Font-weight: --font-weight-semibold (600)
    Icon stroke: --icon-stroke-bold (2px)
```

---

## Badge (Unread Count)

Some sidebar items carry a count badge (e.g., Emails unread):

```
Position:       Right-aligned, same row as the label
Background:     --color-primary (#B56A45)
Text:           --color-text-inverse (#FFFFFF)
Font:           --font-size-xxs (11px), --font-weight-semibold
Radius:         --radius-full (9999px)
Padding:        2px 6px
Min-width:      18px
Max display:    99+ (truncate above 99)
```

---

## Section Divider

```
Height:         1px
Background:     --color-border (#E9E3DA)
Margin:         --spacing-3 (12px) vertical
```

---

## AI Assistant Panel (Sidebar Footer)

At the bottom of the sidebar, above settings:

```
┌──────────────────────┐
│  [◉] AI Assistant    │
│       Online         │
└──────────────────────┘

Background:     --color-card (#FFFFFF)
Border:         1px solid --color-border
Radius:         --radius-md (8px)
Padding:        10px 12px
Margin:         8px (from edges)

Status dot:
  Online: filled circle, --color-success (#6BBF71), 8px
  Offline: filled circle, --color-text-disabled, 8px

Title: --font-size-sm, --font-weight-medium, --color-text-primary
Status: --font-size-xs, --color-text-secondary
```

---

## Navigation Order (from mockup)

1. Overview
2. Applications
3. Interviews
4. Calendar
5. Emails *(+ unread badge)*
6. Documents
7. Analytics
8. Expenses
9. Salary & Offers
10. Goals
11. ── divider ──
12. Settings
13. ── *(AI Assistant panel)* ──

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Desktop (≥1024px) | Fixed sidebar, 220px |
| Tablet (768–1023px) | Hidden by default, slide-in on hamburger |
| Mobile (<768px) | Full-screen overlay drawer |

---

## Accessibility

- Sidebar `<nav>` has `aria-label="Main navigation"`
- Active item has `aria-current="page"`
- All items are keyboard navigable
- Badge count has `aria-label="N unread"`
- Focus is trapped in sidebar drawer on mobile

---

## Token Reference

| Property | Token |
|---|---|
| Width | `--sidebar-width` |
| Background | `--color-surface` |
| Border | `1px solid --color-border` |
| Z-index | `--z-sidebar` |
| Item height | `--height-sidebar-item` |
| Item radius | `--radius-md` |
| Item padding | `--spacing-sidebar-x` |
| Item gap | `--spacing-sidebar-gap` |
| Font | `--font-size-sm`, `--font-weight-medium` |
| Active color | `--color-primary` |
| Active bg | `--color-active-bg` |
| Hover bg | `--color-hover-bg` |
| Icon size | `--icon-md` |
| Icon gap | `--spacing-sidebar-icon-label` |
