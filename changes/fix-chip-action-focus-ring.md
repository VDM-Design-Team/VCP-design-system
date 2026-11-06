---
bump: patch
---
### `Chip`: the focus ring on the edit and ✕ buttons is no longer clipped (November 2026)

With `actions="hover"` the edit and ✕ buttons sit in a box that clips its overflow (so it can be zero-wide until the chip is hovered or focused), and their focus ring was drawn outside the button, so it showed only at the corners. The ring is now drawn inside the button. The `ActionsOnHover` story asserts it.
