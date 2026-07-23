# Border System

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Philosophy

Borders in Avenor are hairlines, not walls. They define edges quietly — they should never dominate the visual field. The warm border color (`#E9E3DA`) is calibrated to be perceptible but not prominent.

---

## Border Width Tokens

| Token | Value | Usage |
|---|---|---|
| `--border-width-hairline` | `1px` | Standard — all UI borders |
| `--border-width-thick` | `2px` | Active indicators, focus accents |

No other border widths exist in the system.

---

## Border Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--border-color` | `#E9E3DA` | Default border for all components |
| `--border-color-strong` | `#D4CDBF` | Emphasized, dividers in tight layouts |
| `--border-color-subtle` | `#F0ECE6` | Very subtle — row dividers inside cards |
| `--border-color-hover` | `#C8BFB3` | Hovered inputs and cards |
| `--border-color-focus` | `#B56A45` | Focus ring border (terracotta) |
| `--border-color-primary` | `#B56A45` | Active state border accent |
| `--border-color-danger` | `#E07A7A` | Error state border |
| `--border-color-success` | `#7ABF73` | Success state border |

---

## Application by Component

| Component | Border |
|---|---|
| Cards | `1px solid --border-color` |
| Inputs (default) | `1px solid --border-color` |
| Inputs (hover) | `1px solid --border-color-hover` |
| Inputs (focus) | `1px solid --border-color-focus` |
| Inputs (error) | `1px solid --border-color-danger` |
| Sidebar | Right: `1px solid --border-color` |
| Header | Bottom: `1px solid --border-color` |
| Table header | Bottom: `1px solid --border-color-strong` |
| Table rows | Bottom: `1px solid --border-color-subtle` |
| Dropdowns | `1px solid --border-color` |
| Modals | `1px solid --border-color` |
| Divider lines | `1px solid --border-color-subtle` |
| Active nav indicator | Left: `2px solid --color-primary` (if using left border pattern) |
| Selected card | Left: `3px solid --color-primary` |

---

## Rules

- ✅ All borders use `1px` (hairline) or `2px` (thick) — no other widths
- ✅ Border colors always come from the token table above
- ✅ Borders change color on state changes (hover, focus, error)
- ❌ Never use `3px` borders except for selected card left accent
- ❌ Never use `border: 0` to remove borders — use `--border-color-subtle` to make them invisible
- ❌ No double borders (border + outline at the same time)
- ❌ No dashed or dotted borders (except internal chart gridlines)
