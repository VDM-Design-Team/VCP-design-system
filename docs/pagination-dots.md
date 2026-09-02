# PaginationDots

Position dots for a carousel, an onboarding flow, a small stepper — places,
not addresses. The current dot stretches into a brand pill.

## When to use

| Use | For |
|---|---|
| `PaginationDots` | Positions the user moves through in order, few enough to count at a glance |
| `Pagination` | Addressable pages someone might name ("page 3 of 12") |
| `Tabs` | Peer views with names — if the positions have labels, they are tabs |

Past roughly eight dots the glance fails and the pattern stops working; that
is `Pagination`'s territory.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | required | — |
| `index` | `number` | required | 0-based, matching the export |
| `onChange` | `(index: number) => void` | — | **Omit for a passive indicator** — no buttons, no tab stops |
| `label` | `string` | `'Pages'` | The group's accessible name. Say what the pages are of — "Onboarding steps" |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The wrapping `<div>` |

## Tokens

Active pill `surface.brand.strong`; inactive dots `surface.neutral.strong`
(hover: `surface.neutral.stronger`) — **deliberately darker than the export's
slate-300**, because an unselected dot is a control with no text, so the 3:1
UI-graphic bar applies to the dot itself. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Active pill on `surface.base` | **6.18:1** | **6.33:1** |
| Inactive dot on `surface.base` | **4.76:1** | **9.85:1** |
| Inactive dot on `surface.canvas` | **4.55:1** | **12.02:1** |

Current-vs-rest is also carried by *shape* (the pill is 2.5× wider), so the
state never rides on hue alone.

## Accessibility

- The export gave these `role="tablist"` — removed. Nothing here owns panels;
  claiming tabs promises arrow-key semantics and `tabpanel` relationships that
  don't exist. They are a named `group` of buttons.
- Interactive: each dot is "Go to page N" with `aria-current` on the active
  one. Passive (`onChange` omitted): plain spans plus visually-hidden
  "`label`: N of M" — no dead tab stops.
- The buttons are small even with their padded hit areas — the pointer-dense
  exemption at its thinnest. **On touch surfaces, swipe is the mechanism and
  the dots are read-only confirmation**: prefer the passive form there.
- The width animation is transform-free layout at 200ms; it does not loop, so
  no reduced-motion branch is needed.

## Don't

- **Don't use dots for content with names.** Named positions are `Tabs`;
  numbered addresses are `Pagination`.
- **Don't render fifteen dots.** Past a glanceable count the pattern fails.
- **Don't make the dots the only way to move** — pair them with swipe or
  prev/next affordances; on touch, prefer passive dots beside real controls.
- **Don't wire `aria-live` announcements into the dots** — announce the slide
  change on the content region, where the change actually happens.
