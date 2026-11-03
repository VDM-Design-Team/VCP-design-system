---
bump: patch
---
### `accent.warning.outline.border` — a step darker in light: yellow-700 (November 2026)

The warning edge and glyph colour was yellow-500, **1.91:1** on white: too faint for the edge of a field
(`SearchSelect`'s `warning`, the busy assignee), which needs 3:1. It is now yellow-700, **4.93:1** on white,
4.71:1 on the canvas and 4.59:1 on the warning tint; hover and pressed move with it (800, 900), and disabled
stays at 300. The dark theme is unchanged.

Everything drawn in it darkens a little in light: `SearchSelect`'s warning border, `Banner`'s warning edge
and glyph, `Tag`'s warning outline, `Toast`'s warning glyph and bar, `StatCard`'s warning stripe and the busy
`AssigneeStatus` dot. The figures in `docs/banner.md`, `docs/toast.md` and `docs/stat-card.md` follow. Figma's
`accent/warning/outline/border` variables want the same values.
