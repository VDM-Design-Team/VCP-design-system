# FileAttachment

One attached file as a small card: kind glyph and name, optional open and
remove. Built to Figma's `_File_Attachment_Card` and its states frame. No
file size: Figma's card doesn't show one.

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
| `name` | `string` | required | A long name shortens its stem and keeps the extension ("2)-Some….pdf" for "2)-Some-very-long-file-name.pdf"); a short one stays centred under the glyph. The full name is in a `title` tooltip and names the ✕ ("Remove ${name}") |
| `kind` | `image \| pdf \| doc \| csv \| video` | `doc` | Picks the glyph when there is no `thumb` |
| `thumb` | `string` | — | Image src, shown in the glyph's place at the glyph's 32 size — the card keeps its shape |
| `domain` | `design \| development \| governance \| content \| partners \| qa` | — | The domain an AV was handed over from — draws the corner badge with that domain's glyph and code (below). Omit it and there's no badge |
| `domainLabel` | `string` | — | A badge code outside the six domains. Ignored when `domain` is set |
| `domainIcon` | `IconName` | `pen-nib` | The glyph for `domainLabel`. Ignored when `domain` is set |
| `onClick` | `() => void` | — | Makes the card a real button — usually "open the preview". Only an openable card has hover and pressed fills |
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

One bordered card — `stroke.subtle` border, `radius.sm`, 8 padding — with the
kind glyph (32, `neutral.outline.content.default`) centred over the name
(`body-sm-regular`, `text.secondary`). Matches Figma's
`_File_Attachment_Card` (aligned 2 Oct 2026); before that the code had a
separate thumbnail well with a smaller name underneath it.

| State | What changes | Token |
|---|---|---|
| Hover | The card fills | `surface.brand.faint` |
| Pressed | The card fills deeper, and the ✕ hides — the press is "open", nothing else | `surface.brand.subtle` |
| Hover on the ✕ only | The ✕ darkens; the card does **not** fill | `accent.critical.tonal.surface.hover` |
| ✕ pressed | | `accent.critical.tonal.surface.pressed` |

The fill sits on the 8-radius button around the 6-radius card, as Figma's
states frame draws it. A card without `onClick` has no hover or pressed state
— Figma notes the hover state isn't available in view mode.

The ✕ is Figma's `_File_Attachment_Remove_Button`: a 28 box, 24 circle,
`accent.critical.tonal.surface` behind an `x` in
`accent.critical.outline.content`, in the card's top-right corner.

`domain` is Figma's `_Domain_Label`, shown when an AV is handed from one domain to
another: a pill in `neutral.tonal.surface.default` / `neutral.tonal.content.default`
(the same for every domain — it does not change) with a 1 `stroke.inverse` border.
It is 20 high — 8 either side, 2 above and below, 4 between glyph and code, a 12
glyph, `caption-sm-medium` text — inset 4 from the card's top-left corner. Figma draws
the glyph as Heroicons; per docs/icon.md this system uses Phosphor.

The badge's mapping is owned here, and only here:

| `domain` | Glyph | Code |
|---|---|---|
| `design` | `pen-nib` | DS |
| `development` | `code` | DV |
| `governance` | `bank` | GV |
| `content` | `image` | CN |
| `partners` | `handshake` | PT |
| `qa` | `file-magnifying-glass` | QA |

`file-magnifying-glass` was added to the icon set from Phosphor for it.

**Edit mode** (has `onRemove`) and **view mode** (no `onRemove`):

| | Edit mode | View mode |
|---|---|---|
| Hover the card | Fills `surface.brand.faint`; the ✕ appears | Fills `surface.brand.faint` |
| Hover the ✕ | Card unfilled; the ✕ takes its hover fill | — |
| Pressed | Fills `surface.brand.subtle`; no ✕ | Fills `surface.brand.subtle` |

A remove-only card (`onRemove` without `onClick`) still takes the hover fill and the
✕; it has no pressed state, since there is nothing to press.

| Pair | Light | Dark | Needs |
|---|---|---|---|
| Name on the page | **9.90:1** | **14.48:1** | 4.5:1 |
| Name, hovered card | **8.90:1** | **10.73:1** | 4.5:1 |
| Name, pressed card | **7.03:1** | **7.34:1** | 4.5:1 |
| Kind glyph on the page | **7.24:1** | **12.02:1** | 3:1 |
| Domain badge text | **8.40:1** | **8.40:1** | 4.5:1 |
| Remove ✕ glyph | **3.91:1** | **3.47:1** | 3:1 |

## Accessibility

- Openable tile = real button whose name is the visible file name; ✕ =
  "Remove ${name}" — ten tiles, ten distinct names.
- A `thumb` image is `alt=""` — the name below is the caption; announcing
  the filename twice is noise.
- The ✕ is 28 in the card's corner, 2 in from the top and right edges —
  pointer-dense exemption; the card itself is the big target.
- The domain badge is `aria-hidden`; the domain is repeated as visually-hidden
  text ("Design domain.") in the card instead of being silently dropped.
- Keyboard focus gets the standard `stroke.focused` ring on the card and on
  the ✕. Figma draws no focus state; the ring is the system's rule 5.

## Don't

- **Don't put upload progress in the tile** — a file being uploaded is the
  caller's state to render (a Skeleton tile, a ProgressBar below).
- **Don't make the tile the only path to removal on touch** — hover-reveal is
  a pointer nicety; the focus path works, but a touch-first surface should
  offer removal in the preview too.
- **Don't encode VCP evidence rules here** — "this claim needs 2 documents"
  is a pattern's business.
