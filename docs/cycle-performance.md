# CyclePerformance

How each cycle went, as grouped bars: for every cycle, the points Available, Overdue and Completed, with filters (whose cycles, which quarter, which year) over the chart. Built to Figma's `Cycle_Performance` (`4217:33860`).

## Composed of

| Piece | Tier |
|---|---|
| `Select` | atom |
| `BarChart` | component |
| `CardHeader` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CyclePerformance` | Cycle-by-cycle points, with filters |
| `SprintMetrics` | Sprint-by-sprint capacity |
| `BarChart` | The chart alone, in a layout of your own |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `data` | `{ key, label, values }[]` | required | One entry per cycle, see `BarChart` |
| `title` | `string` | `Cycle Performance` | The heading, and the region's name |
| `filters` | `{ key, label, value, options, onChange, className? }[]` | — | A small, quiet `Select` each. `label` names it for assistive tech ("Show", "Quarter", "Year"). Pass as many as the page has, or none |
| `series` | `ChartSeries[]` | `available`, `overdue`, `completed` | Which to draw, in order |
| `yLabel` | `string` | `Development Points` | |
| `unit` | `string` | `pts` | |
| `height` | `number` | `320` | |
| `loading` / `empty` | `boolean` / `ReactNode` | | The filters stay either way, so the person can change them |
| `formatValue`, `formatTick`, `onSelectDatum`, `renderTooltip`, `toggleSeries`, `defaultHiddenSeries`, `onToggleSeries` | | | Passed to the `BarChart`: how numbers read, choosing a group, your own tooltip, and hiding series from the legend (see `docs/bar-chart.md`) |
| `className`, `ref` | | | On the section |

## The filters are the page's

The chart does no filtering: which cycles a person, a quarter or a year contains is the product's. Each filter reports its choice; the page fetches or filters and passes the new `data`. Figma draws three (the person, the quarter, the year); the story shows that wiring.

## Layout and responsiveness

A container query. The title and the filters share a row; when they run out of room the filters wrap under the title. The chart takes the card's width (see `BarChart`). The card is `surface.elevated`, `radius.md`, `space.24` all round, `space.16` between its parts.

## Accessibility

- A `section` named by its title.
- The filters are native selects, each named by its `label`.
- The chart's data is a hidden table (see `docs/bar-chart.md`).

## Don't

- **Don't filter inside it.** Pass the result.
- **Don't draw the filters yourself.** Pass `filters`.
