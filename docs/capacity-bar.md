# CapacityBar

One stacked bar of how a capacity is spent: Completed, Committed, Overdue, Available, Leave. The bar inside Figma's `Team_Capacity` and `User_Capacity`. It draws the bar and nothing else; the title, total and legend are the cards' (`TeamCapacity`, `UserCapacity`).

## Composed of

| Piece | Tier |
|---|---|

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CapacityBar` | A stacked bar of a total split into the five series |
| `TeamCapacity` | The team's bar in a card, with its total and legend |
| `UserCapacity` | A row per person, with one legend |
| `ProgressBar` | One value out of a total (a single meter) |
| `DonutChart` | A single rate as a ring |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `segments` | `{ series, value }[]` | required | `series` is `completed`, `committed`, `overdue`, `available` or `leave`. Drawn in the order given, **sized by value**. A value of 0, a negative one or `NaN` is not drawn |
| `label` | `string` | — | What the bar is a bar of, for its text alternative ("Team capacity", "John") |
| `unit` | `string` | `pts` | The unit in the text alternative |
| `size` | `md \| sm` | `md` | 28 (the team bar) or 24 (a row in a list of people) |
| `className`, `ref`, `style` | | | On the track |

`capacityTotal(segments)` is the sum of the drawn segments; `capacityDescription(segments, unit, label)` is the string the bar is named by.

## It is data

It has no width of its own: it fills what it is given, so it is as responsive as its parent. Segments are sized by value (`flex-grow`), so 60 / 30 / 30 / 60 and 6 / 3 / 3 / 6 draw the same. The caller supplies the values; the bar adds nothing up except the total in its text alternative.

**A segment writes its number on itself** (14 semibold, in the series' own content colour) unless it is under 5% of the bar. A sliver can't hold a number; it is in the text alternative, and in the card's legend and total.

## The series are one place

The colour of each series is owned by `src/lib/chart-series.ts` (`CHART_SERIES`), for every chart. The fill and the colour of the number written on it, measured against each other:

| Series | Fill | Number | Light | Dark |
|---|---|---|---|---|
| Completed | `accent.success.filled.surface` | `accent.success.filled.content` | **4.95:1** | **6.27:1** |
| Committed | `surface.brand.stronger` | `action.primary.content` | **13.23:1** | **13.69:1** |
| Overdue | `accent.critical.filled.surface` | `accent.critical.filled.content` | **4.77:1** | **5.30:1** |
| Available | `surface.brand.strong` | `action.primary.content` | **6.18:1** | **8.73:1** |
| Leave | `accent.warning.filled.surface` | `accent.warning.filled.content` | **4.93:1** | **10.56:1** |

**Every number is one colour per theme**: white in light, near-black in dark. Every fill follows the system's filled-surface rule, so no series needs the opposite text colour from the others.

The segments sit 2 apart on the `surface.track` (the same gap as the bars in `BarChart`), so each is a shape of its own and not only a colour change.

**Differences from Figma, on purpose.**
- **The fills are tokens.** Figma draws Completed in `#63c270`, Committed in `#5280e5` and Overdue in `#ff5656`, none of them a variable, and the legend swatches in other greens and reds again (`accent.success.outline.border`, a *border* token). White numbers on those are under 4.5:1. Here they are the filled-surface tokens and their content colours.
- **Committed and Available are two steps of the brand blue**: Committed the deepest (`surface.brand.stronger`), Available the one lighter (`surface.brand.strong`, the primary blue), both with the same number colour. They are 2.14:1 apart in light and 1.57:1 in dark (the ramp flips there, so Committed is the lighter of the two), with a 2 gap between segments. The nearer blue, `accent.info.filled`, is the same colour as Available's, which is why it isn't used.
- **Leave is amber**, which Figma draws as a grey. A grey Leave read as Available in dark. Amber is also the system's *warning* colour, and Leave is not a warning, so it is read here as a category colour in a chart, not a status (as `CycleSummary`'s brown "Carried Over" already is). If that reading ever becomes a problem, the alternative is a hatched grey, which needs a pattern fill and its number written outside the bar.
- **Overdue is red everywhere.** Figma's Sprint Metrics drew it orange.

## Accessibility

- **One image.** `role="img"` named by its series and values: "Team capacity: Completed 60, Committed 30, Overdue 30, Available 60, total 180 pts". The segments are `aria-hidden`, so a screen reader does not read twenty loose numbers.
- Colour is never the only signal: each segment has its number, and the card has a legend and the values as text.
- **No per-segment tooltip.** It would be a hover-only reading of what is already text, and five more pointer-only targets for every row.
- The numbers hold 4.5:1 on their fills in both themes; the `ContrastHolds` story measures it.

## Don't

- **Don't draw a bar to compare two totals by its length.** Every bar fills its track; a share of a larger total is `UserCapacity`'s `scale="shared"`.
- **Don't pass colours.** A new series is a new entry in `CHART_SERIES`, so every chart gets it.
- **Don't write a segment's value into a label of your own.** It is in the text alternative.
