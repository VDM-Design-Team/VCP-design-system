# RemoveButton *(atom)*

The small critical ✕ that takes one item out of a list: a card in a description, a file in a
gallery. Icon only, so it has a required name.

Two looks, one family. `plain` is the glyph alone, a ✕ in a ring, for an item on a plain surface.
`tonal` is a ✕ on a filled disc, for an item that sits on a picture, where a bare glyph could vanish
into the image. Both take their colour from `accent.critical.outline.content` (default, hover,
pressed).

## Composed of

Nothing from the system but `Icon`, which is sub-atomic.

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `RemoveButton`, `plain` | Removing a card or row that sits on a plain surface (`DescriptionCard`) |
| `RemoveButton`, `tonal` | Removing something that sits on an image (`FileAttachment`) |
| `IconButton` `danger` | A destructive action that is not "take this item out of the list": delete a record, discard a draft |
| `Tag`'s `onRemove` | A value picked into a field, inside the tag |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | The accessible name. Say which item: "Remove problem 2", "Remove report.pdf" |
| `tone` | `plain \| tonal` | `plain` | The glyph alone, or the glyph on a filled disc. Both are 20 |
| `className`, `ref`, rest | | | On the `<button>`; `type` defaults to `button` |

**It does not decide where it sits or when it shows.** Whoever uses it positions it and reveals it,
through `className`: on hover or focus of the item, and always on a touch screen. Keep it in the page
and the tab order and hide it with opacity, so a keyboard can reach it.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Glyph | `accent.critical.outline.content` default, hover, pressed, disabled | `text-accent-critical-outline-content-default hover:text-… active:text-…` |
| `tonal` fill | `accent.critical.tonal.surface` default, hover, pressed | `bg-accent-critical-tonal-surface-default hover:bg-… active:bg-…` |
| Size | Tailwind numeric scale | `size-5` (20) for both looks |
| Glyph | `Icon` | `x-circle` 20 (`plain`), `x` 12 on the 20 disc (`tonal`) |
| Target | | `before:-inset-2.5`: 10 past the button on every side, so 40. The click area is invisible padding, much bigger than the drawing |
| Focus | `stroke.focused` | 2 outline, 2 offset |

## Accessibility

- A real `<button>` with a required `aria-label`; the glyph is decorative.
- The 40 target is invisible padding around a 20 button.
- The glyph holds 3:1 against its surface; see `docs/file-attachment.md` for the measured pairs on
  the tonal disc.

## Don't

- **Don't use it for a destructive action on a record.** That is `IconButton` `danger`, or a `Button`.
- **Don't put your own reveal logic in the atom.** The item decides when it shows.
- **Don't draw a red ✕ yourself.** Use this, so every remove looks and behaves the same.
