---
bump: minor
---

### `AppShell` — a `page` slot for whole page patterns (November 2026)

New optional `page`: a page pattern (`AccountsPage`, `AVListPage`, `AVPage`, `ContactsPage`, `DashboardPage`, `DomainBudgetEditPage`, `DomainsPage`, `HolidayRegistryPage`, `PlanningPage`, `SettingsPage`, `TaskLogPage`) placed flush, in place of `header` and `children`. Each of those patterns is the title band and the body together with its own 32 at the sides, and their docs said to put them in `children`, where the body's 32 was added and the page landed 64 in. They now say `<AppShell page={<AccountsPage … />} />`. `children` is now optional; without `page` the shell is as before. A new story, `WithAPagePattern`, checks the title and the body sit 32 in.
