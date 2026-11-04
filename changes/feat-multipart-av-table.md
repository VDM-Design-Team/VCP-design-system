---
bump: minor
---
### Multipart in the AV table: `MultipartTableTag`, `MultipartParentChip`, `AVTable` rows (November 2026)

New **`MultipartTableTag`** (a child's "1/3" or a parent's progress ring, with the tooltip from Figma's `_Multipart_Table_Tag`; focusable, and its words are read out), new **`MultipartParentChip`** ("Parent: VCP-4321 ↗", a link or a button), and `AVTable` rows take `multipart`: a parent gets a brand edge on the left and its tag; a child gets its tag and the Parent chip (`onOpenParent`), in Figma's two-row title cell (`_AV_Table_Item_AV_Title_Multipart`). Rows without `multipart` are unchanged. New icon `arrow-up-right`.

The multipart tags are **24 high** with 12 type and 16 glyphs (Figma's 28 sat taller than the tags beside them), the metadata in a title cell hugs its content and never shrinks (the table scrolls instead), and the parent's glyph is VCP's own `arrows-split-source` (new in-house icon, no fill version).

The tag's smaller size is what allowed removing the gap: it is aligned with the rest of the metadata in one line, which avoids large gaps from very long IDs (the metadata used to follow where the title begins).
