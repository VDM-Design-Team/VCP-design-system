---
bump: patch
---
### `ConfirmDeleteAVModal` — footer buttons are `ModalCancel` and `ModalConfirm` (November 2026)

As `ConfirmDeleteModal`: the dialog uses `Modal`'s `tone="critical"` and its footer, with `ModalCancel` (grey) and `ModalConfirm` (red) instead of two plain `Button`s in the body. Same behaviour; the buttons sit in the system footer, 12 apart (were 16).
