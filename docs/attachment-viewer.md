# AttachmentViewer *(component)*

A full-screen gallery for the files attached to something: open one and see it large, step to the next, jump with the
strip of thumbnails along the bottom, download it, close it. It is what a press on a `FileAttachment` opens.

Built from the opened-image and opened-PDF screens the product has today, kept to the same features and drawn with the
system's own pieces.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `IconButton` | atom |
| `Modal` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AttachmentViewer` | Opening an attached file full screen, with the others a step away |
| `AttachmentPreview` | A single file inline, in a column or an expanded row, with no gallery |
| `FileAttachment` | The closed form: the card that opens this |

## What it does

| | |
|---|---|
| **Every file** | A header with the file's glyph, its name and "2 of 4", a download button and a close button. Previous and next arrows at the sides (stopped at the first and last). A strip of thumbnails along the bottom, the picture itself for an image and a document glyph otherwise, with the open one marked. `←` and `→` step; Escape closes |
| **An image** | Shown **fitted to the frame**: scaled up or down until its longer side fills the space, so it never clips and never goes behind an arrow (the stage is padded by the arrows' width). **Zoom:** − and + buttons and a reset, with the percentage beside them (25 to 400 in steps of 25; the keys `+`, `-` and `0` do the same). Zoomed in, it scrolls |
| **A PDF** | In the browser's own viewer, in a frame. It has its own zoom, search and print, so ours is not drawn |
| **A video** | Plays, with the browser's controls |
| **Anything else** | "No preview available for this file." and the download |

It reports: the page owns which file is open (`index`, or `defaultIndex`) and what downloading means (`onDownload`).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `files` | `{ id, name, kind, src?, thumb? }[]` | required | `kind` is `image`, `pdf`, `video`, `doc` or `csv`. `src` is the file; without it the stage says there is no preview. `thumb` is the strip's picture (an image falls back to `src`) |
| `open` | `boolean` | required | |
| `index` / `onIndexChange` | `number` / `(i) => void` | — | Controlled: which file is open |
| `defaultIndex` | `number` | `0` | Uncontrolled: which opens first |
| `onClose` | `() => void` | required | Escape, the close button |
| `onDownload` | `(file) => void` | — | Renders the download button and fires with the open file |

## Tokens

It is `Modal` at its `full` size (the whole viewport, no corners or shadow). Inside, it is drawn in the dark theme whatever
the page is (`.dark`), with `surface.canvas`, a `stroke.subtle` rule under the header and over the strip, `text.primary`
and `text.tertiary` for the name and the count. The arrows are `IconButton` `neutral`; the strip's thumbnails are 56 square
on `surface.neutral.subtle`, the open one with a `stroke.focused` outline; the zoom group is a `surface.neutral.subtle` pill
of three `IconButton`s and the percentage. No new tokens.

## Accessibility

- It is `Modal`'s dialog, so its focus contract holds: focus moves in, the page behind is inert, Tab stays inside, and closing
  returns focus to what opened it. The dialog is named "Attachment: {name}".
- The picture is not announced twice: the header names the file, and the image has an empty `alt`. A PDF's frame and a video
  carry the file's name.
- The percentage is `aria-live="polite"`, so a zoom is read out. The strip's thumbnails are buttons named "{name}, 2 of 4"
  with `aria-current` on the open one.
- **Contrast holds on the dark surface**, and a story measures it. Text: the name 17.9:1, the count 12:1, the percentage 10.4:1. Glyphs: download and close 12:1, the arrow 12:1, zoom 7:1 at rest (8.4:1 hovered on its fill, 6.9:1 pressed on its fill), a document thumbnail 7:1. Marks: the arrows' edge 3.75:1, the open thumbnail's outline 7.7:1. Disabled controls (the first file's previous arrow, the reset at 100%) are exempt. Every colour is a semantic token.
- Everything is reachable by keyboard; the arrow keys and `+ - 0` are shortcuts, not the only way.

## Don't

- **Don't build the download here.** It reports the file; the page decides where it comes from.
- **Don't use it for one inline preview.** That is `AttachmentPreview`.
- **Don't draw zoom controls over a PDF.** The browser's viewer has its own.
