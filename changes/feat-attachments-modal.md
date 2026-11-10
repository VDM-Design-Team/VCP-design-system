---
bump: minor
---
### `AttachmentsModal` (November 2026)

New **`AttachmentsModal`** (Figma's `Attachment_Modal`): the files already on an Added Value as cards (hover ✕ removes, clicking a card opens its preview over the dialog), a drop area, and **Upload**. The cards, drop area and preview are the shared `Attachments` piece, so a ✕ never drops focus (it goes to the next card's ✕, else the previous one's, else the drop area), a PDF is never drawn as an image, and a refused file never becomes a card.

**Removing a file already attached is staged**: its card goes at once, but nothing is removed until **Upload** (or **Save**, when the only change is a removal); **Cancel** undoes it, with no confirm step. `onUpload({ files, removed })` hands over what was picked and what was removed. It is **not sent twice**: while `loading` Upload spins and the drop area locks, and once it settles without an `error` the picked files and removals are cleared; with an `error` (shown under the drop area) they stay for another try. The footer is `ModalCancel` and `ModalConfirm`.
