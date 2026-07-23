# Accessibility Standards

> **Document Owner:** Design Team / QA Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Standard

Avenor targets **WCAG 2.1 Level AA** compliance as a minimum baseline. Where feasible, AAA standards are applied (primarily for contrast on critical text).

Accessibility is not an afterthought — it is designed in from the first token.

---

## 1. Color Contrast

All text must meet minimum contrast ratios:

| Text Size | Minimum Ratio | Level |
|---|---|---|
| Normal text (< 18pt / 14pt bold) | 4.5:1 | AA |
| Large text (≥ 18pt or 14pt bold) | 3:1 | AA |
| UI components, graphical elements | 3:1 | AA |

### Verified Combinations

| Text Color | Background | Ratio | Status |
|---|---|---|---|
| `#222222` on `#FAF8F5` | 16.1:1 | ✅ AAA |
| `#222222` on `#FFFFFF` | 18.1:1 | ✅ AAA |
| `#222222` on `#F4F1EC` | 14.8:1 | ✅ AAA |
| `#6B7280` on `#FAF8F5` | 4.8:1 | ✅ AA |
| `#6B7280` on `#FFFFFF` | 5.7:1 | ✅ AA |
| `#FFFFFF` on `#B56A45` | 3.2:1 | ✅ AA Large |
| `#FFFFFF` on `#9F5A39` | 4.0:1 | ✅ AA |
| `#B56A45` on `#FAF8F5` | 3.5:1 | ✅ AA Large |

> **Note:** `#FFFFFF` on `#B56A45` (terracotta) passes AA for large text. For small text on primary backgrounds, use `--color-primary-active (#8A4C30)` for sufficient contrast.

### Color-Only Prohibition

**Status must never be communicated by color alone.** Always pair color with a text label, icon, or pattern.

```
✅ Correct:   [● Rejected]  ← color + icon + text
❌ Incorrect: [●]          ← color alone (meaningless to colorblind users)
```

---

## 2. Keyboard Navigation

Every interactive element must be reachable and usable with keyboard only.

### Tab Order
- Tab order follows visual reading order (left-to-right, top-to-bottom)
- Sidebar navigation is fully keyboard-accessible (Tab + Enter/Space)
- Modal dialogs trap focus (Tab cycles only within the modal)
- Dropdowns: Arrow keys navigate options, Enter selects, Escape closes

### Keyboard Shortcuts
```
⌘K / Ctrl+K    → Open search / command palette
Escape          → Close any open overlay (modal, dropdown, drawer)
Enter/Space     → Activate focused element
Arrow keys      → Navigate within dropdown, table rows
Tab / Shift+Tab → Navigate between interactive elements
```

---

## 3. Focus States

**All interactive elements must have visible focus states.** Avenor uses the warm terracotta focus ring:

```
Focus ring:
  box-shadow: 0 0 0 3px rgba(181, 106, 69, 0.20)
  border: 1px solid --color-border-focus (#B56A45)
  outline: none (replaced by box-shadow)
```

Never use `outline: none` without replacing it with an equally visible focus indicator.

The focus ring must have a minimum 3:1 contrast ratio against its surrounding background.

---

## 4. Screen Readers

### Landmark Regions

```html
<header>       ← Top navigation
<nav>          ← Sidebar navigation (aria-label="Main navigation")
<main>         ← Page content
<aside>        ← AI assistant panel, supplementary
<footer>       ← Footer content
```

### ARIA Labels

| Element | ARIA Pattern |
|---|---|
| Search input | `aria-label="Search anything"` |
| Notifications | `aria-label="View notifications"` |
| User menu | `aria-label="User menu"` |
| Icon-only buttons | `aria-label="[action]"` |
| Active nav item | `aria-current="page"` |
| Loading | `aria-busy="true"` |
| Progress bar | `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` |
| Badge count | `aria-label="N unread"` |
| Dialog | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` |
| Stat cards | Include visually hidden context text |

### Stat Card Example

```
Visual display: "24" with label "Applications"
Screen reader: "Applications: 24, up 12% this month"
→ Use aria-label or visually-hidden span to provide full context
```

---

## 5. Touch Targets

All interactive elements on mobile must meet minimum touch target size:

```
Minimum: 44px × 44px (per WCAG 2.5.5 AAA, target for AA compliance)
Target:  48px × 48px (recommended)

Implementation: Use padding to expand the click area if the visible element is smaller.
```

Mobile-specific considerations:
- Sidebar becomes a full-height drawer on mobile
- Primary buttons are full-width on mobile
- Table rows have adequate touch targets

---

## 6. Font Sizes

```
Minimum body text:   14px (--font-size-sm)
Minimum label text:  12px (--font-size-xs)
Minimum caption:     11px (--font-size-xxs) — used sparingly

Never use text smaller than 11px in the application UI.
```

The interface uses `rem` units for all font sizes. Users who set a larger base font size in their browser will see Avenor scale correctly.

---

## 7. Reduced Motion

All animations respect the `prefers-reduced-motion: reduce` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 75ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 75ms !important;
  }
}
```

Specific substitutions:
- Page transitions: Remove translateY, keep opacity
- Card hover: Remove translateY(-1px), keep shadow change
- Chart animations: Disable draw-on animation, show final state immediately
- Skeleton shimmer: Replace with static placeholder color

---

## 8. Color Blindness Support

The status color system is designed to work for the most common forms of color blindness:

- **Deuteranopia (red-green):** All status badges include text labels. The pipeline chart uses text labels alongside bars.
- **Protanopia:** Same as above. The terracotta primary never relies on red-only perception.
- **Tritanopia:** Warning amber and success sage have enough lightness difference to remain distinguishable.

**Testing requirement:** All new visual features should be tested with a color blindness simulator (e.g., Coblis, Chrome DevTools).

---

## 9. Error Identification

Form errors must:
1. Be announced to screen readers (use `aria-live="polite"` or `aria-describedby`)
2. Include an icon (not color alone)
3. Be associated with the specific field (`aria-describedby`)
4. Provide specific correction guidance (not just "Error")

```
✅ "Password must be at least 8 characters"
❌ "Invalid"
```

---

## Accessibility Checklist (Per Component)

Before any component is considered complete:

- [ ] All interactive states are keyboard accessible
- [ ] Focus ring is visible and meets 3:1 contrast
- [ ] Color is never the sole indicator of state/meaning
- [ ] Screen reader labels are provided for all interactive elements
- [ ] Touch targets are ≥ 44px on mobile
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Error messages are associated with their fields
- [ ] Contrast ratios are verified for all text combinations
