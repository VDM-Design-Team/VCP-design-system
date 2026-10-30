---
bump: minor
---
### `NotificationItem` — one row in a list of notifications (October 2026)

New component, to Figma's `Notification_Item`: the actor's avatar, a sentence for each of the design's thirteen kinds of event (commented, mention, moved, accepted, updated, rejected, rejected with feedback, assigned, backlog, handed off, pending, completed, viewer; `moved` requires its `status`) with the design's bold and regular runs and the time, and a trailing check: the unread dot on an unread row, which dissolves into an outlined check-circle (mark as read) on hover and focus, and, on a read row, nothing at rest and a filled check-circle (mark as unread) that dissolves in on hover and focus. The whole row is the target (`href` or `onSelect`). An optional comment preview shows three lines in a bordered card with "Show more", with no bottom padding on the text while the button follows. The trailing check has a 40 click area. Under a preview, the reply flow and reactions: "Reply" (or "Show Reply" / "Hide Reply" once there is a reply) with the emoji reactions beside it, a composer with @-mentions for a new reply, and one reply card with Edit and Delete. The reply and reactions are the caller's data, passed in with callbacks.

The mark-read button has the design's tooltip after a half-second hover ("Mark as read" / "Mark as unread").
