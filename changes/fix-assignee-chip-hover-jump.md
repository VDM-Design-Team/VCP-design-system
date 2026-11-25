---
bump: minor
---
### `DetailCard` / `Chip` — a people chip no longer jumps between lines on hover (November 2026)

Editing, an Initiator or Assignee chip at the end of a line widened on hover, wrapped away from the pointer,
narrowed, came back and widened again, over and over. Two fixes to choose from: `Chip`'s new `actions="overlay"`
(the buttons are laid over the chip's end) and `DetailCard`'s `chipHover="wrap-early"` (lines break as if the
chip were already wide). `DetailCard`'s `chipHover` keeps today's `grow` as the default until one is chosen.
