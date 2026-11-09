---
bump: patch
---
### `EmojiReactionPicker` — focus stays in the row when a reaction goes (November 2026)

Taking back the last reaction on a pill removed the focused pill and dropped focus to the page. Focus now moves to
the pill that took its place, or to Add reaction when none is left. The "+N" chip's "N more reactions" is now
visually hidden text, not an `aria-label` on a span (which screen readers skip).
