# MetricTile *(component)*

One number with its name and a tinted icon tile: "Total Announcements 11". The quiet settings-page tile, built to Figma's
`Announcement Total` / `Latest Version` / `Last Updated` tiles.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MetricTile` | A short row of facts about one thing, on a settings page |
| `StatCard` | A dashboard KPI: a stripe, a 32 value, a unit and a hint |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` | `IconName` | required | In the tinted tile; decorative |
| `tone` | `info \| success \| brand` | `info` | Tints the icon tile. Decoration, not status |
| `label` | `ReactNode` | required | What the value is |
| `value` | `ReactNode` | required | **Text**, formatted by the caller ("11", "v1.18.1", "May 20, 2026") |

## Tokens

`surface.elevated` card, `radius.md`, `space.32` padding, `space.16` gap. The icon tile is 44 square, `radius.sm`: `info` is
`accent.info.tonal`, `success` is `accent.success.tonal`, `brand` is `surface.brand.base` with `text.brand.medium`. Label `label-md-medium`
`text.tertiary`; value `heading-md-bold` `text.primary`.

**Differences from Figma, on purpose.** Figma's third tile (Last Updated) is a purple that no token names; it is `brand` here until
design picks a colour (a question for design).

## Accessibility

- The icon tile is `aria-hidden`; the label and value are plain text, so nothing depends on the tint.

## Don't

- **Don't use it for a dashboard KPI.** That is `StatCard`.
- **Don't pass a number to format.** Pass the text you want read.
