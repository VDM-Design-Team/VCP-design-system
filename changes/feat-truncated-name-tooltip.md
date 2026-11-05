---
bump: minor
---
### A cut name says the whole of it: `TruncatedText` (November 2026)

New **`TruncatedText`** (and `useIsTruncated`): one line cut with "…" that shows the system `Tooltip` with the full text on hover and focus when — and only when — it has been cut, and is a tab stop only then. `AVTable` and `PlanningTable` use it for the title in their first column, replacing the browser's `title` attribute (slow, unstyled, shown even for text that fits, and no use from the keyboard). `Tooltip` gains `disabled`. Any table with a name that can truncate should do the same (docs/data-table.md).
