---
bump: minor
---
### `Chip` — the Initiator and Assignee chips, as options (October 2026)

Figma's `_User_Chip_Initiator` and `_User_Chip_Assignee` are `Chip` with more options, not a second component. New, all opt-in: `size="md"` (36 tall), `tone="brand"` (text in `text.brand.strong`), `variant="outline"` (the editing look: a brand border and no fill), `description` (the "Assignee" line under a name), `onEdit` and `editLabel` (a pencil button beside the ✕), `actions="hover"` (the edit and remove buttons appear while the pointer is over the chip or focus is inside it, and are always shown on a touch screen), and `disabled`. Every default leaves a chip exactly as it was; the `Initiator` and `Assignee` stories draw the two recipes.

In an `outline` chip the edit and remove buttons are tonal round buttons (brand and critical) with 2 between them; the divider before a count is `stroke.default`; a role line (`description`) is `text.tertiary`, directly under the name; and the right padding is 12 at rest and 6 once the buttons show, animated with them so nothing jumps. `Avatar` gains `tone="brand"` (initials on `surface.brand.subtle`), used by the people chips.
