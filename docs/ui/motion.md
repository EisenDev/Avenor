# Motion & Animation

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Philosophy

Motion in Avenor is **subtle and purposeful**. Every animation communicates meaning — not entertainment. Animations tell the user: "this appeared", "this changed", "this is loading", "this is responding to you."

> **The test:** If an animation takes attention away from the content, it's wrong. The user should feel the animation, not see it.

Premium motion is *fast*. Slow, elaborate animations feel cheap. Avenor's micro-interactions complete in under 200ms. Larger transitions complete in under 400ms.

---

## Duration Tokens

| Token | Value | Used For |
|---|---|---|
| `--duration-instant` | 75ms | Color changes, checked states |
| `--duration-fast` | 120ms | Button hover, icon swap |
| `--duration-normal` | 200ms | Most transitions, input focus |
| `--duration-slow` | 300ms | Panel open/close, sidebar expand |
| `--duration-slower` | 400ms | Page-level transitions |
| `--duration-slowest` | 600ms | Loading sequences, data reveal |

---

## Easing Tokens

| Token | Value | Feel | Used For |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Decelerates to stop | Entrances — element appears |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerates to exit | Exits — element disappears |
| `--ease-inout` | `cubic-bezier(0.4, 0, 0.2, 1)` | Ease in + ease out | State changes, position moves |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Slight overshoot | Playful micro (checkbox check) |

---

## Animation Catalog

### Hover States

**Buttons**
```
transition: background-color, box-shadow
duration: --duration-fast (120ms)
easing: --ease-out
```
The background tints darker. Shadow increases slightly. No scale change.

**Cards**
```
transition: box-shadow, transform
duration: --duration-normal (200ms)
easing: --ease-out
transform: translateY(-1px)
shadow: --shadow-sm → --shadow-hover
```
A card lifts 1px and gains the warm terracotta shadow tint. Imperceptible but makes the interface feel alive.

**Sidebar Navigation Items**
```
transition: background-color, color
duration: --duration-fast (120ms)
easing: --ease-inout
```
Background tints to `--color-hover-bg`. No movement.

**Icon Buttons**
```
transition: background-color
duration: --duration-fast (120ms)
easing: --ease-out
```
Background appears on hover. No scale, no rotation.

---

### Entrance Animations

**Dashboard cards (on page load)**
```
Initial: opacity: 0, translateY: 8px
Final: opacity: 1, translateY: 0
duration: --duration-slow (300ms)
easing: --ease-out
stagger: 50ms per card
```
Cards fade in slightly from below on initial page load. Staggered so the page feels composed, not jarring.

**Dropdown / Popover open**
```
Initial: opacity: 0, scale: 0.97, translateY: -4px
Final: opacity: 1, scale: 1, translateY: 0
duration: --duration-normal (200ms)
easing: --ease-out
```

**Modal / Dialog open**
```
Backdrop: opacity 0 → 0.32, duration: --duration-normal (200ms)
Panel: opacity 0, scale 0.96 → 1, translateY 12px → 0
Panel duration: --duration-slow (300ms)
Panel easing: --ease-out
```

**Drawer / Side sheet open (right)**
```
Initial: translateX: 100%
Final: translateX: 0
duration: --duration-slow (300ms)
easing: --ease-out
```

**Toast notification enter**
```
Initial: opacity: 0, translateY: 16px, scale: 0.96
Final: opacity: 1, translateY: 0, scale: 1
duration: --duration-slow (300ms)
easing: --ease-spring
```
The spring easing gives toast a satisfying pop-in.

---

### Exit Animations

All exits are ~60–70% of the entrance duration (exits should feel quicker):

**Dropdown close:**
```
opacity: 1 → 0, scale: 1 → 0.97
duration: --duration-fast (120ms)
easing: --ease-in
```

**Modal close:**
```
opacity: 1 → 0, scale: 1 → 0.96
duration: --duration-normal (200ms)
easing: --ease-in
```

**Toast dismiss:**
```
opacity: 1 → 0, translateY: 0 → -8px
duration: --duration-fast (120ms)
```

---

### State Change Animations

**Checkbox / Radio check**
```
Check mark: stroke-dashoffset animation
duration: --duration-fast (120ms)
easing: --ease-spring
```

**Toggle / Switch**
```
Thumb translation: 200ms, ease-out
Background color: 120ms, ease-out
```

**Badge status change**
```
Cross-fade opacity
duration: --duration-normal (200ms)
```

**Stat card number update**
```
Count-up animation from previous value to new
duration: --duration-slower (400ms)
easing: linear
```

---

### Loading States

**Skeleton loader**
```
Shimmer animation: translateX(-100%) → translateX(100%)
background: linear-gradient(90deg, --color-muted, --color-surface, --color-muted)
duration: 1400ms
easing: linear
repeat: infinite
```

**Spinner (circular)**
```
rotation: 0 → 360deg
duration: 800ms
easing: linear
repeat: infinite
```

**Button loading state**
```
Replace label with spinner
No layout shift (same button dimensions)
duration: instant (no animation on the state change itself)
```

---

### Charts

**Line chart data draw**
```
stroke-dashoffset: full length → 0
duration: --duration-slowest (600ms)
easing: --ease-out
delay: 200ms (after page load)
```

**Bar chart bars grow**
```
height/scaleY: 0 → final value
duration: --duration-slower (400ms)
easing: --ease-out
stagger: 30ms per bar
transform-origin: bottom
```

**Donut / pie chart draw**
```
stroke-dashoffset animation
duration: --duration-slowest (600ms)
easing: --ease-out
```

---

### Page Transitions

```
Exit: opacity: 1 → 0, translateY: 0 → -8px
      duration: 150ms, ease-in

Enter: opacity: 0 → 1, translateY: 8px → 0
       duration: 200ms, ease-out
```

---

## Reduced Motion

**Always respect `prefers-reduced-motion: reduce`.**

When this media query is active:
- Disable all `translateY` / `translateX` animations
- Disable scale transforms
- Reduce all durations to `--duration-instant` (75ms)
- Keep opacity transitions (they communicate state without movement)
- Keep color transitions (they communicate state without movement)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 75ms !important;
    transition-duration: 75ms !important;
    animation-iteration-count: 1 !important;
    transform: none !important;
  }
}
```

---

## Motion Rules

- ✅ All transitions use defined duration and easing tokens
- ✅ Entrances use `--ease-out`; exits use `--ease-in`
- ✅ All animations respect `prefers-reduced-motion`
- ✅ Stagger delays are 30–60ms between elements
- ❌ No animations over 600ms on productive surfaces
- ❌ No bouncing, spinning, or attention-seeking animations
- ❌ No autoplay animations that loop indefinitely in the dashboard
- ❌ No layout-shifting animations (elements should not push other content while animating)
