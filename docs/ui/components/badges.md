# Badges & Status Tags

> **Document Owner:** Design Team
> **Last Updated:** 2026-07-14
> **Status:** Active — Source of Truth

---

## Purpose

Badges communicate status, category, and counts in compact inline form. They appear in pipeline views, application rows, email feeds, and sidebar navigation. Their color communicates meaning immediately — before the user reads the label.

---

## Anatomy

```
[Icon?] Label Text
↑ Padding: --spacing-1 --spacing-2 (4px 8px)
↑ Radius: --radius-xs (4px) for status tags
↑ Radius: --radius-full (9999px) for pills
↑ Font: --font-size-xs (12px), --font-weight-medium (500)
```

---

## Application Status Badges

The most prominent badge usage in Avenor — every application has a status badge.

| Status | Background | Text | Token (bg) | Token (text) |
|---|---|---|---|---|
| Wishlist | `#F0ECE6` | `#6B7280` | `--color-muted` | `--color-text-secondary` |
| Applied | `#FAF0EB` | `#B56A45` | `--color-primary-subtle` | `--color-primary` |
| Screening | `#EBF4FB` | `#6EA8D7` | `--color-info-subtle` | `--color-info` |
| Interviewing | `#EEF6EC` | `#7ABF73` | `--color-secondary-subtle` | `--color-secondary` |
| Offer | `#FBF4E8` | `#D6A25E` | `--color-warning-subtle` | `--color-warning` |
| Accepted | `#EDF7EE` | `#6BBF71` | `--color-success-subtle` | `--color-success` |
| Rejected | `#FCEEED` | `#E07A7A` | `--color-danger-subtle` | `--color-danger` |
| Ghosted | `#F4F1EC` | `#B0ABA4` | `--color-surface` | `--color-text-disabled` |

---

## Badge Variants

### Status Badge (Rounded Rectangle)

```
Radius:   --radius-xs (4px)
Padding:  4px 8px (--spacing-1 --spacing-2)
Font:     --font-size-xs (12px), --font-weight-medium
Height:   22px
```

Used for: Application status, interview type, document type.

---

### Pill Badge

```
Radius:   --radius-full (9999px)
Padding:  3px 10px
Font:     --font-size-xs (12px), --font-weight-medium
Height:   20px
```

Used for: Email classification tags ("Interview Invite", "Rejection"), nav unread count.

---

### Count Badge (Navigation)

Sidebar unread counts (e.g., Emails):

```
Background:   --color-primary (#B56A45)
Text:         --color-text-inverse (#FFFFFF)
Font:         --font-size-xxs (11px), --font-weight-semibold
Radius:       --radius-full
Padding:      2px 6px
Min-width:    18px
Max:          "99+"
```

---

### "BETA" Tag

Appears next to the AI Assistant section header:

```
Background:   --color-primary-subtle (#FAF0EB)
Text:         --color-primary (#B56A45)
Font:         --font-size-xxs (11px), --font-weight-semibold
Letter spacing: --letter-spacing-widest (0.08em)
Text transform: UPPERCASE
Radius:       --radius-xs (4px)
Padding:      2px 6px
```

---

### Email Classification Badges

```
Interview Invitation:   --color-info-subtle + --color-info text
Assessment Invite:      --color-warning-subtle + --color-warning text
Rejection:              --color-danger-subtle + --color-danger text
Offer:                  --color-success-subtle + --color-success text
```

---

## Dot Indicators

Small status dots (without text) for compact row indicators:

```
Size:     8px × 8px
Radius:   --radius-full
Position: Inline before text, vertically centered

Colors:
  Online/Active:    --color-success (#6BBF71)
  Offline:          --color-text-disabled (#B0ABA4)
  Warning:          --color-warning (#D6A25E)
  Error:            --color-danger (#E07A7A)
```

---

## Rules

- ✅ Badge color always carries semantic meaning from the status table
- ✅ Badge text matches the exact status label from the product spec
- ✅ Pill shape for counters; rectangular for status
- ✅ Count badges max at "99+"
- ❌ Never invent new status badge colors — use the table
- ❌ Never use bold font weight in badges (medium only)
- ❌ Never truncate status text in badges — use shorter labels if needed

---

## Token Reference

| Property | Token |
|---|---|
| Font | `--font-size-xs`, `--font-weight-medium` |
| Radius (status) | `--radius-xs` |
| Radius (pill) | `--radius-full` |
| Padding | `--spacing-1 --spacing-2` |
| Status backgrounds | See status table above |
| Status text colors | See status table above |
