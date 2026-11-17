---
bump: minor
---
### `GanttChart` — the title can be the page's `h1` (November 2026)

New `headingLevel` (`1 | 2`, default `2`). The chart draws its own title, so the Gantt page has no `PageTitle` to be its `h1`; the page now gives `headingLevel={1}` and the chart's title is the page's one `h1`. The look is the same, and nothing changes unless it is set. `docs/gantt-chart.md` has a new "On a page" note saying how the chart sits in `AppShell`.
