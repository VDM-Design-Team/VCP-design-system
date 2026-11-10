---
bump: minor
---
### `ManualsTable` — the Settings Manuals tab's list (November 2026)

New pattern, built to Figma's `Manuals_Table`: Name (sortable), Uploaded by, Attachments (a count: "None", "1 file", "3 files"), Date Added, pagination, and Figma's "No items." empty state. **A manual's name opens it**: give a row an `href` and the name is a link, in a new tab. It is drawn by `TableCard` and controlled like `AccountsTable`; loading shows placeholder rows.
