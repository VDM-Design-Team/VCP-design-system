# SprintMetrics

How each sprint's capacity was used, as grouped bars: for every sprint, its Capacity, Commitment, Completed and Overdue points, under a "Current: Mar 1 - Mar 15" line. Built to Figma's `Sprint_Metrics` (`7579:108013`).

## Composed of

| Piece | Tier |
|---|---|
| `BarChart` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `SprintMetrics` | Sprint-by-sprint capacity, commitment and delivery |
| `CyclePerformance` | Cycle-by-cycle points, with filters |
| `BarChart` | The chart alone |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | `{ key, label, values }[]` | required | One entry per sprint, see `BarChart` |
| `title` | `string` | `Sprint Metrics` | The heading, and the region's name |
| `description` | `ReactNode` | — | The line under the title ("Current: Mar 1 - Mar 15"). Yours to write: which sprint is current is the product's |
| `series` | `ChartSeries[]` | `available`, `committed`, `completed`, `overdue` | Which to draw, in order |
| `yLabel` | `string` | `Points` | |
| `unit` | `string` | `pts` | |
| `height` | `number` | `320` | |
| `loading` / `empty` | `boolean` / `ReactNode` | | |
| `formatValue`, `formatTick`, `onSelectDatum`, `renderTooltip`, `toggleSeries`, `defaultHiddenSeries`, `onToggleSeries` | | | Passed to the `BarChart`: how numbers read, choosing a group, your own tooltip, and hiding series from the legend (see `docs/bar-chart.md`) |
| `className`, `ref` | | | On the section |

## What it is

A `BarChart` with Sprint Metrics' look: the numbers over the bars, dashed gridlines, four ticks and bars up to 64 wide, with the legend under the chart. **Capacity** is the system's `available` series and **Commitment** its `committed` one, relabelled here, so the blues read as they do on every other chart.

**Differences from Figma, on purpose.** The legend is under the chart (Figma draws it above; the system keeps every legend at the bottom). Overdue is the system's red (Figma draws it orange here and red elsewhere); the two blues are the series' tokens (Figma's pale periwinkle and blue are not variables); Capacity is the primary blue and Commitment the deeper step, as Available and Committed are on every chart.

## Layout and responsiveness

A container query: the chart takes the card's width, bars narrow, a bar drops a number that will not fit, and the sprint labels thin out (see `docs/bar-chart.md`). The card is `surface.elevated`, `radius.md`, `space.24`.

## Accessibility

- A `section` named by its title; the data is a hidden table (see `docs/bar-chart.md`).
- The legend is a list named "Legend".

## Don't

- **Don't work out "current" inside it.** Pass `description`.
- **Don't rename the series' colours.** They are the system's.
