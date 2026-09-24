# FileAttachment

One attached file as a small tile: thumbnail or kind glyph, name, size,
optional open and remove.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

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
| `domainLabel` | `string` | — | A short domain/workspace code as a corner badge on the thumbnail — "DS". Omit it and there's no badge |
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

**Three states corrected against Figma** (design audit, 24 Sep 2026), all
on the thumbnail well specifically — the only bordered/filled element the
export's own design has, so the tint lives there rather than on a new
border around the whole tile:

| State | Border | Fill |
|---|---|---|
| Hover (pointer or keyboard focus) | `stroke.focused` | unchanged |
| Pressed | `stroke.focused` | `surface.brand.faint` |

The ✕ button gets its own, separate hover fill (`surface.neutral.subtle`) —
Figma's "Hover Remove Only" state, distinct from the tile's own hover above.
Only the border-colour case is independently confirmed against Figma; the
pressed fill and the ✕'s own hover fill are the best reading of the
reference frames, not separately measured.

`domainLabel` is a small corner badge — the existing `link` icon plus text,
`surface.elevated` on `stroke.subtle`. It's `aria-hidden`, paired with
visually-hidden text ("DS domain.") so the classification isn't silent for
a screen reader.

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
- `domainLabel`'s badge is `aria-hidden`; its text is repeated as
  visually-hidden text in the tile instead of being silently dropped.
- The hover border tint applies on keyboard focus too (`group-focus-visible`),
  not pointer-only — a keyboard user tabbing to the tile sees the same
  feedback a mouse hover gives.

## Don't

- **Don't put upload progress in the tile** — a file being uploaded is the
  caller's state to render (a Skeleton tile, a ProgressBar below).
- **Don't make the tile the only path to removal on touch** — hover-reveal is
  a pointer nicety; the focus path works, but a touch-first surface should
  offer removal in the preview too.
- **Don't encode VCP evidence rules here** — "this claim needs 2 documents"
  is a pattern's business.
