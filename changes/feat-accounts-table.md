---
bump: minor
---
### `AccountsTable` — the Accounts page's list of users (November 2026)

New pattern, built to Figma's `Accounts_Page_Content`: a search box, a sortable Name column (avatar, name, email), the domains as neutral tags, a sortable Date Added (already formatted), an edit and a delete button on every row (the plain glyph-only `IconButton`; named for the person), and `Pagination` beneath. Controlled: the caller filters, sorts and pages, and `onEdit` / `onDelete` only ask — the page opens the user dialog, confirms the delete (`ConfirmDeleteModal`) and toasts. `loading` shows placeholder rows; an empty table says so in an `EmptyState`, with the words searched.

Focus after a delete is the page's job and is documented (docs/accounts-table.md, docs/confirm-delete-modal.md): the `OnThePage` story moves it to the next row's Delete button, the previous one's for the last row, or the search box when the table is empty, and asserts it. The search placeholder and the empty hint say "domain" (the column the table has), and the story shows the Items select.
