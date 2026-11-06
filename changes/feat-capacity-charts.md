---
bump: minor
---
### `CapacityBar`, `TeamCapacity` and `UserCapacity` — how a team's capacity is spent (November 2026)

New, built to Figma's `Team_Capacity` and `User_Capacity` and driven by data: pass `segments` (a series and a value each) and the bar, the total and the legend follow; pass `members` and each person gets a row. They fill the width they are given, reflow with their card, and have loading and empty states.

New `src/lib/chart-series.ts` (`CHART_SERIES`, `CHART_SERIES_ORDER`, `seriesIn`, exported from the package): the five series every chart draws — Completed, Committed, Overdue, Available, Leave — and the one place that says what each looks like, so a legend, a bar and (soon) a line chart agree and "Overdue" is the same red everywhere. Each is a filled-surface token with its content colour, measured at 4.5:1 or more in both themes.

Differences from Figma, on purpose: the fills are tokens (Figma's are not variables, and white numbers on them fall short of 4.5:1); Committed is `surface.brand.subtle` with a dark number, since `accent.info.filled` is the same blue as Available; Overdue is red on every chart.
