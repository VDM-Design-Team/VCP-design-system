---
bump: patch
---
### Planning filters and the Gantt toolbar use the lighter filter edge (November 2026)

`PlanningFilters`' selects and the Gantt chart's toolbar filters (cycle, projects, users, view) now use `edge="neutral"`, the lighter resting edge `FilterBar` has had since the filter-edge change, so every row of filters reads the same. Fields in a form or dialog keep the full `stroke.strong` edge. This is the deliberate exception documented in `docs/filter-bar.md` (about 2.6:1 on white against the usual 3:1).
