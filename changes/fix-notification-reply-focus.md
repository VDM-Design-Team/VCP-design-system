---
bump: patch
---
### `NotificationItem`: focus no longer drops in the reply flow (November 2026)

In the reply flow the control that had focus went with its view and focus fell to the page. Now: after **Reply** (sent) focus goes to "Show Reply"; after **Cancel** a new reply, to "Reply"; after **Save** or **Cancel** an edit, to "Edit"; after **Delete**, to "Reply". The stories assert it. "Show Reply" / "Hide Reply" also no longer wrap onto two lines.
