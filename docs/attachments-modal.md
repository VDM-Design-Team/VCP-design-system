# AttachmentsModal *(pattern)*

Adding files to an Added Value: **"Attachments"**, the files already attached as cards, the drop area, and **Upload**. Built to Figma's `Attachment_Modal` (`3970:23235`, AV Page Attachment Elements), its Example,
and the file card's flows.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Dropzone` | atom |
| `AttachmentViewer` | component |
| `FileAttachment` | component |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AttachmentsModal` | Adding files to an Added Value from a dialog |
| `Dropzone` + `FileAttachment` inline | An attachments area that is part of a page (`DeliverablesCard`) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onClose` | `boolean` / `() => void` | required | |
| `attachments` | `{ id, name, kind?, thumb?, src? }[]` | `[]` | Files already on the Added Value |
| `onRemoveAttachment` | `(file) => void` | — | A file already attached was removed here |
| `onUpload` | `(files: File[]) => void` | required | Upload was pressed: **only the files just picked** |
| `loading` | `boolean` | `false` | Upload spins |

## Behaviour

- **Cards are `FileAttachment`**: hover shows the ✕, the ✕ removes, clicking the card (not its ✕) opens the preview. A picked image shows a small crop of itself.
- **The preview is `AttachmentViewer`** over the dialog (a modal over a modal); Escape closes only the preview.
- **What is accepted is `Dropzone`'s**: PNG, JPG, GIF, DOCX, CSV and PDF up to 10MB; a refused file is turned away in the drop area's error state and never becomes a card.
- **Upload waits** until something has been picked. It resets each time it opens, and does nothing itself.

## Tokens

`Modal` (`md`); no ✕ in the header, as Figma draws it (Escape and the backdrop close). No new tokens.

## Accessibility

A dialog named "Attachments". Every card is a button named for its file and every ✕ names its file ("Remove image.png"). The drop area is a real file input, reachable by keyboard.

## Don't

- **Don't upload on drop.** Picking stages the file; Upload sends it.
- **Don't re-check type or size here** — `Dropzone` does.
