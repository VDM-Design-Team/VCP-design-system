# ChartLegend

The row of series under a chart: a colour and the word for each, from `CHART_SERIES` (`src/lib/chart-series.ts`), so every chart's legend is the same. With `onToggleSeries` each entry is a button that shows or hides its series. `BarChart` and `LineChart` draw one; use it alone when a layout of your own needs the key.

## Composed of

| Piece | Tier |
|---|---|
| `LegendItem` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ChartLegend` | The key for a chart's series, optionally with show/hide buttons |
| `LegendItem` | One entry on its own (a custom key, a tooltip row) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `series` | `ChartSeries[]` | required | In the order drawn |
| `labels` | `Partial<Record<ChartSeries, string>>` | — | A different word in this chart ("Capacity" for Available) |
| `hiddenSeries` | `ChartSeries[]` | `[]` | The series not drawn right now: they read as off |
| `onToggleSeries` | `(series) => void` | — | Makes each entry a toggle button. Without it the entries are plain text |
| `className`, `ref` | | | On the list |

It owns no state: `hiddenSeries` and `onToggleSeries` are the chart's, which also stops the last visible series from being hidden.

## Tokens

Each entry is `LegendItem` (a 12 swatch and a `caption-md-medium` word in `text.primary`). A hidden series' swatch is `surface.neutral.medium` and its word is struck through at 60% opacity.

## Accessibility

- A list named "Legend".
- **A toggle is a real button** with `aria-pressed` (true while the series is drawn): it is announced "Overdue, toggle button, pressed". Space or Enter toggles it; the focus ring is the system's.
- **Target:** 24 high with a 40 press area (an invisible extension above and below), as the info glyphs have.
- **Colour is never the only signal** that a series is off: the word is struck through and the button says it is not pressed.

## Don't

- **Don't build a legend of your own** for a chart: pass the series, and the colours stay the system's.
- **Don't let a person hide every series.** The charts keep the last one visible; do the same if you drive it yourself.
