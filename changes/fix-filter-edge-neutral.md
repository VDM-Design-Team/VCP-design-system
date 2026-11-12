---
bump: patch
---
### Every filter uses the lighter edge (November 2026)

The lighter filter edge (`edge="neutral"`, #328 and #336) was only on `FilterBar`, `PlanningFilters`' selects, the Gantt toolbar and the dashboard filters, so a table's own search looked darker than the filters beside it. It now also covers the rest: the search in `UsersTable`, `AccountsTable` and `PlanningFilters`; the three filters in `HolidayTable`; the Quarter and Year selects in `DomainBudgetSummary`; and the filter selects in `CyclePerformance`. Fields in forms and dialogs keep the default edge. The rule is now in `CLAUDE.md` (rule 5) and `docs/filter-bar.md`.
