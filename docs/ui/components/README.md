# Component Library Index

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Overview

This directory contains detailed documentation for every UI component in Avenor. Each component document defines: purpose, anatomy, variants, states, spacing, accessibility, and token reference.

**Every component must:**
1. Use only design tokens (no hardcoded values)
2. Follow the defined variants (no ad-hoc styling)
3. Be accessible (keyboard, screen reader, color blind)
4. Handle all documented states (loading, empty, error, disabled)

---

## Component Index

| Component | File | Status | Description |
|---|---|---|---|
| Buttons | [`buttons.md`](./buttons.md) | ✅ Complete | Primary, secondary, ghost, destructive, icon, social auth |
| Cards | [`cards.md`](./cards.md) | ✅ Complete | Content, stat, metric, list item, auth, AI panel |
| Inputs | [`inputs.md`](./inputs.md) | ✅ Complete | Text, textarea, search, select, checkbox, radio, toggle |
| Sidebar | [`sidebar.md`](./sidebar.md) | ✅ Complete | App navigation sidebar |
| Navbar / Header | [`navbar.md`](./navbar.md) | ✅ Complete | Dashboard header, marketing nav |
| Badges | [`badges.md`](./badges.md) | ✅ Complete | Status badges, pill badges, count, BETA tag |
| Stat Cards | [`stat-cards.md`](./stat-cards.md) | ✅ Complete | Dashboard KPI cards |
| Charts | [`charts.md`](./charts.md) | ✅ Complete | Line, pipeline bar, donut, tooltips |
| Activity Feed | [`activity-feed.md`](./activity-feed.md) | ✅ Complete | Email feed, timeline, upcoming list |
| Dialogs | [`dialogs.md`](./dialogs.md) | ✅ Complete | Modal, confirmation, form, drawer |
| Tables | [`tables.md`](./tables.md) | ✅ Complete | Data tables, sorting, pagination |
| Forms | [`forms.md`](./forms.md) | 🔲 Pending | Form layout, fieldsets, validation |
| Alerts | [`alerts.md`](./alerts.md) | 🔲 Pending | Banner alerts, inline messages, toasts |
| Dropdowns | [`dropdowns.md`](./dropdowns.md) | 🔲 Pending | Menu dropdown, command palette |
| Avatars | [`avatars.md`](./avatars.md) | 🔲 Pending | User avatars, company logos |
| Navigation | [`navigation.md`](./navigation.md) | 🔲 Pending | Tabs, breadcrumbs |

---

## Completed Components Summary

### Buttons
5 variants: Primary (terracotta CTA), Secondary (outlined), Ghost (text-only), Destructive (danger), Icon Button.
3 sizes: sm (30px), md (38px), lg (46px).

### Cards
5 variants: Default content, Stat (KPI), Metric, Application list item, Auth.
16px radius, white background, hairline border, subtle shadow.

### Inputs
7 types: Text, Textarea, Search, Select, Checkbox, Radio, Toggle.
6 states per input: Default, Hover, Focus, Filled, Error, Disabled.

### Sidebar
Fixed 220px. Active state: terracotta text + background + bold icon stroke.
Nav items: 36px height, 8px radius, 4px vertical gap.

### Badges
Application status colors (Applied/Screening/Interview/Offer/Rejected/Ghosted).
3 shapes: Rectangle (4px), Pill (full), Count (navigation).

### Charts
Recharts only. Terracotta primary, sage secondary, warm axis.
Line chart, horizontal pipeline bar, donut.

---

## Pending Component Tracking

The following components are documented as stubs. Detailed docs should be written before implementation of the corresponding feature:

| Component | Required For | Priority |
|---|---|---|
| Forms | Application create, Settings | High |
| Alerts | System notifications, inline errors | High |
| Dropdowns | Filter menus, context menus | High |
| Avatars | Header user panel, application rows | Medium |
| Navigation | Tabs for application detail page | Medium |

---

## shadcn/ui Mapping

Avenor uses shadcn/ui as the component primitive layer. This table maps Avenor design component names to shadcn/ui primitives:

| Avenor Component | shadcn/ui Base |
|---|---|
| Button | `Button` |
| Text Input | `Input` |
| Textarea | `Textarea` |
| Select | `Select` |
| Checkbox | `Checkbox` |
| Radio | `RadioGroup` |
| Toggle | `Switch` |
| Modal | `Dialog` |
| Drawer | `Sheet` |
| Dropdown | `DropdownMenu` |
| Command Palette | `Command` |
| Toast | `Sonner` (or `Toast`) |
| Tooltip | `Tooltip` |
| Badge | `Badge` |
| Avatar | `Avatar` |
| Progress | `Progress` |
| Tabs | `Tabs` |
| Calendar | `Calendar` |
| Popover | `Popover` |

All shadcn/ui primitives are **styled to match design tokens** — no default shadcn styling is used directly. The components are customized via `globals.css` CSS variables that map to Avenor's design token values.
