---
bump: patch
---
### `SidebarItem` / `Sidebar` — a parent row shows when the current page is inside it (November 2026)

When the current page is a sub-row, its parent now wears the selected fill (and `aria-current="true"`)
whenever the sub-row is out of sight: always in the collapsed rail, where the sub-rows live in the flyout,
and in the expanded rail while the group is closed. Open inline, the sub-row shows itself and the parent
stays plain.

The current sub-row in an open group now wears the same fill as a selected top-level row
(`surface.brand.subtle`), keeping its regular weight as a selected top-level row keeps its own.
Before, only its text colour changed, which was too quiet to find.
