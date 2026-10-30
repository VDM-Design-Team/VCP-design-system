---
bump: patch
---
### `Popover` — a panel with no room on either side scrolls instead of flickering (October 2026)

Fix: when a popover's panel was too tall for the space both above and below its trigger, it flickered between its full height and its shortened, scrolling height on every frame, about 130 times a second, and never settled. It now settles on the roomier side at the shortened height and scrolls inside. While it scrolls, the panel is in the tab order and shows the standard focus ring, so a keyboard user can reach it, see it, and scroll it with the arrow keys even when nothing inside it is focusable. Everything built on `Popover` gets the fix: `Menu`, `UserMenu`, `EmojiReactionPicker`. No API change.
