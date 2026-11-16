---
bump: patch
---
### `ReportProblemModal` — the footer is `Modal`'s own buttons (November 2026)

The Report a Problem dialog built its footer by hand: a `tertiary` (text) Cancel and a plain Submit. It now uses `ModalCancel` (secondary) and `ModalConfirm` (primary) like every other dialog, both 40 high, and Cancel is off while the report is being sent (`busy`). Figma draws Cancel as a text button and both at the small size, from the old design; the rest of the dialogs do not.
