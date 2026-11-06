---
bump: minor
---
### `BarChart`, `CyclePerformance` and `SprintMetrics` — bar charts you can feed data (November 2026)

New, built to Figma's `Cycle_Performance` and `Sprint_Metrics`, and drawn in SVG with no chart library: pass `data` (a label and a values map per category) and `series`, and the axis (0 up to a readable top: 157 gives 175), the bars, the hover tooltip and the legend follow. They measure their own width and redraw as the card narrows: bars narrow, drop a number that will not fit, and category labels thin out so none overlap. Loading and empty states. The picture is hidden from assistive tech and the same numbers are in a visually hidden table.

`CyclePerformance` adds data-driven filters (`{ key, label, value, options, onChange }`, each a small `Select`); `SprintMetrics` is the number-over-bar, dashed-grid look with Capacity and Commitment as the system's Available and Committed series.

`CHART_SERIES` gains `svgFill`, `svgStroke` and `svgContent` for SVG shapes, and `src/lib/chart-scale.ts` (`niceTicks`, `useElementWidth`) is the shared axis arithmetic for the line chart that follows.

Differences from Figma, on purpose: fills are the series tokens (Figma's are not variables, with white numbers under 4.5:1) and Sprint Metrics' orange Overdue is the system's red.

Bars sit 2 apart within a group so each reads as its own. The legend is always under the chart (Sprint Metrics' Figma draws it above; the system keeps every legend at the bottom), so `BarChart`'s `legend` is `bottom` or `none`.
