# AnnouncementsOverview *(pattern)*

The top of the Announcements tab: a title card and three facts under it. Built to Figma's `_Announcements_Title`
(`Announcement Title Card` and `Metrics`).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `MetricTile` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AnnouncementsOverview` | The head of the Announcements tab |
| `MetricTile` | The same tile anywhere else |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` / `description` | `string` | `Announcements` / `View and manage announcements` | The title card's words |
| `total` | `number \| string` | required | "Total Announcements" |
| `latestVersion` | `string` | required | As it reads: "v1.18.1" |
| `lastUpdated` | `string` | required | **Already formatted**: "May 20, 2026" |

It shows what it is given: the caller counts, finds the newest version and formats the date.

## Layout

The title card, then three tiles of equal width. They stack when the **container** is narrow (a container query, not the viewport's).

## Tokens

Both cards are `surface.elevated`, `radius.md`, `space.32`; the title is `heading-lg-bold`, the description `body-md-regular` `text.tertiary`;
the megaphone is `text.brand.medium`.

## Accessibility

- A `section` named by the title; the title is an `h2`. The icons are decoration.

## Don't

- **Don't compute the numbers here.** Pass them in.
