# DescriptionSection *(component)*

One block of an Added Value's description: a title with an optional round add button after it,
the numbered `DescriptionCard`s under it, and the files attached to it with a paperclip to attach
more. There are four, and `type` picks which.

Read off the Figma `Description_Card_Content` (`_Added_Value_Description_Header`, the `Cards`
slot and `Attached`), in its edit and view variants.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `IconButton` | atom |
| `DescriptionCard` | component |

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
| `type` | `'problem' \| 'solution' \| 'deliverable' \| 'desired-outcome'` | required | Which section. It fixes the title, the colour of the cards, and which controls exist (below) |
| `headingLevel` | `'h2' \| 'h3' \| 'h4'` | `h2` | The level to draw the title as. A screen reader user jumps between headings, so it has to fit the page's outline: `h2` directly under the page's `h1`, `h3` inside a modal whose title is an `h2` |
| `open` / `onOpenChange` | `boolean` / `(open) => void` | — | Controlled: whether the cards and files are showing. Every section folds; this is the toggle's state |
| `defaultOpen` | `boolean` | `true` | Uncontrolled: whether it starts open |
| `onAdd` / `addLabel` | `() => void` / `string` | — / "Add problem" | Renders the round add button after the title. Leave it off for a view. Ignored on desired outcome |
| `onAttach` / `attachLabel` | `() => void` / `string` | — / `Attach files` | Renders the paperclip under the cards and reports the press. It does not open anything: the page opens the file picker, or the attachment modal with a `Dropzone`. Leave it off for a view. Ignored on desired outcome |
| `attachments` | `ReactNode` | — | The attached files, as `FileAttachment`s (an image shows its own thumbnail through `thumb`), to the left of the paperclip. Opening one leads to `AttachmentPreview` |
| `children` | `ReactNode` | — | The `DescriptionCard`s, with no `type` or `position` of their own: the section gives each its type (so its colour and prompt), its number, and a name for its remove button ("Remove problem 2"), unless the card sets its own. Each is drawn as an item of an ordered list, 16 apart |
| `className`, `ref`, rest | | | On the root `<section>` |

### The four sections

| `type` | Title | Cards | Add | Files |
|---|---|---|---|---|
| `problem` | Problems | red | yes | yes |
| `solution` | Solutions | green | yes | yes |
| `deliverable` | Acceptance Criteria / Deliverables | the deliverable colour | yes | yes |
| `desired-outcome` | Desired outcome | dark | no (it is one card) | no |

The title is fixed, not a prop: a section is not a free-form container, and one name per
type keeps the page consistent. This table is the one place the titles live.

**It is the frame, not the content.** The cards and the files are the caller's, and each card
says whether it is being read or edited (its text, its `editing`, its `onRemove`). The section only decides the layout and which controls
exist, so one component is both the editor (pass `onAdd`, `onAttach`) and the view (pass neither).

## Tokens

`surface.elevated`, `radius.md`, 24 padding (as the Detail card), 16 between the title row, the cards and the
attachments row, 16 between cards. The fold button is a `tertiary` `IconButton` (40) with a 20 `caret-down` / `caret-up` in `text.secondary`, pulled in 8 so the caret sits on the padding's edge. The title is `title-sm-bold` (16/700) `text.primary`. The add button is
an `IconButton` `primary`, `xs` (24) with a 40 target; the paperclip is `tertiary`, `md` (40), its glyph in the `neutral.outline.content` palette (default, hover, pressed). No
new tokens.

## Accessibility

- A `<section>` named by its heading (`aria-labelledby`), so each is a region a screen reader can
  jump to. The cards are an `ol`, so "item 2 of 3" is announced; the number block is decorative.
- **The fold button** is an icon button at the right of the header, named for what it does and to which section ("Collapse Problems" / "Expand Problems"), with `aria-controls` the body. Only it is the toggle; the title is plain text. The body is hidden, not unmounted, so typed text survives folding, and it slides (200, ease-out); folding also dissolves the content over 100 as it lifts a little, so it is not seen being squeezed. None of it under reduced motion.
- The add button's default name is "Add problem" ("Add solution"…), so a page with several sections has
  distinct buttons. The paperclip is "Attach files".
- The add button is 24 to look at and 40 to press (its target reaches 8 past the circle).

## Don't

- **Don't put the cards' logic here.** Whether a card is editing, its text and its remove are the
  card's and the caller's.
- **Don't offer attachments on Desired Outcome.** It has none in the design: pass neither `onAttach` nor `attachments`.
- **Don't add a second heading inside.** The title is the heading.
- **Don't show the add button or the paperclip in a view.** Pass neither handler (the fold button stays).
