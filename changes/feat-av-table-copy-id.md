---
bump: minor
---
### `AVTable` — the reference is click-to-copy, and the title opens the AV (November 2026)

The Added Value reference in the table ("VCP-12345") is now a `CopyText`, as Figma's `_AV_Table_ID` draws it: it copies the reference on click and says "Copied" for a moment. Before, the reference was the button that opened the AV. With `onOpen`, the **title** is now the button that opens it, as in the Planning table. The `onOpen` prop is unchanged, but a page that taught people to click the reference to open an AV now has them click the title. The title keeps at least 160 wide so it can always be pressed, and turns brand blue and underlines on hover. A reference no longer has a sr-only title in its name: the reference button is named "VCP-12345", the title button by the title.
