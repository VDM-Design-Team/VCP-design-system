# Attachments *(component)*

A set of attached files as one piece: **the cards, the drop area and the viewer**. The attachments dialog, the handoff forms and the
deliverables card each put these three together by hand, with their own copies of the glyph and picture logic and their own gaps in
focus handling. This is the one version.

## Composed of

| Piece | Tier |
|---|---|
| `Dropzone` | atom |
| `AttachmentViewer` | component |
| `FileAttachment` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `Attachments` | Any place files are attached, shown, added or removed: a dialog, a form, a card |
| `FileAttachment` | One card on its own (a gallery row under a comment) |
| `Dropzone` | The drop area on its own |
| `AttachmentViewer` | Opening one file full screen on its own |

## It holds no files

`items` in, `onFiles` and `onRemove` out. What is attached, what was just picked, and what a removal does (at once, or staged until Save) are the
caller's. A dialog that stages removals simply stops passing the file in `items`; Cancel then puts it back.

For the files **just picked**, `useAttachmentFiles()` (`lib/attachment-files`) keeps them as cards:

```tsx
const picked = useAttachmentFiles();
<Attachments items={[...attached, ...picked.items]} onFiles={picked.add} onRemove={(item) => picked.remove(item.id)} />
// on Upload: send picked.files, then picked.clear()
```

An image's address (for its crop on the card and for the viewer) is made when the file is picked and let go of when its card goes, so a card never shows the
picture of the file that sat in its place before, and nothing is held after the dialog closes. `fileKind(file)` is the one place that chooses a glyph for a
`File`: by its type, and by its extension when the browser gave none (it often does not, for a `.csv` or a `.docx`), so a PDF is never an image.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `AttachmentItem[]` | required | `id`, `name`, `kind?`, `thumb?`, `src?`, `domain?`. One card each, in this order |
| `onFiles` | `(files: File[]) => void` | — | Files chosen or dropped, **already past the drop area's type and size checks**. Given, the drop area shows; left out, the set is view only |
| `onRemove` | `(item) => void` | — | A card's ✕. Given, every card has one; left out, none does |
| `onDownload` | `(item) => void` | — | Adds the viewer's download button and says which file. The page does the download |
| `error` | `ReactNode` | — | Said under the drop area: what only the caller knows, such as an upload that failed. A refused file's own message shows without it |
| `hint` / `accept` / `maxSize` | | `Dropzone`'s | The accepted-types line, what the picker takes, and the limit in bytes |
| `onReject` | `(rejections) => void` | — | Every file the drop area refused, and why |
| `disabled` | `boolean` | — | Locks the set while an upload is in flight: the drop area takes no files and no card has a ✕. Cards still open |
| `label` | `string` | `Attachments` | The list's accessible name |

## Behaviour

- **Pressing a card opens it** in the viewer (not its ✕), in view and in edit. The viewer is a dialog over whatever is on screen, a dialog included: Escape closes the preview first, and focus returns to the card that opened it.
- **A refused file never reaches `onFiles`.** `Dropzone` filters by type and size on a drop as well as in the picker, and says why ("That file is 24 MB; the limit is 10 MB").
- **Focus never drops.** A removed card takes its ✕ with it, so focus goes to the **next card's ✕**, else the **previous** one's, else the **drop area**.
- **`disabled` locks the set.** While an upload is in flight nothing staged can change: the drop area takes no files and **the ✕s are gone**, since a file removed after it was sent would be uploaded all the same. The ✕ is hidden, not greyed, because `FileAttachment` has a card with a ✕ and a card without. The cards still open in the viewer. A ✕ that had focus when the upload started hands it to its own card, and the ✕s return when `disabled` ends.

## Accessibility

- The cards are a list named "Attachments" (`label`); each card is a real button with its own ✕ as a sibling (`FileAttachment`'s), named "Remove {file}".
- The refusal and the caller's `error` are announced by the drop area.
- Nothing is described twice: the list's name is its own, so a heading beside it ("Attachments") does not repeat it for a reader who moves by list.

## Don't

- **Don't copy `kindOf` or the object-URL effect.** Use `fileKind` and `useAttachmentFiles`.
- **Don't remove a card without letting `Attachments` move focus**: pass `onRemove` and drop the item from `items`; do not unmount the whole list.
- **Don't validate type or size yourself.** The drop area does; show what it reports.
- **Don't confirm a removal inside a dialog that stages it.** Removing is undone by Cancel.
- **Don't guard `onRemove` yourself during an upload.** Pass `disabled`; the ✕s go and focus is looked after.
