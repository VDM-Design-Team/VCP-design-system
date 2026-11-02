# DeliverableLink *(component)*

One link added to a deliverable: the domain that added it, and its title as a hyperlink. Editable, it has a
pencil and a bin on the right.

Read off Figma's `_Deliverable_Added_Link_Item` (Default, Hover, Editing), `_Deliverable_Added_Title_Hyperlinked`
and `_Deliverable_Link_Actions`.

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |
| `DeliverableLinkForm` | component |
| `DomainLabel` | component |
| `Tooltip` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DeliverableLink` | A row in a deliverable's list of links |
| `FileAttachment` | A file, not a link |

## Behaviour

- **Viewing:** the `DomainLabel` and the title as a link (`text.link`, underlined on hover), opening in a new tab
  (`rel="noopener noreferrer"`).
- **Editable:** a pencil ("Edit Link") and a bin ("Delete Link", critical) at the right, shown while the row is
  hovered or has focus (always on a touch screen). The row fills `surface.brand.faint` meanwhile.
- **The pencil turns the row, in its own place, into the form** for that link, with Cancel and Save. Save reports the
  changed link and closes it; Cancel puts the row back.
- **A long title** is cut with "…"; its tooltip gives the whole title and the address.
- It reports; the page removes or changes the data.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title`, `url` | `string` | required | |
| `domain` | `DomainKey` | — | The domain that added it: the label before the title |
| `editable` | `boolean` | — | The pencil and the bin |
| `onSave` | `(link) => void` | — | The changed link |
| `onRemove` | `() => void` | — | The bin |
| `className`, `ref`, rest | | | On the row |

## Tokens

Row min 48 tall, `radius.sm`, 8 either side, 8 between the label and the link. Link `text.link.default` / hover /
pressed, `body-sm-regular`. Pencil and bin are `IconButton` `tertiary` `xs` (24); the bin is
`accent.critical.outline.content`. No new tokens.

## Accessibility

- The link is a real `<a>`; the pencil and the bin are real buttons, always in the tab order and only unseen
  (opacity) until hover or focus.
- The domain is spoken: "Added by Design."
- 24 is under the 40 touch minimum for the pencil and bin; they are always shown on a touch screen.

## Don't

- **Don't remove at once without the page deciding.** `onRemove` reports; confirm if it matters.
- **Don't open the link in this tab.** It is a deliverable, not navigation.
