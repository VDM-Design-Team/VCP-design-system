---
bump: minor
---
### `CommentReply`, `CommentReplyThread` — a posted comment and its thread (October 2026)

Two new components, read off the Figma `Comment_Reply` and `Comment_Reply_Thread`. `CommentReply` is one posted comment: the author and time, the text (the `MentionInput` segments, with mentions drawn as `MentionTag`), the `CommentActions` row, and the two boxes you open from it: **replying** (Reply and Cancel under the actions) and **editing** (the box takes the comment's place, filled with it, Save and Cancel). Both boxes open focused, their send button is dim while empty, and `replying` and `editing` are controlled by the caller. `CommentReplyThread` is a comment with its replies as `children` (a `CommentReply`, or a `CommentReplyThread` for a sub-thread), with the thread line drawn: it runs from the avatar into the replies, each reply takes a corner off it, and the line stops at the last one's. The replies are a labelled list that the toggle controls. No new tokens, and no change to the pieces they compose.
