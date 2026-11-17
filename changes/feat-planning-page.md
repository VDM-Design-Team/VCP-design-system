---
bump: minor
---
### `PlanningPage` — the Planning page (November 2026)

New pattern: the main content of the Planning page, built to Figma's `Planning Page`. It composes the title ("Planning List"), `PlanningFilters` on the canvas above the sections, `PlanningTable`'s Cycle and Backlog cards, and `Pagination` under them on the right, with typed sections (the filters and the pagination show only when passed). Editing in place, drag and move, and folding stay the table's; the page owns the data. It goes inside `AppShell`.

Docs: a new "On a page" note on `HolidayTable`, `AccountsTable` and `ContactsTable` (title, then the table, 16 apart and 32 in from the sides; Add Account is the top bar's `primaryAction`), and a pointer from `PlanningTable`. No page patterns for those three: each would only be a title and a table.
