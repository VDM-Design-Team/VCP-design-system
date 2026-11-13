---
bump: minor
---
### `PlanningTable` — an Actions menu, with Move to Cycle as a submenu (November 2026)

The "Move … to…" column (an up-down arrows button, the glyph the sort uses) is now an **Actions** column, as `AVTable` and `AnnouncementsTable` have: a ⋯ button (neutral palette, `neutral-tertiary`) named "Actions for VCP-1234" opening a menu with one item, **Move to Cycle**, a submenu of the sections the row can go to (with `moves="anywhere"` the Backlog is a choice too, and it says only "Move to"). Dragging, `moves`, `canMove` and the focus that follows a moved row are unchanged. The button's accessible name changes from "Move VCP-1234 to…" to "Actions for VCP-1234", so anything that finds it by the old name needs the new one and one more click (Move to Cycle).

### `Menu` — a submenu item can leave out its caret (November 2026)

New `caret: false` on a menu item that has `items` leaves out its right caret. The item is still `aria-haspopup="menu"` and opens the same way, so it is announced as a submenu; only the glyph goes. Nothing changes unless it is set. `PlanningTable`'s Move to Cycle uses it.
