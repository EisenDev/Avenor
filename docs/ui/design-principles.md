# Design Principles

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Overview

These principles govern every design decision in Avenor. They are not guidelines — they are rules. When two design choices conflict, these principles are the tiebreaker. Every component, every layout, every motion decision must be defensible against these principles.

---

## Principle 1: Content Is the Interface

**"The best interface is no interface."**

The data — your applications, your interviews, your offers — is the interface. Navigation, chrome, buttons, and borders exist only to make the data accessible. They should never call attention to themselves.

**Applied to Avenor:**
- The sidebar is quiet: low-contrast items, no aggressive borders
- Cards have minimal chrome: hairline borders, barely-there shadows
- Page backgrounds are warm neutrals that make white cards float naturally
- Empty states are calm and constructive, never apologetic

**Test:** Cover the content. If what remains is beautiful, something is wrong.

---

## Principle 2: Whitespace Is a Feature

**"Space is as important as what fills it."**

Generous spacing is the hallmark of premium software. Cluttered interfaces signal anxiety. Avenor users are already managing a stressful process — the interface should not add to it.

**Applied to Avenor:**
- Minimum 24px internal card padding
- 32px page-level margins
- 48px between major dashboard sections
- 4px base grid — no exceptions

**Test:** If you feel the urge to "fit more in," add whitespace instead.

---

## Principle 3: Hierarchy Through Scale, Not Color

**"Use size to lead the eye. Use color to confirm meaning."**

Visual hierarchy in Avenor is established primarily through **typographic size and weight**, not color contrast. Color is used for semantic meaning (status, state, brand) — not to create visual priority.

**Applied to Avenor:**
- Page title (32px, bold) > Section heading (17px, semibold) > Body (15px, regular)
- Status badges are colored for meaning; their size signals they are secondary
- The primary CTA (terracotta) is the only strong color on any given screen

**Test:** Desaturate the screen. Can you still understand the hierarchy? If yes, good. If not, the hierarchy depends too much on color.

---

## Principle 4: One Primary Action Per View

**"Make the right thing obvious. Make everything else possible."**

Every screen in Avenor has at most one primary action — one terracotta button. Supporting actions are ghosts, links, or secondary buttons. Users should never have to choose between two equally-weighted options.

**Applied to Avenor:**
- Dashboard: `+ Add Application` is the one primary button
- Application form: `Create Application` is the one primary button
- Email connection: `Connect Gmail` is the one primary button

**Test:** Can you identify the primary action in under 2 seconds?

---

## Principle 5: Warm, Never Cold

**"The interface should feel like a warm, well-organized desk — not a control room."**

Every color, spacing, and material choice should reinforce warmth. This means:
- Warm off-white backgrounds (`#FAF8F5`), never pure white pages
- Terracotta as the brand color, never electric blue or purple
- Soft shadows with warm tints, never hard gray shadows
- Rounded corners (16px) on cards, never sharp corners
- Sans-serif with humanist curves, never ultra-geometric

**Applied to Avenor:**
- The page background is `#FAF8F5` — it has a bone/linen quality
- The sidebar background is `#F4F1EC` — slightly warmer and deeper
- Even danger states use a soft rose (`#E07A7A`) rather than aggressive red

**Test:** Does the screen feel like it would fit in a calm home office? Or does it feel like a Bloomberg terminal?

---

## Principle 6: Consistent Over Creative

**"Design systems work because they are boring."**

Every card looks the same. Every button follows the same pattern. Every form field behaves the same way. Consistency means users only need to learn things once.

**Applied to Avenor:**
- Only one card style exists (with defined variants for stat, content, auth)
- All primary buttons are `--radius-md`, `--color-primary`, `--font-weight-semibold`
- All modals animate the same way
- All status badges use the exact same color table

**Test:** Would a developer know which component to use without looking it up? If not, there are too many variants.

---

## Principle 7: Everything Has Purpose

**"If you can't explain why it's there, it shouldn't be there."**

No decorative borders. No gradient backgrounds for their own sake. No icons that don't add meaning. Every element in Avenor has a specific, defensible reason to exist.

**Applied to Avenor:**
- Sidebar dividers separate navigation groups — functional
- Card shadows differentiate cards from the background — functional
- The terracotta color on active sidebar items communicates "you are here" — functional
- The plant illustrations on the landing page communicate warmth and growth — functional (brand)

**Test:** Challenge every design element: what does removing this element break? If nothing, remove it.

---

## Principle 8: Accessible by Default

**"If a screen reader user can't use it, it's not finished."**

Accessibility is not a feature added at the end. It is designed in from the beginning.

**Applied to Avenor:**
- All text has minimum 4.5:1 contrast ratio
- All interactive elements are keyboard-navigable
- All form elements have labels
- All icon buttons have `aria-label`
- All status information is conveyed through text, not color alone
- All animations respect `prefers-reduced-motion`

**Test:** Tab through the entire screen using only a keyboard. Is everything reachable and usable?

---

## Principle 9: Speed Is a Design Feature

**"Fast interfaces feel good. Slow interfaces feel broken."**

Every animation completes in under 300ms on productive surfaces. Skeleton loaders appear instead of spinners where possible. Optimistic UI is used for mutations that are unlikely to fail.

**Applied to Avenor:**
- Button hover: 120ms
- Dropdown open: 200ms
- Modal open: 300ms
- Skeleton loaders for all data-fetching states

**Test:** Does any transition feel slow? If you notice it, it's too slow.

---

## Principle 10: Soft Contrast

**"Maximum contrast is not optimal contrast."**

`#000000` on `#FFFFFF` is jarring. Avenor uses near-black (`#222222`) on warm white (`#FAF8F5`) — sufficient contrast, without visual harshness. Secondary text (`#6B7280`) creates a gentle second tier without shouting.

**Applied to Avenor:**
- Primary text: `#222222` (not black)
- Page background: `#FAF8F5` (not white)
- Borders: `#E9E3DA` (warm, not gray)
- Secondary text: `#6B7280` (warm gray, not pure gray)

**Test:** Can you read everything comfortably after 30 minutes? If your eyes feel strained, contrast is wrong.
