---
bump: patch
---
### `MultipartTableTag` / `AVTable` — the multipart tag is 24 high, on one line of metadata (November 2026)

A multipart row in the AV table is now the same shape as every other row: the reference, a rule and the title on top, and one line of metadata under it. The multipart tag is **24 high** (12 type, 16 glyphs; the progress ring is 16) and is the first item on that line, so it lines up with the domain tag, the Parent chip and the counts, and a long reference no longer leaves a wide gap before them.

**This is a deliberate departure from Figma**, which draws a 28-high tag in a column of its own under the reference, with the other metadata starting under the title. Design chose the one-line version (it reverses the 10 Nov choice on #275). Reviewers: please do not ask for Figma's two columns. The tooltip above the tag, the parent's edge at the row's far left and the Parent chip opening in a new tab are unchanged. See `docs/av-table.md`, "The layout is deliberately not Figma's".
