---
bump: patch
---
### `Tag`, `Badge`, `StatusTag`, `DueDateTag` — the neutral tonal fill is slate-200 (November 2026)

The neutral tonal style (`Draft` and `Backlog` status tags, the default due date, a neutral `Badge`) was `surface.neutral.subtle` (slate-100) on `text.secondary`. Figma's neutral tonal is `neutral.tonal.*`: slate-200 on slate-700, which is also what `docs/status-tag.md` already listed for Draft and Backlog. It is now that pair, from the `neutral.tonal.*` tokens that already exist. In light mode the fill is one step darker (the label's contrast is 8.40:1, from 9.45:1); in dark mode the two tokens are identical, so nothing changes. The lighter fill sat too close to the page's own grey and nearly disappeared on hover.
