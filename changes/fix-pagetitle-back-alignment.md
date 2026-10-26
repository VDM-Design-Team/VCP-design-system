---
bump: minor
---
### `PageTitle` — back arrow and title (October 2026)

- The arrow and the title share a centre line (the title sat above the arrow).
- **The back arrow is neutral** (`neutral.outline.content`, with hover and pressed) instead of the action blue, and **hugs its
  20 × 20 glyph** — no padding either side — with 8 to the title. A `::after` keeps the pointer target 40 × 40. The band with a back
  arrow is now 74, not 88. `onBack` renders a plain `button`, no longer an `IconButton`.
- **New `size` prop** — `md` (default) is the title at 18 semibold, `sm` at 14 medium; both `text.secondary` (was 20
  semibold `text.primary`). The title is smaller than before by default.
