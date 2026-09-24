# EmojiReactionPicker

The reaction row under a comment: a standalone thumbs-up quick-react,
existing reactions as toggleable pills, and an "add reaction" trigger (a
smiley with a small plus mark) that opens the full palette in a `Popover`.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The thumbs-up quick-react, and the smiley + plus that opens the palette |
| `Popover` | component | The palette panel |
| `Tooltip` | component | The design's Hover Tooltip, naming who reacted |

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
| `reactions` | `Array<{ emoji, count, mine?, people? }>` | `[]` | The pills, in order. `mine` drives `aria-pressed` and the tint; `people` adds the hover tooltip |
| `onToggle` | `(emoji) => void` | — | A pill click, **or the standalone thumbs-up button** — add or retract *your* reaction; the caller owns the math |
| `maxVisible` | `number` | `5` | Reaction pills shown before the rest collapse into a trailing "+N" chip. Figma draws an overflow state but doesn't fix a specific cutoff — pick what fits |
| `emoji` | `string[]` | a neutral eight | The palette in the popover |
| `onSelect` | `(emoji) => void` | — | A palette pick; the popover closes itself |
| `className` | `string` | — | On the row |
| `ref` | `Ref<HTMLDivElement>` | — | The row |

State lives with the caller: this component renders and reports. The Default
story shows the usual reducer (toggle flips `mine` and adjusts `count`;
select adds or joins).

## Who reacted

Pass `people` on a reaction and the pill gets the design's **Hover Tooltip**
state — the names, on the system `Tooltip`, phrased like `AvatarGroup`'s
summary ("You, Marvin Ode and 1 other"). Because it is the real `Tooltip`,
it opens on **keyboard focus** as well as hover, so the names are not
pointer-only. Omit `people` and there is no tooltip: a count with no names
to show has nothing to add.

## Tokens

Pills: `surface.elevated` on `stroke.subtle`, counts in the numeric face
(`caption-md`); *mine* swaps to `surface.brand.faint` on **`stroke.focused`**
with the count set to **`text.brand.medium`** — corrected from
`stroke.brand.strong` / `text.brand.strong` against a design audit (24 Sep
2026). The emoji glyph itself carries no colour class — emoji render in
their own native colours and ignore `currentColor` either way. The emoji
span is now sized to match the count (`caption-md`), where the export left
it unsized. Palette buttons hover `surface.neutral.faint`; everything
focus-rings with `stroke.focused`.

**One new token:** `neutral.textual.content` (`default`/`hover`/`pressed`/
`disabled`), for the thumbs-up quick-react and the add-reaction trigger —
neither is a reaction itself, so neither gets the bordered pill treatment.
Figma's own `neutral.textual` family was previously unimported (see
`docs/color-tokens.md`'s "Neutral treatments" section); only `.default` is
confirmed against Figma directly, the other three states mirror
`neutral.outline.content`'s own slate steps.

| Pair | Light | Dark |
|---|---|---|
| Count on a plain pill | **10.35:1** | **11.87:1** |
| Count on a *mine* pill (`text.brand.medium` on `surface.brand.faint`) | **5.31:1** | **5.31:1** — no dark override on either token |
| *Mine* border on the page (`stroke.focused` on `surface.brand.faint`) | **5.31:1** | **5.31:1** |

## Accessibility

- Pills are toggle buttons: `aria-pressed` for "you reacted", with the name
  saying what a glance says — "3 reactions, 👍, you reacted". Emoji + count
  alone answer neither question a screen reader user has.
- **The standalone thumbs-up button is a toggle too.** It looks up `👍` in
  `reactions` and mirrors that pill's `mine` state in its own
  `aria-pressed` and name ("React with thumbs up" / "Remove thumbs up
  reaction"), rather than always announcing the same thing regardless of
  whether the user already reacted.
- The add-reaction trigger is named "Add reaction" and also carries a
  visible `Tooltip` with the same text. The tooltip wraps the whole
  `Popover`, not just the button inside it — `Popover` clones its own
  `trigger` directly (ref, `onClick`, `aria-expanded`), and nesting
  `Tooltip` inside that clone would break it. Since the tooltip's text only
  repeats the button's own `aria-label`, nothing is lost for a screen
  reader by `aria-describedby` landing on `Popover`'s wrapper instead of
  the button.
- The palette is a named `group` of "React with X" buttons inside the
  system `Popover`, which owns open/close, Escape and focus-return.
- Pills are 24 tall — the pointer-dense exemption; reactions are a
  comment-thread affordance, not a primary action.
- The tint on *mine* is never alone: `aria-pressed`, the border step and the
  label all say it too.
- **The "+N" overflow chip is not interactive** — it's a count, not a
  control, so it carries `aria-label` rather than being a button with
  nothing to click through to. If a screen ever needs to click through to
  the full list, that's a new affordance, not a retrofit onto this chip.

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
