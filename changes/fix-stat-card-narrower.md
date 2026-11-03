---
bump: minor
---
### `StatCard` — narrower, and a yellow for Pending (November 2026)

The default card's minimum width was 16.5rem (264), widened from Figma's own 175 "so the card stays readable", and a row of cards wrapped early because of it. It is now 11rem (176): Figma's six-across dashboard row fits at 1187 before any card drops onto the next row. A wrapping flex container still lets cards fall to the next row when they run out of room.

**`StatCard` — a yellow for Pending.** New accent `yellow` (`accent.yellow.medium`, an existing token) for a figure that is more cosmetic than urgent; it is brighter than `warning`'s brown and close to Figma's Pending stripe. The dashboard's Pending uses it.

This follows the November change that moved `accent.warning.outline.border.default` from yellow-500 to yellow-700 for contrast. Figma's Pending stripe is still drawn with the old yellow, so `warning` would now render brown. A stripe is purely decorative, and the card's label carries the meaning, so a brighter yellow here costs nothing in contrast terms. A dedicated decorative stripe token is a possible follow-up.
