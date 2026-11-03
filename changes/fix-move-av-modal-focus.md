---
bump: patch
---
### `MoveAVToCycleModal` — focus follows the assignee rows, and an unavailable assignee is said once (November 2026)

Fix: removing an assignee row took the focused ⊖ with it and left the focus on the page itself. It now goes to the row
that took its place (its ⊖, or its assignee when only one row is left); "Add assignee" now goes to the new row's
assignee, ready to fill in.

Fix: an unavailable assignee showed two red messages for one problem, the person's field's own and a second under
the group. Only the field's stays; Confirm moves focus to that field, so a screen reader hears it.
