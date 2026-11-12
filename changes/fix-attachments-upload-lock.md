---
bump: patch
---
### `Attachments` / `Dropzone` — nothing changes mid-upload, and a short dialog does not scroll (November 2026)

Two gaps found while reviewing the attachments dialog, both in the shared pieces, so every dialog and form that uses them is fixed at once.

- **`Attachments`: `disabled` locks removal too.** It locked only the drop area, so a card's ✕ still worked while an upload was in flight and changed what was staged after it had been sent. While `disabled`, no card has a ✕ (hidden, not greyed: `FileAttachment` has a card with a ✕ and a card without). The cards still open in the viewer. A ✕ that had focus when the upload started hands it to its own card, and the ✕s return when `disabled` ends. No API change: `AddManualModal` (`submitting`) and `AttachmentsModal` (`loading`) get it through the prop they already pass.
- **`Dropzone`: the 16 drag hit area is not there at rest.** It was always there and only ignored the pointer until a file was dragged, and a box 16 past the zone's edge counts as something to scroll to. A dialog's body ends 4 under its last control, so a dialog with a drop area scrolled by the other 12 although everything fitted, and showed a scrollbar where scrollbars always show. The hit area now exists only while a file is being dragged. Dropping within 16 of the zone works as before.
