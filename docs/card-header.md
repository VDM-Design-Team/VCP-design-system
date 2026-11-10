# CardHeader

The head of a dashboard card: its **title** (the card's `h2`), an optional **info icon** that explains it, and an optional slot for **controls** on the right. The cards each drew this by hand, with slightly different gaps and heading wiring; this is the one version.

## Composed of

| Piece | Tier |
|---|---|
| `InfoHint` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CardHeader` | The top of a card on a dashboard: a title, and maybe a hint and a filter |
| `PageTitle` | The band of a whole page, not a card |
| `InfoHint` | An info icon beside a label that is not a card title (a stat's label) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | The card's `h2`. One line; it truncates |
| `headingId` | `string` | — | The `h2`'s `id`, for the card's `aria-labelledby` |
| `headingRef` / `headingTabIndex` | `Ref` / `number` | — | For a card that moves focus to its heading: `-1` makes it focusable by code without a tab stop (and drops the focus outline) |
| `hint` | `string` | — | What the info icon explains. Omit it and there is no icon |
| `hintLabel` | `string` | the title | What the icon is named "About ..." when the title is not plain text |
| `actions` | `ReactNode` | — | Controls on the right: a filter, a period picker, a button |
| `className` | `string` | | Merged on the `header`: the spacing under it is the card's (`mb-3`, or its own `gap`) |

## Layout

The title and its hint are one group (the hint 4 from the title, a 16 `InfoHint`); the controls are right-aligned with 12 between them. The row wraps: in a narrow card the controls drop under the title rather than squeezing it, and a long title truncates.

## Tokens

The title is `title-sm` semibold in `text.primary`; the hint is `InfoHint`'s (`text.tertiary`). No spacing of its own below the header.

## Accessibility

- The title is an `h2`; give it an `id` and point the card's `aria-labelledby` at it, so the card is a region named by what it says.
- The info icon is a real button named "About {title}" with the tooltip on hover and focus (see `InfoHint`).
- A `headingTabIndex` of `-1` lets a card send focus to its heading (after a dismissal, say) without making it a tab stop.

## Don't

- Don't draw a card's title by hand; use this.
- Don't put the page's `h1` here: that is `PageTitle`.
- Don't put anything the person must read in the hint; it is optional and can be missed.
