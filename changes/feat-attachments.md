---
bump: minor
---
### `Attachments` — one piece for the cards, the drop area and the viewer (November 2026)

New component **`Attachments`**: a set of attached files as `FileAttachment` cards, the `Dropzone` and the `AttachmentViewer`, together. The attachments dialog, the handoff forms and the deliverables card each assembled these by hand, with their own copies of the glyph and object-URL logic. It holds no files (`items` in, `onFiles`, `onRemove` and `onDownload` out) and **never drops focus**: a removed card's ✕ goes with it, so focus moves to the next card's ✕, else the previous one's, else the drop area.

New `lib/attachment-files`: **`fileKind(file)`** picks a card's glyph by type and, when the browser gives none (it often does not, for a `.csv` or `.docx`), by extension; **`useAttachmentFiles()`** keeps the files just picked as cards, makes an image's address when it is picked and lets it go when its card goes, so a card never shows the previous file's picture.

`DeliverablesCard` now uses it. No props change.
