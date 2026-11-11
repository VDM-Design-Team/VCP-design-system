---
bump: minor
---
### `TopBar` — the bell's place takes a `NotificationPopover` (November 2026)

A new prop, `notificationPopover`: pass a `NotificationPopover` and it takes the bell's place in the bar (it brings its
own bell as its trigger), so the bell opens the latest notifications. Without it, `notifications` and
`onNotifications` draw the plain bell as before.
