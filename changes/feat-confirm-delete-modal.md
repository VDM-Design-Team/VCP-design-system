---
bump: minor
---
### `ConfirmDeleteModal` — confirm deleting anything (November 2026)

New pattern: the same alert layout as `ConfirmDeleteAVModal` (a warning glyph, the question, the consequence, the item's name in a read-only field; not dismissible by the backdrop; `alertdialog`), with the word for the thing configurable (`itemLabel`, `itemName`) so a user, a contact or a domain can use it. It asks and reports; it deletes nothing. `ConfirmDeleteAVModal` is unchanged.
