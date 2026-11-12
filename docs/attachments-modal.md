# AttachmentsModal *(pattern)*

Adding files to an Added Value: **"Attachments"**, the files already attached as cards, the drop area, and **Upload**. Built to Figma's `Attachment_Modal` (`3970:23235`, AV Page Attachment Elements), its Example,
and the file card's flows.

## Composed of

| Piece | Tier |
|---|---|
| `Attachments` | component |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AttachmentsModal` | Adding files to an Added Value from a dialog |
| `Attachments` inline | An attachments area that is part of a page (`DeliverablesCard` has one) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | |
| `attachments` | `{ id, name, kind?, thumb?, src? }[]` | `[]` | Files already on the Added Value |
| `onUpload` | `({ files, removed }) => void` | required | Upload (or Save) was pressed: **the files just picked**, and **the files already attached that were removed here** |
| `loading` | `boolean` | `false` | Upload spins, Cancel is disabled and the drop area locks. When it ends without an `error`, what was sent is cleared |
| `error` | `ReactNode` | — | Said under the drop area: an upload that failed. The picked files stay, so it can be tried again |

## Behaviour

The cards, the drop area and the preview are `Attachments`, so these are its behaviour:

- **Cards are `FileAttachment`**: hover shows the ✕, the ✕ removes, clicking the card (not its ✕) opens the preview. A picked image shows a small crop of itself, a PDF a document glyph.
- **The preview is `AttachmentViewer`** over the dialog (a modal over a modal); Escape closes only the preview, and focus returns to the card.
- **What is accepted is `Dropzone`'s**: PNG, JPG, GIF, DOCX, CSV and PDF up to 10MB; a refused file is turned away in the drop area's error state and never becomes a card.
- **Focus never drops.** A removed card's ✕ goes with it: focus moves to the next card's ✕, else the previous one's, else the drop area.

And these are the dialog's own:

- **Removing a file already attached is staged.** Its card goes at once, but nothing is removed from the Added Value until **Upload** (or **Save**); **Cancel**, Escape and the backdrop undo it, and there is no confirm step. The files just picked are simply dropped.
- **Upload (or Save) waits** until there is a change: something picked or something removed. It reads **Save** when the only change is a removal.
- **It is not sent twice.** While `loading` the button spins and the drop area locks; when it ends without an `error`, the picked files and the removals are cleared. With an `error` they stay so the person can try again.
- It resets each time it opens, and does nothing itself.

## Tokens

`Modal` (`md`); no ✕ in the header, as Figma draws it (Escape and the backdrop close). The footer is `ModalCancel` and `ModalConfirm` (40 high). No new tokens.

**Difference from Figma, on purpose.** Figma draws only **Upload**. A staged removal needs a way to be undone, so there is a **Cancel** beside it.

## Accessibility

A dialog named "Attachments". Every card is a button named for its file and every ✕ names its file ("Remove image.png"). The drop area is a real file input, reachable by keyboard.

## Don't

- **Don't upload on drop.** Picking stages the file; Upload sends it.
- **Don't remove an attached file the moment its ✕ is pressed.** Apply the removals `onUpload` hands over, so Cancel can undo them.
- **Don't re-check type or size here** — `Dropzone` does.
