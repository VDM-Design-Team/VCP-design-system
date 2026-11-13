---
bump: minor
---
### `DomainBudgetEditPage` — the Domain Budget edit page (November 2026)

New pattern: the main content of the page where an admin sets each domain's development-point budget for a quarter, built to Figma's `Domain Budget Edit`. It composes the title with the quarter control (`SegmentedControl` `md`) and year `Select` (`compact`, `edge="neutral"`) on its row, both 36 high like the dashboard's, `BudgetTable` and Save Changes. While `saving` it spins Save and locks the table, quarter and year; with `dirty` the browser asks before the page is left; Save is off while the budgets load. The data, the save and the toasts ("Changes Saved", and the `critical` one on failure, which keeps what was typed) stay with the page, and the stories show the whole flow. It goes inside `AppShell`. `docs/budget-table.md` now points to it for the page.
