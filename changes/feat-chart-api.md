---
bump: minor
---
### Charts — formatters, choosing, a custom tooltip, legend toggles and keyboard reading (November 2026)

The options most chart libraries offer, on `BarChart` and `LineChart` (and passed through by `CyclePerformance`, `SprintMetrics` and `CycleBurndown`):
- **`formatValue(value, series)`** and **`formatTick(value)`**: how a number reads on a bar, in the tooltip, the table and the announcement, and on the value axis.
- **`onSelectDatum(datum, series?)`**: a group or point was chosen, by a click (with the series of the bar it landed on) or by Enter.
- **`renderTooltip({ datum, index, series })`**: replaces what the tooltip says, keeping the card and its position.
- **`toggleSeries`** (with `defaultHiddenSeries`, `onToggleSeries`): each legend entry becomes a button that shows or hides its series; the axis follows what is drawn, and the last visible series cannot be hidden.
- **Keyboard reading on the bar chart**, as the line chart has: one tab stop, the arrow keys move from group to group, Home and End jump, Escape clears, the tooltip follows and the group is announced.

New `ChartLegend` (the series key, with optional show/hide buttons: `aria-pressed`, a 40 press area) and the shared `useChartCursor` and `useHiddenSeries` in `src/lib/chart-scale.ts`. The names avoid the DOM's own (`onSelect`, `onToggle`, `hidden`).
