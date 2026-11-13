---
bump: minor
---
### `AccountsPage`, `ContactsPage`, `HolidayRegistryPage`, `TaskLogPage` — the table pages (November 2026)

New patterns: the main content of the Accounts, Contact List, Holiday Registry and Task Log Trail pages, each the page title and then its table, laid out once (16 apart, 32 in from the sides, as `AVListPage` does), so the app only passes the data inside `AppShell`. Controlled, holding no data; the dialogs, the confirmations and the focus after a delete stay the app's, as each table's docs describe. The "On a page" notes on `AccountsTable`, `ContactsTable` and `HolidayTable` now point to them, and `TaskLogTrail` has one.

### `HolidayTable` — Add Holiday and Import from Hubstaff wrap on a narrow screen (November 2026)

The two admin buttons shared one row that could not wrap, so on a narrow screen it ran past the card and the page scrolled sideways. They now wrap.
