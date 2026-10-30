---
bump: minor
---
### `Popover` — it opens on the side that has room (October 2026)

`Popover` used to open exactly where `placement` and `align` said, even off the screen. They are now what the panel prefers: it is measured as it opens (and when the window or the panel is resized), and if the preferred side is cut off and the other has more room it opens there: above instead of below, or the other way round. A left-flush panel that would run off the right edge turns right-flush. If neither side has room the panel keeps the roomier one and scrolls inside it. It does not re-measure on page scroll, so an open panel never jumps. Everything built on `Popover` gets this: `Menu`, `UserMenu`, `EmojiReactionPicker`, the filter bar's period field. Nothing changes where there is room. No API change.
