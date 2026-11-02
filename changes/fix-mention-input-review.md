---
bump: patch
---
### `MentionInput` — Redo from the keyboard, Textarea's box (November 2026)

Fix: Redo works from the keyboard: Shift+Cmd+Z on a Mac, Ctrl+Y or Shift+Ctrl+Z elsewhere. It did nothing before, because the browser only sends its redo on to a field whose own redo list has something in it, and this field keeps its own. Undo and Redo are now taken from the keys directly; Undo from the Edit menu still works.

The field now has Textarea's box: 12px padding at the sides and 10px at the top and bottom (was 16px all round) and Textarea's rounder corner. Its placeholder fades when disabled, as Textarea's does. A mention tag at the end of a line moves down whole instead of breaking in two. The Light and dark story uses the full width (stacked on a phone), and the other stories fit a phone screen.
