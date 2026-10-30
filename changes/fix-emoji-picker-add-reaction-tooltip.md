---
bump: patch
---
### `EmojiReactionPicker` — the "Add reaction" tooltip no longer shows twice (October 2026)

Hovering the add-reaction button showed its tooltip, and then moving down onto the open palette brought the tooltip back a second time before it went away. The tooltip wrapped the whole `Popover`, so the palette, a child of that wrapper, counted as hovering the button. The tooltip now wraps the button alone, which also puts `aria-describedby` on the button itself. No API change, and no change to how the palette opens, closes or returns focus.
