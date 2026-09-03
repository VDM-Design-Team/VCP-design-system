# FileAttachment

One attached file as a small tile: thumbnail or kind glyph, name, size,
optional open and remove.

## When to use

| Use | For |
|---|---|
| `FileAttachment` | Each file in a gallery row — under a comment, in an evidence panel |
| `Dropzone` | How files arrive — compose it above a row of these |
| `AttachmentPreview` | Where opening a tile leads |
| A `DataTable` row | Files with metadata worth sorting (who, when, status) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | required | Truncates with a `title` tooltip; also names the ✕ ("Remove ${name}") |
| `size` | `string` | — | Human-readable — '1.2 MB'. Formatting is the caller's |
| `kind` | `image \| pdf \| doc \| csv \| video` | `doc` | Picks the glyph when there is no `thumb` |
| `thumb` | `string` | — | Image src for a real thumbnail |
| `onClick` | `() => void` | — | Makes the tile a real button — usually "open the preview" |
| `onRemove` | `() => void` | — | The ✕ — its own sibling button, never nested |
| `className` | `string` | — | On the wrapper |
| `ref` | `Ref<HTMLDivElement>` | — | The wrapper |

## The remove button is revealed, not mounted

The export rendered the ✕ only while the pointer hovered — a control
keyboards could never reach. Here it is **always in the tab order** and
revealed by tile hover, its own focus, or any focus within the tile
(`opacity`, not conditional mount). Tab to the tile, Tab again, and the ✕
appears under focus exactly as it does under the pointer.

Same Chip rule for the anatomy: the openable area is a `<button>`, the ✕ is a
sibling — a button never contains a button.

## Tokens

Preview well `surface.canvas` on a `stroke.subtle` border (`radius.md`);
kind glyph `text.tertiary`; name `label-sm` `text.secondary`; size
`label-sm` `text.subtle`; hover lifts with `shadow.raised`. New glyphs
**`image`** and (for the preview panel) **`download-simple`** added from
Phosphor per docs/icon.md.

| Pair | Light | Dark |
|---|---|---|
| Name under the tile | **9.90:1** | **14.48:1** |
| Size line *(secondary info)* | **4.55:1** | **6.96:1** |

## Accessibility

- Openable tile = real button whose name is the visible name + size; ✕ =
  "Remove ${name}" — ten tiles, ten distinct names.
- The thumbnail is `alt=""` — the name below is the caption; announcing the
  filename twice is noise.
- The ✕ overlaps the tile corner at 24 — pointer-dense exemption; the tile
  itself is the big target.

## Don't

- **Don't put upload progress in the tile** — a file being uploaded is the
  caller's state to render (a Skeleton tile, a ProgressBar below).
- **Don't make the tile the only path to removal on touch** — hover-reveal is
  a pointer nicety; the focus path works, but a touch-first surface should
  offer removal in the preview too.
- **Don't encode VCP evidence rules here** — "this claim needs 2 documents"
  is a pattern's business.
