---
bump: minor
---
### `DashboardTemplate`, `DashboardFilters` and `ValueCards` — the dashboard page (November 2026)

New template and two patterns, read off the Figma dashboards (development admin, super admin).

`DashboardTemplate`: the app shell, a title band with an optional Cycle / Quarter switch beside the title and the global filters on its right, then the sections stacked 16 apart. One layout for every role and domain: it takes the sections as `children` and does not know roles; the stories (`Templates/Dashboard`) compose the development admin (Cycle and Quarter), development user, design user and super admin dashboards, and `docs/dashboard-template.md` has the role-by-section matrix and the list of gaps the Figma pages leave open.

`DashboardFilters`: Reset Filters, the filters (data-driven: cycle, year, team) and an Export button (one button, or a menu with `exportOptions`). `ValueCards`: the status counts (Overdue, In Progress, Pending, Draft) as a titled card of `StatCard`s with an optional "whose" filter, four across, two by two or one column by its own width.

`PageTitle` gains `beside` (a slot beside the title, for a view switch). Its `actions` slot now wraps and is capped to the band's width, so a row of filters no longer overflows a narrow page; with `beside` set the left group wraps, so the switch drops under the title instead of squeezing it.
