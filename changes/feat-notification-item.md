---
bump: minor
---
### `NotificationItem` — one row in a list of notifications (October 2026)

New component, to Figma's `Notification_Item`: the actor's avatar, a sentence for each of the design's eleven kinds of event (commented, mention, moved, accepted, updated, rejected, rejected with feedback, assigned, backlog, handoff, viewer) with the design's bold and regular runs and the time, and a trailing check: the unread dot on an unread row, which dissolves into an outlined check-circle (mark as read) on hover and focus, and, on a read row, nothing at rest and a filled check-circle (mark as unread) that dissolves in on hover and focus. The whole row is the target (`href` or `onSelect`). An optional comment preview shows three lines in a bordered card with "Show more", with no bottom padding on the text while the button follows. The reply and emoji controls under a preview are not built; `previewActions` is where they go.
