---
bump: patch
---
### `CommentSection`, `CommentReply`, `CommentComposer` — focus is never dropped, and nothing typed is lost (November 2026)

Fix: closing a reply or edit box (sent, saved or cancelled) and deleting a comment used to leave the
focus on the page itself, so a keyboard or screen-reader user started again from the top. A closed box
now hands the focus back to the Reply or Edit that opened it, and a deleted comment's focus goes to the
comment that took its place (the next, else the one before, else the one it replied to, else the
new-comment box). Each comment's `<article>` takes the focus with a ring when it is put there.

Fix: a send that settled cleared the whole box, including anything typed while it was in flight. It now
clears what was sent and keeps the rest, with the caret at its end. `CommentActions`' Edit, Delete and
Reply carry `data-action` so the comment can find them. No API change.
