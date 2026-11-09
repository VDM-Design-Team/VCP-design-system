---
bump: minor
---
### `DashboardHeader` and `DashboardFilters` — the top of a dashboard (November 2026)

New patterns, read off the Figma dashboards (development admin, super admin).

`DashboardHeader`: the page's title, an optional Cycle / Quarter view switch beside it and the role's filters on its right, as one pattern. One header for every role: the switch is data (`views`, `view`, `onViewChange`) and the filters are a slot, so the role is what you put in. The stories compose the development admin (Cycle and Quarter), development user, super admin and design user headers; `docs/dashboard-header.md` has the role table.

`DashboardFilters`: Reset Filters, the filters (data-driven: cycle, year, team; the cycle is searchable) and an Export button (one button, or a menu with `exportOptions`), every control 36 high, the selects hugging their longest option.

The super admin's domain and month filters are exported as `SuperAdminFilters` (`size="compact"` is 36) so the header can hold them, and `SuperAdminMetrics` takes `filters={false}` to draw only its cards (its own filters, 40 high above the cards, remain the default).
