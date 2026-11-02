---
bump: patch
---
### `DetailRow`, `CommentActions` — one glyph for Edit: `note-pencil` (November 2026)

Edit was drawn two ways: the pen over a square (`note-pencil`) in `Chip`, `InlineEdit` and the
Figma library, and a bare pen (`pencil-simple`) in `DetailRow` and `CommentActions`. Both now use
`note-pencil`, and the stories and examples follow.

**Why.** One action drawn two ways invites the question of whether the controls differ, and the pen
over a square holds up as "edit" at 16 and 20 px where a bare pen can read as draw or annotate.
`docs/icon.md` now records the rule. `pencil-simple` stays in the set, and an exception can be made
for a good reason (say why in the code comment).
