---
bump: minor
---
### Dialog footer buttons: `ModalCancel`, `ModalConfirm`, and `md` (November 2026)

New **`ModalCancel`** and **`ModalConfirm`** for a dialog's footer. They take their colour from the dialog's `tone` (`secondary` + `primary`; grey `neutral` + red `danger` in the `critical` tone) and are `md` (40 high), so a hand-built footer no longer has to remember either. The `actions` row is these two buttons. The footers of the accept, reject, move-to-cycle and user dialogs use them; the report, handoff and review dialogs' own buttons are `md` too, and the review dialog's red Reject now has a grey Cancel. Before, the `actions` row and the dialogs drew 36-high (`sm`) buttons while `ConfirmDeleteAVModal` and the Modal stories drew 40, so a delete dialog looked different from the rest. See `docs/modal.md`.

Visible change: dialog footer buttons are 40 high instead of 36.
