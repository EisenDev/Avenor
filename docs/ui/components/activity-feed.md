# Activity Feed & Timeline

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

The activity feed surfaces recent events — emails received, status changes, interviews scheduled — in a chronological, scannable list. It appears in the dashboard "Recent Email Activity" panel and on application detail pages.

---

## Email Activity Feed (Dashboard)

Observed in the mockup — right column, below AI Assistant.

### Feed Item Anatomy

```
┌──────────────────────────────────────────────────────────┐
│  [Company  ]  Interview Invitation      2m ago           │
│  [Logo 32px]  Acme Corporation                          │
└──────────────────────────────────────────────────────────┘

Row height:   ~56px
Padding:      12px 0px (no horizontal padding — card edges handle it)
Separator:    1px solid --color-border-subtle between items

Left: Company logo / avatar (32px, --radius-sm)
Center: 
  Top line: Email subject/classification (--font-size-sm, --font-weight-medium, primary text)
  Bottom line: Company name (--font-size-xs, secondary text)
Right: 
  Timestamp (--font-size-xs, --color-text-secondary)
  "2m ago", "1h ago", "1d ago"
```

### Classification Badge

Each email item has a classification badge:

```
"Interview Invitation" → --color-info-subtle + --color-info text
"Assessment Invite"    → --color-warning-subtle + --color-warning text  
"Rejection"           → --color-danger-subtle + --color-danger text
"Offer Received"      → --color-success-subtle + --color-success text

Badge appears at top-right of the item OR inline with company logo
```

---

## Application Timeline (Detail Page)

On the application detail page, a vertical timeline shows all events for that application.

### Timeline Item

```
[Date label — left]
     |
[●]──┤──[Event card]
     |
[●]──┤──[Event card]

Timeline line:   2px solid --color-border (#E9E3DA)
Dot:             8px circle, background matches event type
  Applied:       --color-primary
  Interview:     --color-info
  Email:         --color-secondary
  Status change: --color-warning
  Offer:         --color-success
  Rejection:     --color-danger

Date column:     --font-size-xs, --color-text-secondary, right-aligned
Event card:      Standard card, slightly compact padding (16px)
```

### Timeline Event Types

| Event | Dot Color | Icon | Description |
|---|---|---|---|
| Applied | `--color-primary` | `Briefcase` | Application submitted |
| Email received | `--color-info` | `Mail` | Relevant email arrived |
| Interview scheduled | `--color-secondary` | `Calendar` | Interview confirmed |
| Status change | `--color-warning` | `ArrowRight` | Application status updated |
| Note added | `--color-text-secondary` | `FileText` | User added a note |
| Offer received | `--color-success` | `Star` | Offer extended |
| Rejected | `--color-danger` | `X` | Application rejected |

---

## Upcoming Interviews List (Dashboard)

Top-left card on the dashboard — shows the next 3–5 upcoming interviews.

### List Item Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│  [A] Acme Corporation                    Jul 18, 2026        │
│      Senior Frontend Engineer            2:00 PM · Google Meet│
│                                          + 2more  [⋯]        │
└──────────────────────────────────────────────────────────────┘

Left: Company logo (32px avatar, --radius-sm, with company letter fallback)
Center:
  Company name: --font-size-sm, --font-weight-semibold, primary
  Role: --font-size-xs, --color-text-secondary
Right:
  Date: --font-size-xs, --font-weight-medium, primary
  Time · Location: --font-size-xs, --color-text-secondary
  "+ N more" tag: if multiple rounds same day

Action (⋯):
  Appears on hover, right edge
  Three dots → context menu (View, Add note, Reschedule)
```

---

## "View all →" Link

Each feed card has a footer link:

```
Text:   "View all interviews →" / "View all emails →"
Font:   --font-size-sm (14px), --font-weight-medium
Color:  --color-primary (#B56A45)
Arrow:  ChevronRight icon (--icon-sm, 14px) or → text
Alignment: Left-aligned, card footer
Border-top: 1px solid --color-border-subtle
Padding-top: --spacing-4 (16px)

Hover:
  Color: --color-primary-hover
  Text underline: visible
```

---

## Rules

- ✅ Always show relative timestamps ("2m ago", "1h ago", "2d ago")
- ✅ Company logos with graceful fallback to colored initials
- ✅ Color + icon + text for event type (never color alone)
- ✅ "View all" link present when items are truncated
- ❌ Never show more than 5 items in a dashboard card feed
- ❌ Never omit timestamps from feed items
- ❌ Never use the full timestamp in dashboard feeds (use relative time)
