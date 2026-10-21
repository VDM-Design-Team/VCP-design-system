---
bump: minor
---
### `NotificationPopover` — the bell and the panel that opens from it (October 2026)

New pattern, to Figma's `Notification_Popover`: the `NotificationBell` that opens a 500-wide panel with the All / Mentions filter, the "Unread only" switch, an overflow menu with "Mark all as read", the list of `NotificationItem`s (passed as children), and a "View notifications inbox" link. It reports filter and unread-only changes and leaves the filtering to the caller. Also exports `NotificationBell` and `NotificationItem` from the package index.

Also adds the `dots-three-outline-vertical` and `dots-three-outline-vertical-fill` glyphs, which the popover's overflow menu button uses (filled).
