# Dialogs & Modals

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

Dialogs capture the user's full attention for a decision or form that cannot be completed inline. They are used sparingly — only when the action truly requires focused attention and cannot be done inline or in a slide panel.

---

## Modal Anatomy

```
┌─────────────────────────────────────────────────────────┐ ← --radius-2xl (20px)
│  Title                                        [✕]       │ ← Header
│  ─────────────────────────────────────────────────────  │ ← 1px divider
│                                                         │
│  Body content                                           │ ← Scrollable if tall
│                                                         │
│  ─────────────────────────────────────────────────────  │ ← 1px divider
│                             [Cancel]  [Confirm Action]  │ ← Footer
└─────────────────────────────────────────────────────────┘

Backdrop:   rgba(34, 34, 34, 0.32) — --color-overlay
Position:   Centered, both axes
Width:      480px (default), 560px (large), 640px (XL)
Max-height: 80vh (scrollable body)
Background: --color-card (#FFFFFF)
Border:     1px solid --color-border (#E9E3DA)
Radius:     --radius-2xl (20px)
Shadow:     --shadow-xl
Z-index:    --z-modal (600) — backdrop at --z-modal-backdrop (500)
```

---

## Modal Header

```
Padding:      24px 24px 16px 24px
Title:        --font-size-h3 (20px), --font-weight-semibold, primary text
Subtitle:     --font-size-sm (14px), --color-text-secondary (if present)
Close button: X icon (--icon-md, 16px), icon button (32px), top-right corner
Divider:      1px solid --color-border-subtle, after header
```

---

## Modal Body

```
Padding:      16px 24px
Max-height:   calculated (modal max-height - header - footer)
Overflow-y:   auto
Scroll:       Custom thin scrollbar (2px, --color-border)
```

---

## Modal Footer

```
Padding:      16px 24px 24px 24px
Border-top:   1px solid --color-border-subtle
Layout:       Flex, justify-content: flex-end, gap: --spacing-2 (8px)

Buttons:
  Cancel:     Secondary button
  Primary:    Primary or Destructive button
  
Destructive modal swaps: Primary button → Destructive variant
```

---

## Animation

### Opening

```
Backdrop:   opacity 0 → 0.32, duration: 200ms, ease-out
Panel:      opacity 0 → 1, scale 0.96 → 1, translateY 12px → 0
            duration: 300ms, ease-out
```

### Closing

```
Backdrop:   opacity 0.32 → 0, duration: 200ms, ease-in
Panel:      opacity 1 → 0, scale 1 → 0.96
            duration: 200ms, ease-in
```

---

## Modal Variants

### Confirmation Dialog

For destructive actions (delete, disconnect, cancel):

```
Width: 400px (narrower, focused)
Body: Warning text — one paragraph maximum
      Icon: AlertTriangle (--icon-xl, 24px, --color-warning or --color-danger)
Footer: [Cancel] [Delete / Confirm] — Destructive button
```

### Form Modal

For create/edit forms:

```
Width: 480px (default)
Body: Form fields
Footer: [Cancel] [Save / Create]
```

### Information Modal

For viewing details that need more space:

```
Width: 640px (large)
Body: Rich content, possibly with internal sections
Footer: Single [Close] button (centered or right)
```

---

## Drawer / Side Sheet

For complex forms or detail views, a side drawer is used instead of a centered modal:

```
Position:   Fixed, right edge
Width:      480px (default), 640px (wide)
Height:     100vh
Background: --color-card (#FFFFFF)
Border-left: 1px solid --color-border
Shadow:     --shadow-xl
Z-index:    --z-modal (600)

Animation:
  Open:  translateX(100%) → 0, 300ms, ease-out
  Close: translateX(0) → 100%, 200ms, ease-in
```

---

## Accessibility

- `role="dialog"`, `aria-modal="true"`
- `aria-labelledby` pointing to modal title
- Focus trapped within modal on open
- First focusable element receives focus on open
- `Escape` key closes the modal
- On close, focus returns to the trigger element
- Backdrop click closes the modal (except for destructive confirmations)

---

## Token Reference

| Property | Token |
|---|---|
| Background | `--color-card` |
| Overlay | `--color-overlay` |
| Border | `1px solid --color-border` |
| Radius | `--radius-2xl` |
| Shadow | `--shadow-xl` |
| Z-index (modal) | `--z-modal` |
| Z-index (backdrop) | `--z-modal-backdrop` |
| Title font | `--font-size-h3`, `--font-weight-semibold` |
| Inner padding | `24px` |
| Footer padding | `16px 24px 24px` |
