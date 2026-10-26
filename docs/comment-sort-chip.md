# CommentSortChip

The comments' sort switch: "Newest First" or "Oldest First", with a glyph that
points the way. One click flips it to the other. A component.

Read off the Figma `_Comment_Filter_chip` (Sort = Newest, Oldest).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `CommentSortChip` | The header of a comment list, to switch between newest and oldest first |
| `Chip` | A filter that selects, or a tag that can be removed. A rounded pill; this is a rectangle |
| `Select` / `Menu` | A sort with more than two orders |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `sort` | `newest \| oldest` | — | The current order, controlled |
| `defaultSort` | `newest \| oldest` | `newest` | The uncontrolled starting order |
| `onSortChange` | `(sort) => void` | — | Fires with the order the click switches **to** |
| `className`, `ref`, rest | | | On the `<button>` |

## Tokens

| Part | Token | Utility |
|---|---|---|
| Fill | `neutral.tonal.surface.default` / `.hover` / `.pressed` | `bg-neutral-tonal-surface-*` |
| Text | `neutral.tonal.content.default` / `.hover` / `.pressed` | `text-neutral-tonal-content-*` |
| Type | `type.label-sm-medium`, 14 | `text-label-sm-medium` |
| Shape | 32 tall, `radius.sm`, 16 left and 8 right padding, 8 gap | `h-8 rounded-sm pl-4 pr-2 gap-2` |
| Glyph | `sort-descending` (newest) / `sort-ascending` (oldest), 20 | `Icon size="md"` |

Phosphor names the glyphs by the order of the bars: `sort-descending` is the one whose
arrow points up, which is what the design draws for Newest First. The design's glyph
box is 18; the Icon set draws 16 or 20, and 20 is the closer.

Contrast of the text on its fill, light: **8.4:1** default, **9.85:1** hover, **6.96:1**
pressed.

**Token gap, for design:** in dark the hover and pressed fills are *lighter* than the
default while the text stays light, so hover is **3.86:1** and pressed **2.34:1**, under
the 4.5:1 text needs. The family's own hover and pressed text tokens are used, and they
do not fix it in dark; the dark `neutral.tonal.surface` hover and pressed steps need to
go the other way.

## Accessibility

- A real `<button>`. It shows the **current** order, as drawn, so its name spells out
  what it is: "Sort comments: Newest First", which still contains the visible words.
- The glyph is `aria-hidden`.
- 32 tall by default and 40 on a coarse pointer.

## Don't

- **Don't use it for a sort with three or more orders.** A switch between two is its
  whole job; use a `Menu`.
- **Don't relabel it with the *next* order.** It shows the current one, as the design does.
