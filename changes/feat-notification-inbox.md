---
bump: minor
---
### `NotificationInbox` — the full notifications page (October 2026)

New pattern, to Figma's `Notification_Inbox_Content`: "Mark all as read", "Show unread only", the rows and the pager. The rows are `NotificationItem`, the same component the popover uses (Figma draws a separate inbox row, but it is the same thing in a wider list). It reports the switch and page changes and leaves the filtering and paging to the caller.
