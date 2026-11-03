---
bump: minor
---
### `StatCard` — narrower, and a lighter yellow for Pending (November 2026)

The default card's minimum width was 16.5rem (264), widened from Figma's own 175 "so the card stays readable", and a row of cards wrapped early because of it. It is now 11rem (176): Figma's six-across dashboard row fits at 1187 before any card drops onto the next row. A wrapping flex container still lets cards fall to the next row when they run out of room.

**`StatCard` — a lighter yellow for Pending.** New accent `warning-subtle` (`accent.warning.tonal.surface.pressed`, a yellow a step lighter than `warning`'s brown) for a figure that is more cosmetic than urgent; the dashboard's Pending uses it.
