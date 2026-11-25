---
bump: patch
---
### `SidebarItem` / `Sidebar` — sub-rows take the row's states, and a parent shows the current page it hides (November 2026)

Design review: a sub-row (under Archive or Planning) looked like a different control from the row above it, because only its colour changed when current. It now takes the top-level row's states: hover fills `surface.brand.faint`, and the current one has the `surface.brand.subtle` fill, `text.brand.strong` and medium weight.

When the current page is a sub-row that can't be seen (its group is closed, or the rail is collapsed and the sub-rows are in the flyout), the parent row takes the selected look and `aria-current="true"`, so you can still tell where you are. Open inline, the sub-row shows it instead. No API change.
