---
bump: patch
---
### `StatCard` — a default card can be as narrow as Figma's 175 (November 2026)

The default card's minimum width was 16.5rem (264), widened from Figma's own 175 "so the card stays readable", and a row of cards wrapped early because of it. It is now 11rem (176): Figma's six-across dashboard row fits at 1187 before any card drops onto the next row. A wrapping flex container still lets cards fall to the next row when they run out of room.
