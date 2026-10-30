# CommentSortChip

The comments' sort switch: "Newest First" or "Oldest First", with a glyph that
points the way. One click flips it to the other. A component, **built on `Chip`**.

Read off the Figma `_Comment_Filter_chip` (Sort = Newest, Oldest). The frame draws a
squarer neutral rectangle; that is an older look, and the chip family's rounded pill is
used. The words are fixed, not props: the only choice is which order it is in.

## Composed of

| Piece | Tier |
|---|---|
| `Chip` | component |
| `Icon` | sub-atomic |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CommentSortChip` | The header of a comment list, to switch between newest and oldest first |
| `Chip` | A filter that selects, or a tag that can be removed. The sort chip is a `Chip` with the order and its glyph filled in |
| `Select` / `Menu` | A sort with more than two orders |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `sort` | `newest \| oldest` | — | The current order, controlled |
| `defaultSort` | `newest \| oldest` | `newest` | The uncontrolled starting order |
| `onSortChange` | `(sort) => void` | — | Fires with the order the click switches **to** |
| `size`, `tone` | as `Chip` | `sm`, `default` | The chip's own size (28 or 36) and text tone |
| `className`, `ref`, rest | | | On the chip's `<button>` |

## Tokens

Nothing of its own: it is a `Chip`, so its fill, hover step, text colour, shape and focus
ring are the chip's. The glyph is `sort-descending` (newest) or `sort-ascending` (oldest),
16, in the label.

Phosphor names the glyphs by the order of the bars: `sort-descending` is the one whose
arrow points up, which is what the design draws for Newest First.

## Accessibility

- A real `<button>` (the chip's own). It shows the **current** order, as drawn, so its name spells out
  what it is: "Sort comments: Newest First", which still contains the visible words.
- The glyph is `aria-hidden`.
- 28 tall by default (`size="md"` is 36) and 40 on a coarse pointer.

## Don't

- **Don't use it for a sort with three or more orders.** A switch between two is its
  whole job; use a `Menu`.
- **Don't relabel it with the *next* order.** It shows the current one, as the design does.
