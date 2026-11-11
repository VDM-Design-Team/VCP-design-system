# TeamCapacity

How a team's capacity for a cycle is spent, as one stacked bar: a title (with an optional hint), a line saying what is left, the bar with its total beside it, and a legend. Built to Figma's `Team_Capacity` (`4213:31447`).

## Composed of

| Piece | Tier |
|---|---|
| `LegendItem` | atom |
| `Skeleton` | atom |
| `CardHeader` | component |
| `CapacityBar` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TeamCapacity` | One bar for the whole team |
| `UserCapacity` | One bar per person |
| `CycleSummary` | How a cycle went (committed, completed, carried over, a completion rate) |
| `CapacityBar` | The bar alone, in a layout of your own |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `segments` | `CapacitySegment[]` | required | `{ series, value }`, see `CapacityBar`. The total and the legend follow from them |
| `title` | `string` | `Team Capacity` | The heading, and the region's name |
| `hint` | `string` | — | Explains the card, behind an info glyph (a real button, "About Team Capacity"). Omit it and there is no glyph |
| `remaining` | `number` | — | Points left: "60 points of capacity remaining this cycle." Leave it out and there is no line. It is the caller's to work out |
| `description` | `ReactNode` | — | A sentence of your own for that line; wins over `remaining` |
| `unit` | `string` | `pts` | After the total |
| `loading` | `boolean` | — | Placeholders and a status ("Loading Team Capacity"); the section is `aria-busy` |
| `className`, `ref` | | | On the section |

## It is data

Pass `segments`; the bar, the total ("180 pts") and the legend all follow from them, so the three cannot disagree. The legend lists **the series the data has**, in the system's order (Completed, Committed, Overdue, Available, Leave), each once. The colours are `CHART_SERIES`'s, shared with every chart (see `docs/capacity-bar.md`).

**It does no arithmetic beyond the sum.** What "remaining" is (capacity less committed? less completed?) is the product's to say, so the caller passes it.

**Empty:** no segments draws an empty track, "0 pts" and no legend.

## Layout and responsiveness

A container query, so it follows its card, not the viewport. The bar takes the width it is given, with the total beside it; the legend wraps and stays centred; the title truncates before it pushes the total out. The card is `surface.elevated`, `radius.md`, `space.24` all round, `space.16` between its parts.

## Tokens

| Part | Style | Colour |
|---|---|---|
| Title | `title-sm-semibold` | `text.primary` |
| Line | `body-sm-regular` | `text.primary` |
| Total | `label-sm-semibold` | `text.primary` |
| Info glyph | 16 (`InfoHint`, 40 press area) | `text.tertiary` |

## Accessibility

- A `section` named by its title ("Team Capacity, region").
- The bar is one image named by its values (see `docs/capacity-bar.md`); the legend is a list named "Legend", and each entry is its text.
- The info glyph is a real, focusable `button`, "About Team Capacity", (`InfoHint`, through `CardHeader`, wrapping the system `Tooltip`).
- Loading: the placeholders are hidden from assistive tech and one `status` says "Loading Team Capacity".

## Don't

- **Don't pass the total.** It is the sum of the segments.
- **Don't build a legend of your own.** It follows the data.
- **Don't use it for one person's rows.** That is `UserCapacity`.
