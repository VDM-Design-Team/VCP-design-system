---
bump: patch
---
### `ConfirmDeleteModal` — footer buttons are `ModalCancel` and `ModalConfirm` (November 2026)

The dialog now uses `Modal`'s `tone="critical"` and its footer, with `ModalCancel` (grey) and `ModalConfirm` (red) instead of two plain `Button`s inside the body. Same dialog, same behaviour (alertdialog, no ✕, no backdrop dismissal); the buttons sit in the system's footer, 12 apart (they were 16), and follow the tone.
