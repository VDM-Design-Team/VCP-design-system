# DescriptionSection *(component)*

One block of an Added Value's description: a title ("Problems", "Solutions", "Desired
Outcome") with an optional round add button after it, the numbered `DescriptionCard`s under
it, and the files attached to it with a paperclip to attach more.

Read off the Figma `Description_Card_Content` (`_Added_Value_Description_Header`, the `Cards`
slot and `Attached`), in its edit and view variants.

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DescriptionSection` | The frame around an AV's problems, solutions, deliverables or desired outcome, in an editor or a view |
| `DescriptionCard` | One entry. Pass them as the section's children |
| `FileAttachment` | One attached file. Pass them as `attachments` |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | The section's name. It is the heading, and names the region |
| `headingLevel` | `'h2' \| 'h3' \| 'h4'` | `h2` | The level to draw the title as. A screen reader user jumps between headings, so it has to fit the page's outline: `h2` directly under the page's `h1`, `h3` inside a modal whose title is an `h2` |
| `onAdd` / `addLabel` | `() => void` / `string` | — / "Add {title}" | Renders the round add button after the title. Leave it off for a section with one card (Desired Outcome) or for a view |
| `onAttach` / `attachLabel` | `() => void` / `string` | — / `Attach files` | Renders the paperclip under the cards and reports the press. It does not open anything: the page opens the file picker, or the attachment modal with a `Dropzone`. Leave it off for a view |
| `attachments` | `ReactNode` | — | The attached files, as `FileAttachment`s (an image shows its own thumbnail through `thumb`), to the left of the paperclip. Opening one leads to `AttachmentPreview` |
| `children` | `ReactNode` | — | The cards. Each is drawn as an item of an ordered list, 16 apart |
| `className`, `ref`, rest | | | On the root `<section>` |

**It is the frame, not the content.** The cards and the files are the caller's, and each card
says whether it is being read or edited. The section only decides the layout and which controls
exist, so one component is both the editor (pass `onAdd`, `onAttach`) and the view (pass neither).

## Tokens

`surface.elevated`, `radius.md`, 16 padding, 12 between the title row, the cards and the
attachments row, 16 between cards. The title is `title-sm-bold` (16/700) `text.primary`. The add button is
an `IconButton` `primary`, `xs` (24) with a 40 target; the paperclip is `tertiary`, `md` (40), its glyph in the `neutral.outline.content` palette (default, hover, pressed). No
new tokens.

## Accessibility

- A `<section>` named by its heading (`aria-labelledby`), so each is a region a screen reader can
  jump to. The cards are an `ol`, so "item 2 of 3" is announced; the number block is decorative.
- The add button's default name is "Add Problems", so a page with several sections has distinct
  buttons. The paperclip is "Attach files".
- The add button is 24 to look at and 40 to press (its target reaches 8 past the circle).

## Don't

- **Don't put the cards' logic here.** Whether a card is editing, its text and its remove are the
  card's and the caller's.
- **Don't offer attachments on Desired Outcome.** It has none in the design: pass neither `onAttach` nor `attachments`.
- **Don't add a second heading inside.** The title is the heading.
- **Don't show the add button or the paperclip in a view.** Pass neither handler.
