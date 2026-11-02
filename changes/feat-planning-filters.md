---
bump: minor
---
### `PlanningFilters` — the row above the Planning list (November 2026)

New pattern, built to Figma's `_Planning_Filters`: a search box, status and priority filters (`SearchSelect`), Reset and the View Cycle button. Only what the Planning page needs; the library's larger filter bar (tags, period, users, Filters toggle, mobile) is a separate piece. The bar holds no state — `value` in, `onChange` out.
