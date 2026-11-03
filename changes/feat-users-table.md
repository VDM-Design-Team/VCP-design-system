---
bump: minor
---
### `UsersTable` and the Settings user dialog (November 2026)

New pattern **`UsersTable`**, built to Figma's `Settings_Users`: search, Name / Status / Date Added (sortable), **View** on each row, **+ New User** in the Actions header, pagination. Controlled like `AccountsTable`; it owns the status → tone mapping (`approved` green, `pending` yellow, `rejected`/`suspended`/`inactive` red, else grey).

`UserAccountModal` becomes the one user dialog for Accounts and Settings: `roles` swaps the Domain Access table for a Roles checklist (`draft.roles`, `initial.roles`), `onRemoveAvatar` gives the photo **Change** and **Remove**, and `domains` is now optional. Existing callers are unchanged.

`DataTableColumn` gains `action`: a control in the header in place of the visible label (the label stays as the hidden name).

Its empty table is an `EmptyState`, with the words searched when a search is active.
