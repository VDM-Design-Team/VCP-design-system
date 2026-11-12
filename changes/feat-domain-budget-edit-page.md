---
bump: minor
---
### `DomainBudgetEditPage` — the Domain Budget edit page (November 2026)

New pattern: the main content of the page where an admin sets each domain's development-point budget for a quarter, built to Figma's `Domain Budget Edit`. It composes the title, the quarter control (`SegmentedControl` `lg`) and year `Select` (`md`), both 40 high, `BudgetTable` and Save Changes. While `saving` it spins Save and locks the table, quarter and year; with `dirty` the browser asks before the page is left; Save is off while the budgets load. The data, the save and the toasts ("Changes Saved", and the `critical` one on failure, which keeps what was typed) stay with the page, and the stories show the whole flow. It goes inside `AppShell`. `docs/budget-table.md` now points to it for the page.
