---
bump: minor
---
### `ContactsTable` — the Contact List page (November 2026)

New pattern, built to Figma's `Contact_List`: Email, Subject and Message columns (a long message wraps and is shown whole), a delete button on every row (the plain glyph-only `IconButton`, named for the row) and `Pagination` beneath. Controlled: the caller pages, and `onDelete` only asks — the page confirms (`ConfirmDeleteModal`) and toasts. `loading` shows placeholder rows; an empty table says so.
