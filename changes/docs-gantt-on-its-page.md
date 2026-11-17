---
bump: patch
---
### `GanttChart` — a story and a doc line for the page it is (November 2026)

The Gantt Chart is one of Planning's three sub-pages (Planning List, Gantt Chart, Holiday Registry in the rail's Planning group). The docs already said the page is `AppShell` with `GanttChart` as its content; a new `OnItsPage` story now draws exactly that (the admin-dev rail with Planning open and Gantt Chart the current page, the chart's title as the page's one `h1`) and checks it, and `docs/gantt-chart.md` names the sub-page relationship. No component changes; there is still no separate page pattern, since it would only be the chart.
