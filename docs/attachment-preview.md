# AttachmentPreview

The opened attachment: a header naming the file with download/close
affordances, and a body showing the image — or an honest "No inline preview".

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AttachmentPreview` | Inline: the right column of an evidence screen, an expanded row |
| `Modal` + `AttachmentPreview` | When opening should interrupt the page |
| `FileAttachment` | The closed form — the tile this opens from |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | required | Header title; also names the download button |
| `src` | `string` | — | Required for an inline image preview |
| `kind` | `image \| doc` | `image` | `doc` (or image without `src`) shows the no-preview state |
| `size` | `string` | — | '1.2 MB' |
| `onDownload` | `() => void` | — | `IconButton` "Download ${name}" |
| `onClose` | `() => void` | — | `IconButton` "Close preview" |
| `className` | `string` | — | On the panel |
| `ref` | `Ref<HTMLDivElement>` | — | The panel |

## Tokens

Panel `surface.elevated` on `stroke.subtle`, `radius.md`, `shadow.menu`
(the export's 12px radius has no token step — `md` is the system corner).
Header name `label-md` `text.primary`, size `label-sm` `text.subtle`; body
well `surface.canvas` with `text.tertiary` for the no-preview state. The
affordances are `IconButton tertiary sm` — nothing bespoke. New glyph
`download-simple` (with `image`) added from Phosphor.

## Accessibility

- Header buttons carry real names: "Download ${name}", "Close preview".
- The image is `alt=""` — the header names the file; a duplicate
  announcement is noise. If the *content* of the image needs describing,
  that description belongs with the caller who knows what it shows.
- "No inline preview" is text, not an empty grey box — the honest state, with
  download as the actual path to the content.
- This is an inline panel with no dialog semantics of its own. Inside a
  `Modal`, the modal owns focus and Escape; `onClose` here is just a button.

## Don't

- **Don't fake previews.** No PDF-in-an-iframe experiments inside this
  component — `doc` says what it can't do and offers download.
- **Don't wire `onClose` without a place for focus to go** — inline, the
  caller decides what closing reveals.
- **Don't stretch it full-bleed** — the image is capped (max-height) so the
  header stays on screen; a lightbox is a different component.
