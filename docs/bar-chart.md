# BarChart

Grouped bars over a category axis: one group per category (a cycle, a sprint), one bar per series in it. The chart inside Figma's `Cycle_Performance` and `Sprint_Metrics`, drawn in SVG. It draws the chart and its legend; the title, filters and card are the patterns' (`CyclePerformance`, `SprintMetrics`).

## Composed of

| Piece | Tier |
|---|---|
| `LegendItem` | atom |
| `Skeleton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `BarChart` | Values per category, side by side |
| `CyclePerformance` | How each cycle went, with filters |
| `SprintMetrics` | How each sprint's capacity was used |
| `CapacityBar` | One total split into its parts (a single stacked bar) |
| `DonutChart` | One rate as a ring |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | `{ key, label, values }[]` | required | `label` is the category on the axis; `values` maps a series to a number. A series left out of a group is not drawn (and reads "no data" in the table) |
| `series` | `ChartSeries[]` | required | Which series to draw, in order: `completed`, `committed`, `overdue`, `available`, `leave` |
| `seriesLabels` | `Partial<Record<ChartSeries, string>>` | — | A different word in this chart: Sprint Metrics calls Available "Capacity" and Committed "Commitment" |
| `caption` | `string` | required | The chart's name, as the hidden table's caption |
| `yLabel` | `string` | — | The value axis' title, turned on its side |
| `unit` | `string` | `pts` | After a number in the tooltip and the table |
| `height` | `number` | `320` | The plot and its axes, in px |
| `yTickCount` | `number` | `7` | About how many gridlines; they round to readable numbers (0, 25, 50 … 175) |
| `yMax` | `number` | next tick above the data | Pin the top of the axis so two charts compare |
| `valueLabels` | `inside \| above \| none` | `inside` | Written on the bar, over it, or not at all |
| `grid` | `solid \| dashed` | `solid` | The gridlines |
| `legend` | `bottom \| none` | `bottom` | Under the chart, always. `none` leaves it out |
| `maxBarWidth` | `number` | `32` | The widest a bar gets, in px |
| `loading` / `empty` | `boolean` / `ReactNode` | — / "Nothing to show for this period." | A placeholder and a status; or what it says with no data |
| `className`, `ref` | | | On the wrapper |

## It is data, and it is responsive

Pass `data` and `series`; the axis (from 0 to the next readable number above the largest value), the bars, the tooltip and the legend all follow. It measures its own width and draws in real pixels, so type never scales:

- **Bars sit 2 apart** within a group, and **narrow**, to a minimum of 4, and **give up their number** when it will not fit (under 20 wide, or under 20 tall).
- **Category labels thin out** — every other, every third … — when they would run into each other, so none overlap.
- Nothing overflows its box.

Colours are `CHART_SERIES`'s (`src/lib/chart-series.ts`), shared with the capacity bars, so Completed is the same green and Overdue the same red on every chart. Grid, axis and text are tokens, so dark comes free.

**It does no filtering or arithmetic.** It draws the numbers it is given.

## Plugging in data

The chart is stateless and controlled: it draws what it is given and holds nothing but a hover. So wiring it to an API is mapping the response to `data`, and a timeframe filter is a page-level choice that changes what you pass:

```tsx
const { data: cycles, isLoading } = useCycles({ timeframe });   // the page's fetch, filtered by its global timeframe

<BarChart
  caption="Cycle Performance"
  loading={isLoading}
  series={['available', 'overdue', 'completed']}
  data={(cycles ?? []).map((c) => ({
    key: c.id,                                     // stable: the chart re-renders from it, not from the order
    label: c.shortName,                            // "Jan C23": the category axis text
    values: { available: c.available, overdue: c.overdue, completed: c.completed },
  }))}
/>
```

- **A timeframe change** is a new `data` array (and `loading` while it fetches): the axis, bars and legend all follow. Nothing in the chart needs to know about the timeframe.
- **Comparing timeframes?** Pin `yMax` so the axis does not jump between them.
- **A series with no value** in a group (an API `null` or a missing key) is not drawn and reads "no data" in the table; a `0` is drawn as no bar and reads "0".
- **Label text** is yours (format the dates, shorten the names); the chart thins labels out when they would collide.
- **Empty period:** pass `[]` and `empty` for the words ("No cycles in Q1 2026.").

## Tokens

| Part | Style | Colour |
|---|---|---|
| Axis numbers and category labels | `caption-sm-regular` (10) | `text.secondary` |
| Axis title | `caption-md-semibold` | `text.secondary` |
| Number on a bar | `caption-sm-semibold` | the series' content colour (white in light, near-black in dark) |
| Number over a bar | `caption-sm-regular` | `text.primary` |
| Gridlines | 1 | `stroke.subtle` |
| Bar | top corners `radius.xs`-ish (4) | the series' fill |
| Tooltip | `caption-md` | `surface.elevated`, `stroke.subtle`, `shadow-md` |

**Differences from Figma, on purpose.** The bar fills are the series tokens (Figma's are `#63c270` and `#ff5656`, not variables, with white numbers under 4.5:1); the number on a bar is `caption-sm-semibold` (the ramp has no bold at 10); the axis' top is a readable number above the data, so 157 gives 175 as Figma draws it.

## Accessibility

- **The picture is `aria-hidden`; the data is a table.** A visually hidden `<table>` (captioned by `caption`) has a row per category and a column per series, so a screen reader reads the numbers, not "graphic". A missing value reads "no data", not 0.
- **The tooltip is for the pointer.** Every value in it is also written on the bar (or over it) and in the table. It is not a keyboard stop: nothing in the picture is focusable, which keeps the hidden-picture rule honest.
- **Contrast, measured in both themes** (the `ContrastHolds` story): the axis text and the numbers over bars hold **10.35:1** light and **11.87:1** dark on the card (`text.secondary`); every bar holds at least **4.77:1** light and **3.84:1** dark against the card (the tightest is Overdue; 3:1 is asked of a graphic); and a number written on a bar holds at least **4.77:1** light and **5.30:1** dark on that bar (4.5:1 is asked).
- Colour is never the only signal: the legend names each series and the numbers are written out.
- Loading: one `status` ("Loading Cycle Performance"), the placeholder hidden from assistive tech.

## Don't

- **Don't pass colours.** A new series is a new entry in `CHART_SERIES`, so every chart gets it.
- **Don't use it for a trend over time.** That is a line.
- **Don't put dozens of series in a group.** Past five the bars are slivers; use a table.
