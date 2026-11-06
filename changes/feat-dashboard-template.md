---
bump: minor
---
### `DashboardTemplate`, `DashboardFilters` and `ValueCards` — the dashboard page (November 2026)

New template and two patterns, read off the Figma dashboards (development admin, super admin).

`DashboardTemplate`: the app shell, a title band with an optional Cycle / Quarter switch beside the title and the global filters on its right, then the sections stacked 16 apart. One layout for every role and domain: it takes the sections as `children` and does not know roles; the stories (`Templates/Dashboard`) compose the development admin (Cycle and Quarter), development user, design user and super admin dashboards, and `docs/dashboard-template.md` has the role-by-section matrix and the list of gaps the Figma pages leave open.

`DashboardFilters`: Reset Filters, the filters (data-driven: cycle, year, team) and an Export button (one button, or a menu with `exportOptions`). `ValueCards`: the status counts (Overdue, In Progress, Pending, Draft) as a titled card of `StatCard`s with an optional "whose" filter, four across, two by two or one column by its own width.

`PageTitle` gains `beside` (a slot beside the title, for a view switch). Its `actions` slot now wraps and is capped to the band's width, so a row of filters no longer overflows a narrow page; with `beside` set the left group wraps, so the switch drops under the title instead of squeezing it.

One height across the header row, 36 as Figma draws it: the filters' selects are the new `Select` size `compact` (36, between small 32 and medium 40), the buttons are `sm` (36) and the view switch is `md` (36; the control's own default is 48).

`Select` gains `size="compact"` (36): a toolbar's select beside a small Button and a medium SegmentedControl. Small (32) and medium (40) are unchanged.

The filter bar's selects hug their longest option (capped at 20rem) instead of a fixed width, so the title, the switch and the whole bar fit on one line at 1440 wide, with no empty space inside the selects.

With `beside` set, `PageTitle` has no column gap between the title group and the actions (16 before), so the filters get that room: at 1440 wide the header now has about 27 to spare.

The cycle filter is searchable, as Figma's annotations ask: a filter can be `searchable` and then draws a `SearchSelect` (a search box in its list). `SearchSelect` gains `size="compact"` (36, as `Select`'s) and its search now matches **every word typed, in any order** ("Aug 2026" finds "C37 (Jul 20, 2026 - Aug 03, 2026)"); a one-word search is unchanged. The annotations' other rules (Reset returns to the current cycle, the current year and All Teams; the year narrows the cycles; Export offers PDF and CSV) are in `docs/dashboard-filters.md`.

Super admin: `SuperAdminFilters` (the domain `Select` and the month `DateField`, `size="compact"` for 36) is exported so the dashboard can put them in the title row, aligned to the right and level with the development admin's, and `SuperAdminMetrics` takes `filters={false}` to draw only its cards (its own filters, 40 high above the cards, remain the default). `Input` gains `size="compact"` (36) and `DateField` a `size` prop, so the month field can sit at 36 beside the select. The development user's Cycle filters have no export, and its Quarter chart keeps its own quarter and year filters.
