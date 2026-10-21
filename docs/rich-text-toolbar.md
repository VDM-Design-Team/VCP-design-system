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
| Everything else | `link`, `unlink`, `quote` (block quote), `code` (code block), then **`image` when asked for, then `undo` and `redo` — always the rightmost pair** |

`image` (**Insert image**) is the one command that is **opt-in**: the default set is the
design's twelve, and the **comment editor** — the legacy design that has an image button
— adds it. There is no file insert; VCP has no such function.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `active` | `Partial<Record<Command, boolean>>` | `{}` | Which stateful commands are on — `{ bold: true }` |
| `disabledCommands` | `Partial<Record<Command, boolean>>` | `{}` | Dead commands — `{ unlink: true, undo: true }` |
| `commands` | `RichTextCommand[]` | the twelve (`DEFAULT_RICH_TEXT_COMMANDS`) | **Which commands to show.** `[...DEFAULT_RICH_TEXT_COMMANDS, 'image']` for comments; a shorter list for a smaller editor. Order and groups never change; a group with nothing left loses its divider |
| `onCommand` | `(command) => void` | — | Every press lands here |
| `open` | `boolean` | `true` | Showing or not. Set `false` rather than unmounting and it fades out first |
| `label` | `string` | `'Text formatting'` | The toolbar's accessible name |
| `className`, `style` | | — | Where the editor places it (see below) |
| `ref` | `Ref<HTMLDivElement>` | — | The toolbar |

## Choosing what an editor can do

Not every editor supports everything, so **the editor declares its commands** instead of the
toolbar guessing. It is an allow-list, so a command a new editor does not support is simply
absent, and adding a command to the toolbar later does not appear in editors that did not ask.

| Editor | `commands` |
|---|---|
| Default (description, long text) | *(omit)* — the twelve |
| **Comments** | `[...DEFAULT_RICH_TEXT_COMMANDS, 'image']` — everything, plus image |
| A small field | `['bold', 'italic', 'link']` |

`ALL_RICH_TEXT_COMMANDS` lists every command in display order, `DEFAULT_RICH_TEXT_COMMANDS`
the default twelve — both exported with the component.

**To disable instead of hide** — a command the editor has but cannot use *right now* — use
`disabledCommands`. The two differ: hiding is permanent for that editor, disabling is a
state. Hiding a command because it is momentarily unavailable makes a toolbar that
reshuffles, which cannot be learned.

## Undo and redo disable themselves — via the editor

The toolbar owns no editor state, so it cannot know whether there is anything to undo.
**The editor says so**, and the toolbar disables the button: undo is disabled at the start of
the history, redo at its end, and both while the history is empty.

```tsx
<RichTextToolbar
  disabledCommands={{ undo: !history.canUndo, redo: !history.canRedo }}
  onCommand={(c) => (c === 'undo' ? history.undo() : c === 'redo' ? history.redo() : …)}
/>
```

The **Default** story runs this live: each toggle is a history step, Undo starts disabled, a
change enables it, undoing it enables Redo and disables Undo again, and a new change after an
undo drops the redo tail. A disabled button is skipped by the arrow keys.

## Floating over a selection

The toolbar is the card; **the editor decides where it goes**, because only the editor
knows where the selection is. `useSelectionToolbar` does the usual part, and the
**Floating On Selection** story is the whole recipe:

```tsx
const { containerRef, open, position } = useSelectionToolbar();

<div ref={containerRef} className="relative">
  …the editor…
  <RichTextToolbar
    open={open}
    style={position}
    className="absolute z-10 -translate-x-1/2 -translate-y-full"
  />
</div>
```

- **It shows** when a selection inside the container is finished (`mouseup`, `keyup`), centred
  over it and 8 above.
- **It goes away the moment there is no selection to point at** — a click anywhere on the
  page, an arrow key, a programmatic collapse. The hook listens to the document's
  `selectionchange`, not only to clicks inside the editor, so it is never left floating over
  text that is no longer selected. Keep the toolbar rendered and drive `open`, and it fades out.
- **It does not follow scrolling or resizing and does no collision handling** — a selection near
  an edge can push the toolbar past it (keep the editor away from the viewport edge, or clamp
  `position.left` to half the toolbar's width). Those are the editor's to add, as with
  `Popover`.

**Pressing a button never costs the selection.** The toolbar swallows `mousedown`, so a
click on "Bold" does not move focus out of the editor and collapse the text it is meant
to bold. Keyboard use is unaffected: Tab into the toolbar from the editor, Arrow keys
inside it.

## Motion

Shown, the toolbar **dissolves in with a tiny drop**: opacity 0 → 1 and 4px down into place,
150ms ease-out. Hidden with `open={false}` it **fades out where it stands** and only then
leaves the DOM (150ms); unmount it outright and it just disappears. The motion is on an inner
card, so the editor's own positioning on the toolbar (a `translate`, a `top`) is never part of it.
`prefers-reduced-motion` gets none. Enter uses CSS `@starting-style` (the `starting:`
variant), which every current browser supports; an older one just shows it without the drop.

For the fade-out to play, keep the toolbar rendered and drive `open` — the
**Floating On Selection** and **Fades In And Out** stories do.

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
| Glyph | `neutral.outline.content` — `default` / `hover` / `pressed` | `text-neutral-outline-content-default hover:… active:…` |
| Hover / press | `surface.neutral.subtle` / `surface.neutral.medium` | `hover:bg-surface-neutral-subtle active:bg-surface-neutral-medium` |
| On (pressed) | `surface.brand.faint` + `text.brand.strong` | — the design shows no on state; this is the system's |
| Disabled | `neutral.outline.content.disabled`, not-allowed cursor | `disabled:text-neutral-outline-content-disabled disabled:cursor-not-allowed` |
| Divider | `stroke.default`, 1 × 24 | `h-6 w-px bg-stroke-default` |

No new tokens. Icons are Phosphor — the design's Lucide glyphs mapped to `text-b`,
`text-italic`, `text-underline`, `text-strikethrough`, `list-numbers`, `list-bullets`,
`link`, `link-break`, `quotes`, `code`, `arrow-u-up-left`, `arrow-u-up-right` (six are new,
each with its fill).

| Pair | Light | Dark |
|---|---|---|
| Glyph at rest (`neutral.outline.content.default` on `surface.elevated`) | **7.58:1** | **9.85:1** |
| Glyph hovered (`.hover` on `surface.neutral.subtle`) | **9.45:1** | **8.40:1** |
| Glyph pressed (`.pressed` on `surface.neutral.medium`) | **9.85:1** | **4.34:1** |
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
- **Don't hide a command because it is momentarily unavailable — disable it** (`disabledCommands`). Use `commands` for what an editor *never* does; a toolbar that reshuffles
  between moments can't be learned.
- **Don't add VCP-specific inserts here** ("insert AV reference") — that is the composer
  pattern extending its own toolbar.
- **Don't press what has no state** — `active` only affects the eight stateful commands.
- **Don't leave it static.** It is built to float over a selection; as a fixed bar above an
  editor it is a card with nothing to attach to.
