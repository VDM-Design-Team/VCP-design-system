---
bump: minor
---
### `TableEmpty` — one empty-table look, and `DataTable` uses it (November 2026)

New **`TableEmpty`**: what every table says when it has no rows. A table passes its plural `noun` and its `icon`; the words ("No accounts yet.", "No accounts match “zzz”."), the magnifying-glass icon when filtered, a hint and **Reset** (`onReset`) come from here, so tables cannot drift apart. A table whose Figma draws other words can pass `title`. **Reset** is optional: without `onReset` it is not drawn.

`EmptyState`'s text sits closer: 4 between the title and its line (was 10), and the icon tile and the action stand 16 off the text.

`DataTable` shows a generic `TableEmpty` ("Nothing here yet.", with the icon tile) when a page sets no `empty`, instead of bare text. `AccountsTable`, `UsersTable`, `ContactsTable`, `ManualsTable` and `HolidayTable` use it: their wording is unchanged, `HolidayTable` gains the icon tile and a hint under its filtered message, and `ManualsTable` and `HolidayTable` keep Figma's words through `title`.
