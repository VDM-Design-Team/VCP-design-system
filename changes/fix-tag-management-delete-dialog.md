---
bump: minor
---
### `TagManagementModal` — the domain delete is `ConfirmDeleteModal` (November 2026)

`type="delete-domain"` now hands over to `ConfirmDeleteModal`, the system's one delete confirmation: the question, the consequence, the domain's name (new: pass it as `initialName`), a grey Cancel and a red **Delete** (it said "Confirm"). It was a plain critical `Modal` before. Without `initialName` the name field is empty.
