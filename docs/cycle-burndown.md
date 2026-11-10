# CycleBurndown

How a cycle's points burned down over its days: a line for each of Completed, Committed, Overdue and Available across the working days, with a row of totals under the chart and a legend. Built to Figma's `Cycle_Burndown` (`7581:80708`).

## Composed of

| Piece | Tier |
|---|---|
| `Divider` | atom |
| `Icon` | sub-atomic |
| `CardHeader` | component |
| `LineChart` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CycleBurndown` | A cycle's day-by-day burndown, with totals |
| `LineChart` | The chart alone, in a layout of your own |
| `CycleSummary` | How a cycle went in four numbers and a gauge |
| `CyclePerformance` | Cycle-by-cycle bars |

## Supplying the data

**One entry per day, in order**, each with the label for the axis and a number for each line:

```tsx
const { data: cycle, isLoading } = useBurndown({ cycleId, team });   // the page's fetch, following its global filters

<CycleBurndown
  loading={isLoading}
  hint="How the cycle's points burned down day by day."
  data={(cycle?.days ?? []).map((d) => ({
    key: d.date,
    label: formatDay(d.date),                       // "June 20": yours to format
    title: formatFull(d.date),                      // the hover card's heading: "Date: 06.20.2025"
    values: { completed: d.completed_pts, committed: d.committed_pts, overdue: d.overdue_pts, available: d.available_pts },
  }))}
  stats={[
    { key: 'completed', label: 'Completed', value: cycle.totals.completed, tone: 'success' },
    { key: 'remaining', label: 'Remaining', value: cycle.totals.remaining, tone: 'brand' },
    { key: 'off-track', label: 'Off-track', value: cycle.totals.off_track, tone: 'critical' },
  ]}
/>
```

The `FromAnApiResponse` story is this mapping, from a raw response, with a button that swaps the data.

- **Leave weekends out.** Days are spaced evenly in the order given, so there is no gap where the weekend was.
- **A day with no value for a series** (`undefined` or `null`) breaks that line; `0` is a real value.
- **The chart works nothing out.** The totals are the product's, since what "remaining" or "off-track" means is its to say.
- **It follows the page's filters:** there are none here. When the page's timeframe or team changes, pass the new `data` (and `loading` while it fetches). Pin nothing: the axis follows the data.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | `{ key, label, title?, values }[]` | required | One entry per day, see `LineChart` |
| `title` | `string` | `Cycle Burndown` | The heading, and the region's name |
| `hint` | `string` | — | Explains the card, behind an info glyph (a real button, "About Cycle Burndown"). Omit it and there is no glyph |
| `stats` | `{ key, label, value, tone? }[]` | — | The totals under the chart. `tone` is `neutral` (default), `success`, `brand` or `critical` |
| `pointLabel` | `string` | `Date` | What a day is called in the hover card's heading: "Date: 06.20.2025" |
| `series` | `ChartSeries[]` | `completed`, `committed`, `overdue`, `available` | The lines to draw, in order |
| `seriesLabels` | `Partial<Record<ChartSeries, string>>` | — | A different word for a series |
| `yLabel` | `string` | `Development Points` | |
| `unit` | `string` | `pts` | |
| `height` | `number` | `244` | |
| `loading` / `empty` | `boolean` / `ReactNode` | | The title stays; the totals go while loading |
| `formatValue`, `formatTick`, `onSelectDatum`, `renderTooltip`, `toggleSeries`, `defaultHiddenSeries`, `onToggleSeries` | | | Passed to the `LineChart`: how numbers read, choosing a day, your own tooltip, and hiding series from the legend (see `docs/line-chart.md`) |
| `className`, `ref` | | | On the section |

## Layout and responsiveness

A container query: the plot takes the card's width and thins its date labels when they would collide; the totals wrap and stay centred; the legend wraps. The card is `surface.elevated`, `radius.md`, `space.24` all round, `space.24` between its parts.

## Tokens

| Part | Style | Colour |
|---|---|---|
| Title | `title-sm-semibold` | `text.primary` |
| Total's label | `caption-md-medium` | `text.secondary` |
| Total's value | `label-sm-semibold` | `success`: `accent.success.outline.content`; `brand`: `text.brand.medium`; `critical`: `accent.critical.outline.content`; `neutral`: `text.primary` |

**Differences from Figma, on purpose.** The title is `title-sm` (Figma sets it at 14); Remaining's blue is `text.brand.medium` (Figma's `#4285f4` is not a token); the totals' green is the system's outline-content green (4.95:1), not the bright border green.

## Accessibility

- A `section` named by its title ("Cycle Burndown, region").
- The chart is a single keyboard stop with arrow-key reading and a data table (see `docs/line-chart.md`).
- The totals are a description list (a term and its value), so a screen reader pairs each label with its number.
- The info glyph is a real, focusable `button` (`InfoHint`, through `CardHeader`, wrapping the system `Tooltip`).
- Loading: one `status` ("Loading Cycle Burndown"); the section is `aria-busy`.

## Don't

- **Don't add filters to it.** The page's global filters decide what it is given.
- **Don't work the totals out inside it.** Pass `stats`.
- **Don't pass colours.** Series colours are the system's.
