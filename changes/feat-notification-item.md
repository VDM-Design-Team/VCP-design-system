---
bump: minor
---
### `NotificationItem` — one row in a list of notifications (October 2026)

New component, to Figma's `Notification_Item`: the actor's avatar, a sentence for each of the design's eleven kinds of event (commented, mention, moved, accepted, updated, rejected, rejected with feedback, assigned, backlog, handoff, viewer) with the design's bold and regular runs and the time, the unread dot, and the mark-read / mark-unread button that takes its place on hover and focus. The whole row is the target (`href` or `onSelect`). An optional comment preview shows three lines with "Show more". The reply and emoji controls under a preview are not built; `previewActions` is where they go.
