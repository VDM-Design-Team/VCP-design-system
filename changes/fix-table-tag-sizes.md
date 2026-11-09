---
bump: patch
---
### Tables: every tag in a row is the same size (November 2026)

In `AVTable` and `PlanningTable` the urgency and type tags used the `md` default (28 tall) while the status, due date and domain tags were `sm` (24). All five are `sm` now, so a row's tags are one height; the urgency and type glyphs follow the size (16, was 20), and their negative margin that lines the glyph up with the column header is `-mx-1.5` to match the smaller padding.
