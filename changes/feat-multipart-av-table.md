---
bump: minor
---
### Multipart in the AV table: `MultipartTableTag`, `MultipartParentChip`, `AVTable` rows (November 2026)

New **`MultipartTableTag`** (a child's "1/3" or a parent's progress ring, with the tooltip from Figma's `_Multipart_Table_Tag`; focusable, and its words are read out), new **`MultipartParentChip`** ("Parent: VCP-4321 ↗", which opens the parent in a new tab), and `AVTable` rows take `multipart`, in **Figma's two-column title cell** (`_AV_Table_Item_AV_Title_Multipart`): the reference with the **28 tag under it** (14 type, 20 glyphs, its tooltip above), a rule, and the title with the details starting under it. A parent gets a brand edge at the row's **far left** (before the checkbox when the table is selectable); a child gets its tag and the Parent chip (`parentHref` opens it in a new tab, `onOpenParent` asks, and with neither it is plain text, not a button that does nothing). Rows without `multipart` are unchanged. New icon `arrow-up-right`.

`DataTable` gains **`rowEdge`**: a 6 brand edge at a row's far left, drawn over its first cell (so it takes no room and, with `selectable`, sits before the checkbox). The metadata in a title cell hugs its content and never shrinks (the table scrolls instead), and the parent's glyph is VCP's own `arrows-split-source` (new in-house icon, no fill version).
