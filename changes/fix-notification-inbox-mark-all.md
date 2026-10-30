---
bump: patch
---
### `NotificationInbox` — no "Mark all as read" without a handler (October 2026)

Fix: "Mark all as read" was always drawn, so a page that did not pass `onMarkAllRead` showed a button that did nothing when pressed, and a screen reader announced it as a working control. It is now drawn only when `onMarkAllRead` is given, as it already was in `NotificationPopover`. "Show unread only" is unchanged. No API change.
