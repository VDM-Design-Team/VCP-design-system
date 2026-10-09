# Dropzone

The file target: click to browse, or drag files onto it. Hands the caller
`File[]` and nothing more.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `Dropzone` | Attaching files is a real part of the task (evidence, documents) |
| A plain button + hidden input | One-off, space-tight uploads (an avatar) |
| `FileAttachment` *(to port)* | Showing what was uploaded — compose it below this |

The zone is only the *intake*. Upload progress, retries, previews and the
resulting list live with the caller — this component forgets the files the
moment it hands them over.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onFiles` | `(files: File[]) => void` | — | From browse or drop; never fires empty |
| `label` | `string` | `'Upload a file'` | The linked verb in "… or drag and drop" |
| `hint` | `string` | `'PNG, JPG, GIF, DOCX, CSV and PDF file up to 10MB'` | The contract line under the label |
| `error` | `ReactNode` | — | The rejection, in words. The design's Error state: critical border, message replacing `hint`. Sets `aria-invalid` and is wired with `aria-describedby` |
| `accept` | `string` | — | Filters the **browse dialog only** — dropped files arrive unfiltered; validate them |
| `multiple` | `boolean` | `true` | — |
| `disabled` | `boolean` | — | Also inert to drops |
| `className` | `string` | — | On the zone |
| `ref` | `Ref<HTMLInputElement>` | — | The real file input |

Everything else is forwarded to the input (`name`, `required`, `aria-*`).

## The keyboard path is real

The export hid the input with `display:none` — removing it from the tab
order, leaving a target only pointers could reach. Here the input is `sr-only`:
Tab lands on it, Enter/Space open the browse dialog, and the zone draws the
shared focus ring via `focus-within`. Drag-and-drop is the pointer bonus on
top, never the only way in. Selecting the same file twice in a row fires
again (the input resets after each hand-off).

## Tokens

Built to Figma's `_Attachment_Drop_Container` (design review, 5 Oct 2026). The
zone is a 2 dashed border, 24 padding, 8 between the parts, over `radius.md`. A
32 `paperclip` (`text.subtle`, in every state but disabled) sits above two lines: **"Upload a file or drag
and drop"** in `body-sm-regular` (14 regular) — the link in `text.link.default`,
underlined (the system's link style), the rest `text.primary` — and the accepted
types in `text.tertiary`, `caption-md-regular`.

Three states, each a change of stroke and fill:

| State | Stroke | Fill |
|---|---|---|
| Regular | `stroke.default` | `surface.neutral.faint` |
| Drag-over | `stroke.focused` | `surface.brand.subtle` |
| Error | `accent.critical.outline.border.default` | `surface.neutral.faint` (the same as regular) |

The error message sits in `accent.critical.tonal.content.default` in the hint's place.

**Drag-over covers the vicinity.** A file dragged over the zone or within 16 of it
counts. While a file is being dragged anywhere on the page, a hit area 16 wider than
the zone on every side takes the drop; at rest that area does not exist, so it cannot
swallow clicks meant for what sits beside the zone. The state resets on a drop, on
`dragend`, and when the drag leaves the window.

**The link, while dragging.** Link blue on `surface.brand.subtle` is 3.4:1 in light and
4.16:1 in dark, under the 4.5:1 text needs, and its hover and pressed shades are no better
in dark. So while a file is dragged over, the link takes the line's own colour
(`text.primary`) and keeps its underline; the border and fill carry the state.

**The dash.** The 4 dash pattern of Figma's stroke is the browser's: a 2 dashed border
draws about 4-long dashes in Chromium. CSS cannot set it exactly without an SVG border.

| Pair | Light | Dark |
|---|---|---|
| Dashed border on the resting fill | **1.42:1** ⚠ | **2.36:1** ⚠ |
| Drag-over border on its tint | **4.19:1** | **3.91:1** |
| Error border on the resting fill | **3.64:1** | **3.74:1** |
| Link on the resting fill | **4.79:1** | **8.22:1** |
| Link while dragging (line colour) on the drag-over tint | **13.69:1** | **9.04:1** |
| Line one on the resting fill | **19.28:1** | **17.85:1** |
| Hint on the resting fill | **7.24:1** | **12.02:1** |
| Paperclip (`text.subtle`) on the resting fill | **4.55:1** | **6.96:1** |
| Paperclip (`text.subtle`) on the drag-over tint | **3.23:1** | **3.53:1** |

⚠ **The resting border is well under the 3:1 a control boundary needs**, in both themes.
The previous version used `stroke.field` (4.76:1) for exactly this reason; the design
specifies `stroke.default`, so this follows the design. The zone is still identified by its
text and icon, and the border darkens to `stroke.focused` on hover, but it is a known soft
spot — a candidate for `stroke.field` if design agrees.

## Accessibility

- The input is real and focusable; the whole zone is its `<label>`, so
  clicking anywhere opens the dialog and the name is the visible text.
- `accept` is a convenience, not a gate — announce actual constraints in
  `hint` and validate what arrives, because drops bypass the filter.
- Disabled is visibly quiet *and* inert to drops — not just a greyed label
  over a live target.
- `error` is announced, not just painted: the input gets `aria-invalid` and
  `aria-describedby` pointing at the message. The zone **stays usable** in
  the error state so the next attempt costs nothing.
- Drag-over state changes border **and** fill — never colour of one element
  alone — and the link keeps its underline.
- The 16 drag hit area exists only while a file is being dragged, so it never
  intercepts a click or a tap.

## Don't

- **Don't trust `accept`.** Dropped files ignore it; validate in `onFiles`.
- **Don't build upload progress into the zone** — it hands off and forgets;
  progress belongs to the list you render below.
- **Don't hide the hint when there are real constraints** — discovering the
  10 MB limit from a failed upload is the bad version.
- **Don't nest it inside another label or button** — it is a `<label>` with a
  control inside.
