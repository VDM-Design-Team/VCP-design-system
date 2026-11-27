---
bump: minor
---
### `CommentSection` / `CommentReply` / `NotificationItem` — opening a notification lands on its comment (November 2026)

- **`CommentSection` takes `highlightId`**: the comment a notification or a copied link points at. The threads it
  sits in open, it scrolls to the middle of the screen (it used to be left to the page, which stopped short at the
  nearest edge), takes focus, and is tinted for two seconds before the tint fades. Reduced motion jumps and drops the
  tint at once.
- **`CommentReply` takes `highlighted`**, the tint itself (`surface.brand.subtle`), fading over a second when it goes.
  The comment's box reaches 8 further each side so the tint has room; nothing in it moves.
- **`NotificationItem`'s row is clickable around its comment.** The column under the avatar, the strip right of the
  comment and the gaps between the comment and its controls opened nothing; they now open the item, as the line
  above does. The comment card and its controls still don't.
