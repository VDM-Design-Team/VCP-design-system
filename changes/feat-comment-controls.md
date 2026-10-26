---
bump: minor
---
### `CommentActions`, `CommentFormActions`, `CommentSortChip` — the comment controls (October 2026)

Three new components for the comments, read off the Figma `_Comment_Control`, `_Comment_Controls` and `_Comment_Filter_chip` sets. `CommentActions` is the row under a posted comment: show or hide replies, Edit, Delete, Reply (or Cancel Reply), Copy Link and a slot for the reactions (`EmojiReactionPicker`). An action shows when it is given a handler, so someone else's comment simply gets no `onEdit` or `onDelete`. Copy Link copies, turns its glyph into the design's green check, and says "Link copied" to a live region. `CommentFormActions` is the Add Comment, Reply or Save button and its Cancel, as one arrangement of the system's small `Button`, with the dim and loading states. Cancel is the outlined `secondary` button, as in the system's modals, and the gap between the two is 8. `CommentSortChip` is the "Newest First" / "Oldest First" switch. No new tokens, and no change to `Button`, `Icon` or `EmojiReactionPicker`.
