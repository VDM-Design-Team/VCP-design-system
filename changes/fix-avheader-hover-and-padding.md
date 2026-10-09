---
bump: patch
---
### `AVHeader` — a brand hover on the back arrow, and 32 padding at the sides (October 2026)

Design review of build 8 (#122).

- **The back arrow hovers to `text.brand.medium`** (was `action.tertiary.content.hover`, a
  navy too close to its near-black resting colour to read as a change). Both the link and
  the `IconButton` forms.
- **The header's side padding is 32** (`px-8`, was 16), matching `PageTitle` and the page
  body, so the title sits on the same left edge as the content below it. Top (32) and
  bottom (16) are unchanged.
