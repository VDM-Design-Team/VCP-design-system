---
bump: minor
---
### `NotificationItem` — reactions and the reply flow under a comment (October 2026)

Under a comment preview, as Figma's `Notification_Popover_Comment_Reply` draws it: "Reply" (or "Show Reply" / "Hide Reply" once there is a reply) with the emoji reactions beside it, a composer with @-mentions for a new reply (`MentionInput`), and one reply card with Edit and Delete. The reply and the reactions are the caller's data, passed in (`reply`, `reactions`, `members`, `currentUser`) with callbacks (`onReply`, `onEditReply`, `onDeleteReply`, `onToggleReaction`, `onSelectEmoji`). A click on the comment does not open the item; the reply controls respond as controls of their own. `previewActions` stays, below the reply row.
