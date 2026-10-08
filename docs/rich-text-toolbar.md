# RichTextToolbar

The formatting toolbar that **floats over selected text**, as in any text editor:
inline styles, lists, a link, a quote, code and history, in three divided groups. It
owns no editor state — it reports commands and paints `active` — and it does not
position itself.

Pulled from the design's toolbar markup (a raised card of 32 buttons) and rebuilt on
tokens, with an accessible toolbar behaviour the markup did not have.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `RichTextToolbar` | Over a rich-text selection — the comment composer, a description editor |
| `SegmentedControl` | A choice of views, not text formatting |
| Nothing | Plain text fields — a toolbar over a `Textarea` that ignores it is furniture |

The editor itself (contenteditable wiring, document model) is deliberately not here —
`CommentComposer` (pattern) will marry this to one.

## The three groups

| Group | Commands |
|---|---|
| Text styles | `bold`, `italic`, `underline`, `strike` |
| Lists | `ol`, `ul` — numbered first, as the design orders them |
| Everything else | `link`, `unlink`, `quote` (block quote), `code` (code block), `undo`, `redo` |

There are **no image or file inserts** — VCP has no such function, so the earlier
`image` and `file` commands are gone.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `active` | `Partial<Record<Command, boolean>>` | `{}` | Which stateful commands are on — `{ bold: true }` |
| `disabledCommands` | `Partial<Record<Command, boolean>>` | `{}` | Dead commands — `{ unlink: true, undo: true }` |
| `onCommand` | `(command) => void` | — | Every press lands here |
| `label` | `string` | `'Text formatting'` | The toolbar's accessible name |
| `className`, `style` | | — | Where the editor places it (see below) |
| `ref` | `Ref<HTMLDivElement>` | — | The toolbar |

## Floating over a selection

The toolbar is the card; **the editor decides where it goes**, because only the editor
knows where the selection is. The usual recipe, and the **Floating On Selection** story:

1. On `mouseup` / `keyup` in the editor, read `getSelection()`. Collapsed, or outside
   the editor: hide the toolbar.
2. Otherwise take `range.getBoundingClientRect()` and place the toolbar
   `position: absolute` in the editor's positioned container, centred on the range and
   8 above it (`-translate-x-1/2 -translate-y-full`, `left`/`top` from the rect).
3. Keep it inside the viewport — flip below or clamp the left edge when the range is
   near an edge. The component does no collision handling, as with `Popover`.

**Pressing a button never costs the selection.** The toolbar swallows `mousedown`, so a
click on "Bold" does not move focus out of the editor and collapse the text it is meant
to bold. Keyboard use is unaffected: Tab into the toolbar from the editor, Arrow keys
inside it.

## One tab stop

A real APG toolbar: `role="toolbar"` with a **roving tabindex** — Tab enters once, Arrow
keys walk the buttons (wrapping), Home/End jump to the ends, Tab leaves. Disabled buttons
cannot take focus, so the arrows **skip** them — the tab stop never sits on a button the
keyboard can't reach.

Only the stateful commands (`bold`, `italic`, `underline`, `strike`, `ol`, `ul`, `quote`,
`code`) carry `aria-pressed`; link, unlink and history are plain buttons. The design's
markup names its buttons with `title` alone; here each has an `aria-label`, and the glyphs
are `aria-hidden`.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `surface.elevated`, `stroke.subtle` 1px, `radius.md` (8), `shadow.menu` | `bg-surface-elevated border-stroke-subtle rounded-md shadow-menu` |
| Padding / gap | 6 / 4 | `p-1.5` / `gap-1` |
| Button | 32 square, `radius.md`, 16 glyph | `size-8 rounded-md`, `Icon size="sm"` |
| Glyph | `text.primary` | `text-text-primary` |
| Hover / press | `surface.neutral.subtle` / `surface.neutral.medium` | `hover:bg-surface-neutral-subtle active:bg-surface-neutral-medium` |
| On (pressed) | `surface.brand.faint` + `text.brand.strong` | — the design shows no on state; this is the system's |
| Disabled | `text.disabled`, not-allowed cursor | `disabled:text-text-disabled disabled:cursor-not-allowed` |
| Divider | `stroke.default`, 1 × 24 | `h-6 w-px bg-stroke-default` |

No new tokens. Icons are Phosphor — the design's Lucide glyphs mapped to `text-b`,
`text-italic`, `text-underline`, `text-strikethrough`, `list-numbers`, `list-bullets`,
`link`, `link-break`, `quotes`, `code`, `arrow-u-up-left`, `arrow-u-up-right` (six are new,
each with its fill).

| Pair | Light | Dark |
|---|---|---|
| Glyph on the card (`text.primary` on `surface.elevated`) | **20.17:1** | **14.63:1** |
| On: glyph on its tint (`text.brand.strong` on `surface.brand.faint`) | **11.37:1** | **8.97:1** |

## Differences from the design's markup, on purpose

- Raw Tailwind greys and a `dark:` variant → semantic tokens, so dark is free.
- `title`-only names, no roles, a tab stop per button → a real toolbar (above).
- `opacity-50` for disabled → `text.disabled` (opacity is not a token).
- No on state drawn → `aria-pressed` and a tint, never colour alone.
- Buttons are **32**, under the 40 touch minimum. This is a pointer toolbar over a text
  selection — on touch the OS's own selection menu leads — and the arrows are the keyboard
  path.

## Accessibility

- Every button is named ("Bold", "Block quote") and `title`-hinted; glyphs are `aria-hidden`.
- State is `aria-pressed` + the tint — never colour alone, and never on commands that
  have no state.
- Dividers are `role="separator"` (vertical) inside the toolbar.
- `disabledCommands` renders real `disabled` buttons, skipped by the arrows.

## Don't

- **Don't wire it straight to `document.execCommand`** and call it an editor — the
  command surface is stable; the editor behind it is a real decision.
- **Don't hide commands the editor lacks — disable them.** A toolbar that reshuffles
  between contexts can't be learned.
- **Don't add VCP-specific inserts here** ("insert AV reference") — that is the composer
  pattern extending its own toolbar.
- **Don't press what has no state** — `active` only affects the eight stateful commands.
- **Don't leave it static.** It is built to float over a selection; as a fixed bar above an
  editor it is a card with nothing to attach to.
