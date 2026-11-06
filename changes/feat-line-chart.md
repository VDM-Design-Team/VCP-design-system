---
bump: minor
---
### `LineChart` and `CycleBurndown` — line charts you can feed data (November 2026)

New, built to Figma's `Cycle_Burndown`, drawn in SVG with no chart library. `LineChart`: pass `data` (one entry per point: a `label` and a `values` map of series to numbers, `null` or missing to break a line) and `series`; the axis (0 up to a readable top), the lines, a dot at every point, the hover tooltip and the legend follow. Points are evenly spaced in the order given, so a burndown over working days has no gap for the weekend. It redraws as its card narrows and thins its axis labels so none collide.

Lines differ by more than colour (Committed is dashed, Available dotted). The plot is one keyboard stop: the arrow keys read each point, with a tooltip and a polite announcement; the data is also in a visually hidden table. Loading and empty states.

`CycleBurndown` is the card: title with an optional hint, the chart with all four lines (Completed, Committed, Overdue, Available), a row of totals (`stats`: label, value, tone) and the legend at the bottom. No filters of its own: the page's global filters decide the `data`. The `FromAnApiResponse` story and `docs/cycle-burndown.md` show the whole mapping from a raw API response.

Differences from Figma, on purpose: line colours are the series tokens, lines are not all solid, the legend is at the bottom as on every chart, and the totals use token colours.
