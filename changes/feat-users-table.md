---
bump: minor
---
### `UsersTable`, `AccountStatusTag` and the Settings user dialog (November 2026)

New pattern **`UsersTable`**, built to Figma's `Settings_Users`: search, Name / Status / Date Added (sortable), **View** on each row, **+ New User** in the Actions header, pagination. Controlled like `AccountsTable`. Its empty table is an `EmptyState`, with the words searched when a search is active. **+ New User** stays while the table loads.

New component **`AccountStatusTag`**, the one owner of account statuses: **Approved** (green), **Pending** (yellow) and **Inactive** (grey), with no red status. `UsersTable` draws it, and `ACCOUNT_STATUS_OPTIONS` is the user dialog's Status list, so tables and dialogs agree.

`UserAccountModal` becomes the one user dialog for Accounts and Settings:

- `roles` swaps Proficiency and the Domain Access table for a Roles checklist (`draft.roles`, `initial.roles`). `domains` and `proficiencyOptions` are now optional.
- The photo's buttons are **Upload** with no photo, **Change** + **Remove** once there is one (a freshly chosen image counts). **Remove takes effect on Submit**: the draft carries `avatarRemoved: true`, so Cancel undoes it.
- `draft.roles` and `draft.avatarRemoved` are optional, so existing typed callers are unchanged.

`DataTableColumn` gains `action`: a control in the header in place of the visible label (the label stays as the hidden name). An `action` column sits at the end: right-aligned, with room above and below the header control.
