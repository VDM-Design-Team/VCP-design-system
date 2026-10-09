---
bump: major
---
### `RichTextToolbar` — the floating selection toolbar, to the design (October 2026)

Rebuilt from the design's toolbar markup, on tokens, with our toolbar accessibility kept.

- **A floating card, not a strip:** `surface.elevated`, `stroke.subtle`, `shadow.menu`, 8 corners, 6 padding, 4 between controls. The editor places it over
  the selection (a new **Floating On Selection** story shows how); the component does no positioning. Pressing a button no longer collapses the selection
  (`mousedown` is swallowed).
- **32 buttons with 16 line icons** (were 28, with the letters B I U S): `text-b`, `text-italic`, `text-underline`, `text-strikethrough`. Glyphs `text.primary`; hover
  `surface.neutral.subtle`; 24-high dividers.
- **Three groups, the design's order:** text styles · numbered list, bulleted list · link, **unlink**, **block quote**, **code block**, undo, redo.
- **Breaking:** the `file` command is removed (VCP has no such function); `quote`, `code` and `unlink` are added. `image` stays, **opt-in**: the default set is the twelve,
  and the comment editor adds it. `ol` now comes before `ul`; undo and
  redo are in the last group. Migration: drop any `image` / `file` handling; add `quote`, `code`, `unlink` to the `onCommand` switch.
- **The glyphs are `neutral.outline.content`** (default, hover, pressed, disabled) instead of `text.primary`; the hover and press fills are unchanged. 7.58:1 at rest in light, 9.85:1 in dark; the lowest is 4.34:1 (dark, pressed).
- **Insert image sits left of undo and redo** (undo/redo stay the rightmost pair), and **new `useSelectionToolbar` hook**: shows the toolbar over a finished selection and hides it
  the moment there is none — on any click, key or programmatic change (it listens to `selectionchange`), not only clicks inside the editor.
- **`commands` prop** — the editor declares which commands to show (`DEFAULT_RICH_TEXT_COMMANDS`, `ALL_RICH_TEXT_COMMANDS` exported); `[...DEFAULT_RICH_TEXT_COMMANDS, 'image']` for comments. Order and groups
  are fixed; empty groups drop their divider.
- **`open` prop and motion:** the toolbar dissolves in with a 4px drop and fades out before leaving the DOM (150ms; none under reduced motion). The card is an inner layer so the editor's
  positioning is not animated.
- **Undo and redo** are disabled by the editor through `disabledCommands` (`{ undo: !canUndo, redo: !canRedo }`); the Default story demonstrates a live history.
- **Keyboard:** the arrows now skip disabled buttons (they used to land on one and strand the tab stop). Dividers are `role="separator"`.
- New icons (each with its fill): `text-b`, `text-italic`, `text-underline`, `text-strikethrough`, `link-break`, `quotes`.
