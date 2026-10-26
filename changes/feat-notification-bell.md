---
bump: minor
---
### `NotificationBell` — the bell and its unread dot, as a piece of its own (October 2026)

New component: the notification bell, an `IconButton` with the design's red dot (10 on a 20 glyph, in `accent.critical.filled.surface.default`, with a halo that pulses three times, 1.5s each, when the count changes, then stops; reduced motion removes it). The count is in the button's name ("Notifications, 3 unread"); the dot is decoration. It passes every prop to its button, so it works as a `Menu` or `Popover` trigger. `TopBar` now uses it instead of drawing the bell inline: nothing changes visually or in `TopBar`'s props.
