---
bump: minor
---
### `NotificationsPage` — the notifications page, and an optional `sidebar` on `AppShell` (November 2026)

New `NotificationsPage`: `NotificationInbox` in the page's content area, as Figma's `Notification Inbox` page draws it: no title band (the `h1` is for screen readers; `showTitle` draws it as a `PageTitle`), 40 above and below the inbox. `NotificationInbox`'s props pass straight through. Figma's page also has no sidebar and the logo in the top bar, so `AppShell`'s `sidebar` is now optional (a `TopBar` with no `primaryAction` is the logo version already). Two stories (the page, and with a title); the docs say how each of Figma's differences is carried.
