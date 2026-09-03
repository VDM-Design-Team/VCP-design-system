# RichTextToolbar

The formatting strip above a rich editor: inline styles, lists, inserts,
history, in divided groups. It owns no editor state — it reports commands and
paints `active`.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `RichTextToolbar` | Above any rich-input surface — the comment composer, a description editor |
| `SegmentedControl` | A choice of views, not text formatting |
| Nothing | Plain text fields — a toolbar over a `Textarea` that ignores it is furniture |

The editor itself (contenteditable wiring, document model) is deliberately
not here — `CommentComposer` (pattern) will marry this strip to one.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `active` | `Partial<Record<Command, boolean>>` | `{}` | Which stateful commands are on — `{ bold: true }` |
| `disabledCommands` | `Partial<Record<Command, boolean>>` | `{}` | Dead commands — `{ undo: true }` at history's start |
| `onCommand` | `(command) => void` | — | Every press lands here |
| `label` | `string` | `'Text formatting'` | The toolbar's accessible name |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLDivElement>` | — | The toolbar |

Commands: `bold`, `italic`, `underline`, `strike` (letter glyphs), `ul`,
`ol`, `link`, `image`, `file`, `undo`, `redo` (icons — four added from
Phosphor for this: `list-numbers`, `arrow-u-up-right`, plus `image` shared
with the attachment set).

## One tab stop

A real APG toolbar: `role="toolbar"` with a **roving tabindex** — Tab enters
once, Arrow keys walk the buttons (wrapping), Home/End jump to the ends, Tab
leaves. Eleven tab stops between the page and the text area is the classic
toolbar failure, and the export had exactly that.

Only the stateful commands carry `aria-pressed` (`bold`…`ol`); inserts and
history are plain buttons — the export pressed everything, and a "pressed"
undo is a lie.

## Tokens

Buttons 28 (`size-7`, the pointer-dense exemption — arrows are the keyboard
path): rest `text.secondary`, hover `surface.brand.base` +
`text.brand.medium`, active `surface.brand.faint` + **`text.brand.strong`** —
strong, not the export-flavoured medium, because the letter glyphs are real
13px text and medium measured 3.51:1 on the tint in dark. Dividers
`stroke.subtle`. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Active letter/icon on its tint | **11.37:1** | **8.97:1** |
| Rest glyph | **10.35:1** | **11.87:1** |
| Hover glyph on hover tint | **5.76:1** | **5.45:1** |

## Accessibility

- Every button is named ("Bold", "Insert link") and `title`-hinted; letter
  glyphs are `aria-hidden` — the name does the announcing.
- State is `aria-pressed` + the tint — never colour alone, and never on
  commands that have no state.
- `disabledCommands` renders real `disabled` buttons — still skipped by
  arrows' *focus* only when the browser refuses; they stay in the roving
  order so the layout is stable, but cannot fire.
- The strip wraps at narrow widths rather than clipping commands.

## Don't

- **Don't wire it straight to `document.execCommand`** and call it an
  editor — the command surface is stable; the editor behind it is a real
  decision.
- **Don't hide commands the editor lacks — disable them.** A toolbar that
  reshuffles between contexts can't be learned.
- **Don't add VCP-specific inserts here** ("insert AV reference") — that is
  the composer pattern extending its own strip.
- **Don't press what has no state** — `active` only affects the six
  stateful commands by design.
