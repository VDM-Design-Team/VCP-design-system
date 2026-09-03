# EmojiReactionPicker

The reaction row under a comment: existing reactions as toggleable pills, and
a "+" that opens the palette in a `Popover`.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Popover` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `EmojiReactionPicker` | Lightweight acknowledgement on comments and updates |
| `CommentComposer` *(pattern, to port)* | An actual reply |
| `Toggle` / `Checkbox` | A real setting — reactions are social, not state |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `reactions` | `Array<{ emoji, count, mine? }>` | `[]` | The pills, in order. `mine` drives `aria-pressed` and the tint |
| `onToggle` | `(emoji) => void` | — | A pill click — add or retract *your* reaction; the caller owns the math |
| `emoji` | `string[]` | a neutral eight | The palette in the popover |
| `onSelect` | `(emoji) => void` | — | A palette pick; the popover closes itself |
| `className` | `string` | — | On the row |
| `ref` | `Ref<HTMLDivElement>` | — | The row |

State lives with the caller: this component renders and reports. The Default
story shows the usual reducer (toggle flips `mine` and adjusts `count`;
select adds or joins).

## Tokens

Pills: `surface.elevated` on `stroke.subtle`, counts in the numeric face
(`caption-md`); *mine* swaps to `surface.brand.faint` on
`stroke.brand.strong` with `text.brand.strong`. Palette buttons hover
`surface.neutral.faint`; everything focus-rings with `stroke.focused`. No
new tokens.

| Pair | Light | Dark |
|---|---|---|
| Count on a plain pill | **10.35:1** | **11.87:1** |
| Count on a *mine* pill | **11.37:1** | **8.97:1** |
| *Mine* border on the page | **9.04:1** | **6.33:1** |

## Accessibility

- Pills are toggle buttons: `aria-pressed` for "you reacted", with the name
  saying what a glance says — "3 reactions, 👍, you reacted". Emoji + count
  alone answer neither question a screen reader user has.
- The "+" is "Add reaction"; the palette is a named `group` of "React with
  X" buttons inside the system `Popover`, which owns open/close, Escape and
  focus-return.
- Pills are 24 tall — the pointer-dense exemption; reactions are a
  comment-thread affordance, not a primary action.
- The tint on *mine* is never alone: `aria-pressed`, the border step and the
  label all say it too.

## Don't

- **Don't store reaction state in the component** — two comment threads
  sharing a picker instance would share reactions.
- **Don't grow the palette past a glanceable grid** — this is
  acknowledgement, not an emoji keyboard.
- **Don't use reactions as votes that decide anything** — approvals in VCP
  are reviews, not 👍 counts; if a count carries authority it needs a real
  control and an audit trail.
- **Don't put the picker on things nobody should react to** — status changes
  and system events read as noise with a 🎉 on them.
