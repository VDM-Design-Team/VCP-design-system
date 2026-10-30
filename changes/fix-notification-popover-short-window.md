---
bump: patch
---
### `NotificationPopover` / `Popover` — on a short screen, the header and inbox link stay (October 2026)

Fix: on a screen too short for the notification panel above or below the bell, the whole panel scrolled, with its list scrolling inside it, and "View notifications inbox" was pushed out of view. Now the header and the inbox link stay in view and only the list gives way and scrolls. `Popover` makes this possible: while it has shortened a panel, it remembers the panel's full height, so content that shrinks to fit (instead of scrolling) no longer makes it flicker between the two heights. Every other popover behaves as before.

Also: the `LightAndDark` story stacks the two themes so their open panels no longer overlap, `MarkAllRead` shows its rows marked read, and the `NotificationPopover` changelog entry gives the panel's real width (528, not 500). No API change.
