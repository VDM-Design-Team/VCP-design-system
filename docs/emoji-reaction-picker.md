# EmojiReactionPicker

The reaction row under a comment, left to right: a standalone thumbs-up
quick-react, an "add reaction" trigger (the `smiley-plus` glyph) that opens the
full palette in a `Popover`, then the existing reactions as toggleable pills.
Everything sits on an 8px gap (`space.8`).

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Icon` | atom | The thumbs-up quick-react, and `smiley-plus` (the add-reaction trigger) |
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
| `reactions` | `Array<{ emoji, count, mine?, people?, name? }>` | `[]` | The pills, in order. `mine` drives `aria-pressed` and the border/text colour; `people` adds the hover tooltip; `name` overrides the tooltip's `:emojiname:` |
| `onToggle` | `(emoji) => void` | — | A pill click, **or the standalone thumbs-up button** — add or retract *your* reaction; the caller owns the math |
| `maxVisible` | `number` | `5` | Reaction pills shown before the rest collapse into a trailing "+N" chip. Figma draws an overflow state but doesn't fix a specific cutoff — pick what fits |
| `categories` | `Array<{ name, emoji }>` | `DEFAULT_EMOJI_CATEGORIES` — Hand Gestures, Smileys & People, Symbols | The palette in the popover, grouped under category names |
| `emoji` | `string[]` | — | A flat, ungrouped palette. Wins over `categories` when given |
| `onSelect` | `(emoji) => void` | — | A palette pick; the popover closes itself |
| `className` | `string` | — | On the row |
| `ref` | `Ref<HTMLDivElement>` | — | The row |

State lives with the caller: this component renders and reports. The Default
story shows the usual reducer (toggle flips `mine` and adjusts `count`;
select adds or joins).

## Who reacted

Pass `people` on a reaction and the pill gets the design's **Hover Tooltip**
state — **Names** in bold, then "reacted with :emojiname:" — on the system
`Tooltip`. The names are phrased like `AvatarGroup`'s summary: "**You**
reacted with :thumbsup:", "**Eve and Marvin** reacted with :tada:", "**You,
Marvin Ode and 1 other** reacted with :thumbsup:". The short name comes from a
built-in map of the default palette; pass `name` for an emoji outside it (with
no name at all the tooltip shows the glyph). Because it is the real `Tooltip`,
it opens on **keyboard focus** as well as hover, so the names are not
pointer-only. Omit `people` and there is no tooltip: a count with no names
to show has nothing to add.

## Tokens

**Icon buttons** (thumbs-up, add reaction): a 16px glyph (`Icon` size `sm`) with
`space.4` padding all round, so 24 × 24 (`space.24`),
`neutral.textual.content.default` at rest and **`text.brand.medium`** on hover.
A thumbs-up you've already given stays the focused blue (`text.brand.medium`),
approved as is. The add-reaction glyph is the in-house `smiley-plus` icon
(General Design Library `SmileyPlus`, Regular).

**Pills** are the *outline* style, for other people's reactions and your own
alike: transparent at rest (`neutral.outline.surface.default`), filling with
`neutral.outline.surface.hover` / `.pressed`. Counts are in the numeric face
(`caption-md-regular`); the emoji glyph carries no colour class — emoji render in their
own native colours and ignore `currentColor`.

| | Border | Content | On hover |
|---|---|---|---|
| Other people's | `neutral.outline.border.default` | `neutral.outline.content.default` | `…border.hover` + `…content.hover` — both darken |
| Your own (`mine`) | **`stroke.focused`** | **`text.brand.medium`** | `stroke.brand.strong` + `text.brand.strong` |

"Your own reaction" keeps the **24 Sep 2026 audit's default** —
`stroke.focused` / `text.brand.medium`, corrected from `stroke.brand.strong` /
`text.brand.strong` — and only uses the strong pair on hover. `surface.brand.faint`
and `surface.elevated` are no longer on the pill. The non-interactive "+N"
overflow chip uses the same outline border and content, with no fill and no hover.

**Palette:** container `shape.radius.md` (the `Popover` panel); categories
12px (`caption-md-medium`) in `text.tertiary`, 12px apart (`space.12`); emoji cells
36 × 36 (`size-9`, `space.36`), `shape.radius.xs` (4px) corners, with **no gap** between them, emoji at 20px
(`title-md-semibold`) centred; hover `surface.neutral.faint`, **pressed
`surface.neutral.medium`**. Everything focus-rings with `stroke.focused`. All of
the spacing above is on the existing `space.*` scale — no new tokens.

**Palette contents:** Hand Gestures 👍👎🙌👋👌👏🫶🤝🤘🙏💪 · Smileys & People
👀😄🤔😅😂😮😊🤩 · Symbols 🔥💯🎉✅❤️⚠️🚀💥. ❤️ and ⚠️ are the **basic emoji with
the variation selector** (U+2764 U+FE0F, U+26A0 U+FE0F), written as escapes in
the source so an edit can't drop the selector — without it they render as flat
text glyphs.

**One token added earlier:** `neutral.textual.content` (`default`/`hover`/`pressed`/
`disabled`), for the two icon buttons. Only `.default` is confirmed against
Figma directly; the other three mirror `neutral.outline.content`'s slate steps.
Its dark values mirror `neutral.outline.content`'s dark steps the same way —
until 5 Oct 2026 it had none, so dark mode kept the light slate-600 (2.36:1).
Hover on these buttons uses `text.brand.medium` rather than
`neutral.textual.content.hover`.

| Pair (on `surface.canvas`) | Light | Dark |
|---|---|---|
| Count on another person's pill (`neutral.outline.content.default`) | **7.24:1** | **12.02:1** |
| Quick-react and add-reaction glyphs (`neutral.textual.content.default`) | **7.24:1** | **12.02:1** |
| Count on a *mine* pill (`text.brand.medium`) | **5.91:1** | **4.74:1** |
| *Mine* border (`stroke.focused`) | **5.91:1** | **7.73:1** |
| Another person's border (`neutral.outline.border.default`) | **2.45:1** — under the 3:1 UI-border bar | **3.75:1** |

The light-theme border of another person's pill is the one pair below 3:1. It is
the system-wide `neutral.outline.border.default` value (the same border `Button`'s
neutral outline uses), chosen by the design, so it is flagged here rather than
changed in this component. The emoji and count inside carry the meaning; the
border only outlines the control.

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
- The palette is a named `group`, containing one labelled `group` per category,
  of "React with X" buttons inside the system `Popover`, which owns open/close, Escape and focus-return.
- Pills are 24 tall — the pointer-dense exemption; reactions are a
  comment-thread affordance, not a primary action.
- The brand colour on *mine* is never alone: `aria-pressed`, the border and the
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
