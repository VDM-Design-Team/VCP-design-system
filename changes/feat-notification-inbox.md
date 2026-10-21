---
bump: minor
---
### `NotificationInbox` and `NotificationInboxItem` — the full notifications page (October 2026)

New component and pattern, to Figma's `Notification_Inbox_Content` and `_Notification_Inbox_Item`. `NotificationInboxItem` is one row: a 40 avatar, one line of text with its own weights, the time and the unread dot. It reads the same sentence table as `NotificationItem`, which now exports it as `NOTIFICATION_PHRASES`. `NotificationInbox` is the page's content: "Mark all as read", "Show unread only", the rows and the pager. It reports the switch and page changes and leaves the filtering and paging to the caller.
