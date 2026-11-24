---
bump: minor
---
### `FilterBar` / `PlanningFilters` / `DashboardFilters` / `TableEmpty` — the reset button says "Reset Filters" (November 2026)

Design decision: the button that clears the filters reads **Reset Filters**, as the list pages in Figma draw it, everywhere the system shows it: the filter rows (the list pages, Planning, the Task Log Trail, the dashboard) and the button under an empty, filtered table (`TableEmpty`, and so `HolidayTable`, the list pages and the user tables). `resetLabel` still changes it on the three bars. A page that finds the button by its name (a test that looks for "Reset") now looks for "Reset Filters".
