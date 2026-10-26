---
bump: minor
---
### `NewComment` — the box to write a new comment (October 2026)

A new pattern, read off the Figma `New_Comment`: the "Comments" title with the sort switch, and under it the box a person writes a new comment in, with their avatar beside it and Add Comment below. It composes `Avatar`, `CommentSortChip`, `MentionInput` and `CommentFormActions`, so `@` mentions work, Ctrl or Cmd + Enter sends, and the value is `MentionInput`'s segments (`mentionedIds` is who to notify). Add Comment is dim while the box is empty, and the box clears after a send unless the value is controlled. The title is a real heading, `h2` by default. No new tokens.
