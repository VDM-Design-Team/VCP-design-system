---
bump: patch
---
### `MultipartTableTag` / `AVTable` — the multipart tag is 24 high, on the same line as the other tags (November 2026)

The multipart tag in the AV table is now 24 high (12 type, 16 glyphs, a 16 progress ring) instead of Figma's 28, and it is the first item of the metadata line under the title, with the domain tag, the Parent chip and the counts. The two-column cell (the 28 tag under the reference, the details starting under the title) is gone: every row, multipart or not, has the reference, a rule and the title on top and one line of metadata under it, starting at the cell's left edge. The 28 was a mistake in the first multipart design, and Figma's columns made the details start under the title, so uneven ids (four, five or six digits) moved them from row to row. This is a deliberate departure from Figma (decided 20 November 2026); the Figma multipart frame needs the same change.
