# RemoveButton *(atom)*

The small critical ✕ that takes one item out of a list: a card in a description, a file in a
gallery. Icon only, so it has a required name.

Two looks, one family. `plain` is the glyph alone, the system's plain ✕. `tonal` is a ✕ on a filled disc,
which also works over a picture, where a bare glyph could vanish into the image. Both take their colour from `accent.critical.outline.content` (default, hover,
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
| `RemoveButton`, `tonal` | Removing a card or a file: `DescriptionCard` and `FileAttachment` |
| `RemoveButton`, `plain` | A bare ✕ on a plain surface, where the disc is too much |
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
| Glyph | `Icon` | `x` in both: 16 (`plain`), 14 on the disc (`tonal`) |
| Target | | `before:-inset-2.5`: 10 past the button on every side, so 40. The click area is invisible padding, much bigger than the drawing |
| Focus | `stroke.focused` | 2 outline, 2 offset |

## Accessibility

- A real `<button>` with a required `aria-label`; the glyph is decorative.
- The 40 target is invisible padding around a 20 button.
- **Contrast at rest holds 3:1 (WCAG 1.4.11) in both themes**, and a story measures it. Plain against the
  surface: 4.77 light, 5.06 dark. Tonal against its disc: 3.91 light, 3.47 dark. Hover and pressed are
  higher (plain 6.4 / 8.4 light, 7.6 / 10.1 dark; tonal 4.4 / 4.4 light, 4.4 / 4.4 dark).

## Design note

The description card's remove button in Figma is a ring ✕ (`x-circle`) with no fill, while the file
attachment's is a ✕ on a filled disc, which is the system's other ✕ controls' glyph (`Chip`, `Tag`,
`TagEditor` all use the plain `x`). **Both now use the `tonal` look**, with the plain ✕ at 14 on the disc, as
a proposal for design to review rather than two conflicting styles. If design keeps the ring, only
`DescriptionCard` changes; `plain` stays for a bare ✕ on a plain surface.

## Don't

- **Don't use it for a destructive action on a record.** That is `IconButton` `danger`, or a `Button`.
- **Don't put your own reveal logic in the atom.** The item decides when it shows.
- **Don't draw a red ✕ yourself.** Use this, so every remove looks and behaves the same.
