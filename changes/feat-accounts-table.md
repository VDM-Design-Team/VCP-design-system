---
bump: minor
---
### `AccountsTable` — the Accounts page's list of users (November 2026)

New pattern, built to Figma's `Accounts_Page_Content`: a search box, a sortable Name column (avatar, name, email), the domains as neutral tags, a sortable Date Added (already formatted), an edit and a delete button on every row (the plain glyph-only `IconButton`; named for the person), and `Pagination` beneath. Controlled: the caller filters, sorts and pages, and `onEdit` / `onDelete` only ask — the page opens the user dialog, confirms the delete (`ConfirmDeleteModal`) and toasts. `loading` shows placeholder rows; an empty table says so in an `EmptyState`, with the words searched.
