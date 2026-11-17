---
bump: patch
---
### `TypeTag` — the ⓘ is one step below the glyph, 16 in the default (November 2026)

The trailing ⓘ (`info`) was 20 whatever the tag's size, so it took a lot of room and, in a small tag, was bigger than the 16 caret. It is now one step below the tag's glyph and never below 16: 16 in the default 28 tag (beside its 20 glyph) and 20 in the largest, as ⓘ is 16 everywhere else (`InfoHint`, the column hints). This is a deliberate exception to Figma, which draws it 20×20; the reasons are in `docs/type-tag.md`. The glyph is decorative, so nothing is lost; it is one table to put back.
