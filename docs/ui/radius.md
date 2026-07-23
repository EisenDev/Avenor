# Border Radius System

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Philosophy

Avenor's radius scale is **soft but not bubbly**. Corners have enough rounding to feel warm and approachable, but not so much that they feel playful or childish. The system avoids the sharp corners of hardcore "industrial" design and avoids the full-round softness of consumer apps.

The radius communicates hierarchy — smaller elements have smaller radius, larger containers have larger radius.

---

## Radius Scale

| Token | Value | Description |
|---|---|---|
| `--radius-none` | `0px` | Sharp — tables, horizontal rule dividers |
| `--radius-xs` | `4px` | Micro — badges, status dots, inline chips |
| `--radius-sm` | `6px` | Small — inputs, select fields, small buttons |
| `--radius-md` | `8px` | Default — standard buttons, dropdowns, tooltips |
| `--radius-lg` | `12px` | Large — panels, side sheets, small cards |
| `--radius-xl` | `16px` | XLarge — dashboard cards (primary card radius) |
| `--radius-2xl` | `20px` | XXLarge — modals, dialogs, auth card |
| `--radius-full` | `9999px` | Full — avatar circles, pill badges, toggles |

---

## Per-Component Radius

| Component | Token | Value |
|---|---|---|
| **Dashboard card** | `--radius-xl` | 16px |
| **Stat card** | `--radius-xl` | 16px |
| **Auth / sign-up card** | `--radius-2xl` | 20px |
| **Modal / dialog** | `--radius-2xl` | 20px |
| **Primary button** | `--radius-md` | 8px |
| **Secondary button** | `--radius-md` | 8px |
| **Small button / icon button** | `--radius-sm` | 6px |
| **Text input** | `--radius-sm` | 6px |
| **Select / dropdown trigger** | `--radius-sm` | 6px |
| **Dropdown menu** | `--radius-md` | 8px |
| **Badge / status tag** | `--radius-xs` | 4px |
| **Pill badge** | `--radius-full` | 9999px |
| **Avatar** | `--radius-full` | 9999px |
| **Company logo** | `--radius-sm` | 6px |
| **Toggle / switch** | `--radius-full` | 9999px |
| **Progress bar** | `--radius-full` | 9999px |
| **Sidebar nav item (active)** | `--radius-md` | 8px |
| **Tooltip** | `--radius-sm` | 6px |
| **Calendar cell** | `--radius-sm` | 6px |
| **Toast notification** | `--radius-md` | 8px |
| **Table rows** | `--radius-none` | 0px |
| **Table container** | `--radius-lg` | 12px |
| **Search input** | `--radius-md` | 8px |
| **Command palette** | `--radius-xl` | 16px |

---

## Visual Hierarchy Through Radius

```
Largest containers → Largest radius
   Modal (--radius-2xl: 20px)
     Card (--radius-xl: 16px)
       Button (--radius-md: 8px)
         Input (--radius-sm: 6px)
           Badge (--radius-xs: 4px)
```

This creates visual nesting — you can tell at a glance that a card contains a button, not the other way around.

---

## Rules

- ✅ Always use a token — never write raw pixel values for radius
- ✅ Larger components always have equal or larger radius than components inside them
- ✅ Pill badges and avatars always use `--radius-full`
- ❌ Never use `border-radius: 50%` for non-circular elements
- ❌ Never apply the same radius to a table row (tables use `--radius-none` on rows, `--radius-lg` on the table wrapper)
- ❌ Avoid `--radius-2xl` on small elements — it will look like a full circle
