# LineChart

One line per series across an ordered axis (days, sprints), a dot at every point, drawn in SVG. The chart inside Figma's `Cycle_Burndown`. It draws the chart and its legend; the title, totals and card are the pattern's (`CycleBurndown`).

## Composed of

| Piece | Tier |
|---|---|
| `LegendItem` | atom |
| `Skeleton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `LineChart` | A trend over an ordered axis, several series at once |
| `CycleBurndown` | A cycle's burndown, with totals |
| `BarChart` | Values side by side per category |

## The data you pass

```ts
data: {
  key: string | number;                         // stable per point
  label: string;                                // the axis text: "June 20" (yours to format)
  title?: string;                               // the tooltip heading, if it should say more: "Fri 20 June 2025"
  values: { completed?: number | null; committed?: number | null; overdue?: number | null; available?: number | null; leave?: number | null };
}[]
series: ChartSeries[]                           // which lines to draw, in order
```

- **One entry per point, in order.** Points are **evenly spaced in the order given**: leave weekends out of a working-days axis and the line does not stretch over them. The chart does not sort, fill gaps or work out dates.
- **A series with no value at a point** (`undefined` or `null`) **breaks its line** there, and has no dot: a series that starts late or ends early is just shorter. `0` is a real point on the axis.
- **What each series measures is the product's.** The chart draws the numbers it is given; the colours and names are the system's (`CHART_SERIES`), shared with every other chart. Use `seriesLabels` to rename one ("Pts Completed").

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | see above | required | |
| `series` | `ChartSeries[]` | required | `completed`, `committed`, `overdue`, `available`, `leave` |
| `seriesLabels` | `Partial<Record<ChartSeries, string>>` | — | A different word in this chart |
| `caption` | `string` | required | The chart's name: the table's caption and the plot's accessible name |
| `yLabel` | `string` | — | The value axis' title, turned on its side |
| `unit` | `string` | `pts` | After a number in the tooltip, the table and the announcement |
| `height` | `number` | `244` | The plot and its axes, in px (the plot itself is `height` less 44) |
| `yTickCount` | `number` | `7` | About how many gridlines; they round to readable numbers |
| `yMax` | `number` | next tick above the data | Pin the top so two charts compare |
| `legend` | `bottom \| none` | `bottom` | Under the chart, always |
| `loading` / `empty` | `boolean` / `ReactNode` | | A placeholder and a status; or what it says with no data |
| `className`, `ref` | | | On the wrapper |

## Responsive, and not only by colour

It measures its own width and draws in real pixels, so type never scales; the axis labels **thin out** (every other, every third …) when they would run into each other. Nothing overflows.

**Lines differ by more than colour:** Committed (the plan) is dashed and Available dotted; Completed and Overdue are solid. The dots, the legend, the tooltip and the table all name the series too.

## Tokens

| Part | Style | Colour |
|---|---|---|
| Axis numbers and labels | `caption-sm-regular` (10) | `text.secondary` |
| Axis title | `caption-md-semibold` | `text.secondary` |
| Gridlines | 1 | `stroke.subtle` |
| Lines | 2, round caps and joins | the series' fill (`stroke-*`) |
| Dots | radius 3 (5 on the hovered point) | the series' fill |
| Tooltip | `caption-md` | `surface.elevated`, `stroke.subtle`, `shadow-md` |

**Differences from Figma, on purpose.** The line colours are the series tokens (Figma's blues and greens are not variables); Committed is dashed and Available dotted (Figma draws all lines solid, which leaves two blues distinguishable by colour alone); the plot spaces points evenly and does not draw the weekend.

## Accessibility

- **One keyboard stop, arrow keys inside.** The plot is a focusable group named "Cycle Burndown. Use the left and right arrow keys to read each point." Left and right move from point to point, Home and End jump to the first and last, Escape clears. The tooltip follows, and a polite status announces the point: "June 20: Completed 0 pts, Committed 145 pts …".
- **The picture is `aria-hidden`; the data is a table.** A visually hidden `<table>` (captioned by `caption`) has a row per point and a column per series; a missing value reads "no data".
- **Contrast, measured in both themes** (the `ContrastHolds` story): every line holds 3:1 against the card (1.4.11) and the axis text 4.5:1.
- Colour is never the only signal: dash patterns, the legend, the tooltip and the table.
- Loading: one `status` ("Loading Cycle Burndown"), the placeholder hidden from assistive tech.

## Don't

- **Don't pass dates and expect it to space them by time.** It spaces points evenly; label them yourself.
- **Don't pass `0` for a day with no data.** Leave it out (`undefined` or `null`) so the line breaks.
- **Don't pass colours.** A new series is a new entry in `CHART_SERIES`.
