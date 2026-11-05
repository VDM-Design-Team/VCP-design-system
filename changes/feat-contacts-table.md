---
bump: minor
---
### `ContactsTable` — the Contact List page (November 2026)

New pattern, built to Figma's `Contact_List`: Email, Subject and Message columns (a long message wraps and is shown whole), a delete button on every row (the plain glyph-only `IconButton`, named for the row) and `Pagination` beneath. Controlled: the caller pages, and `onDelete` only asks — the page confirms (`ConfirmDeleteModal`) and toasts. `loading` shows placeholder rows; an empty table says so.

Its empty table is an `EmptyState` (“No messages yet.”).

Focus after a delete is the page's job and is documented (docs/contacts-table.md): the `OnThePage` story moves it to the next message's Delete button, the previous one's for the last row, or the empty message when none is left, and asserts it.
