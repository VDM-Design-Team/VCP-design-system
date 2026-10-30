---
bump: minor
---
### `MentionInput` — a text field with @-mentions (October 2026)

New component: a text field where typing `@` opens a list of members, more letters filter it, and choosing one turns the text into a tag, as in comments. Plain text and tags only; a paste is plain text. The value is segments (text, or a mention with its `id` and `label`), with `mentionedIds` and `plainText` helpers, and a tag in the DOM is the markup TipTap's mention extension writes. The list is a combobox listbox, drawn like `Menu`: ↑ ↓ move, Enter or Tab choose, Escape closes. It opens under the `@` being typed (above it when the screen cuts the bottom off, and never past the screen's edges), not under the whole field. Input-method (IME) and some mobile keyboards are not promised.

The field is plain text only (`contenteditable="plaintext-only"`), has its own undo and redo (a chosen mention is one step), ignores Enter and the arrows while an IME is composing, treats an `@` followed by a space as text, and draws its list in a portal so a scrolling parent cannot cut it off; the highlighted option scrolls into view.
