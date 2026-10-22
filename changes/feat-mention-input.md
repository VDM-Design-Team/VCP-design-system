---
bump: minor
---
### `MentionInput` — a text field with @-mentions (October 2026)

New component: a text field where typing `@` opens a list of members, more letters filter it, and choosing one turns the text into a tag, as in comments. Plain text and tags only; a paste is plain text. The value is segments (text, or a mention with its `id` and `label`), with `mentionedIds` and `plainText` helpers, and a tag in the DOM is the markup TipTap's mention extension writes. The list is a combobox listbox, drawn like `Menu`: ↑ ↓ move, Enter or Tab choose, Escape closes. Input-method (IME) and some mobile keyboards are not promised.
