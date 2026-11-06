---
bump: minor
---
### `Sidebar` — the Archive and Planning sub-rows go somewhere (November 2026)

The built-in rails' sub-rows (Archive → Completed / Rejected / Backlogs, Planning → Planning List / Gantt Chart / Holiday Registry) had no key and no destination, so pressing one did nothing and no page could mark one as current; an app had to rebuild the whole rail with `items` to route them. Each now has a key — `archive/completed`, `planning/gantt-chart`, … — that `onNavigate` reports and `active` matches, like a top-level row's. The current page's group starts open in the expanded rail (not as a flyout in the collapsed one). New type `SidebarNavSubItem`: an `items` override's sub-row may carry a `key` the same way; a sub-row's own `href`, `onNavigate` or `selected` still wins. Found building the Gantt Chart screen of the clickable prototype. New story: `SubRowNavigation`.
