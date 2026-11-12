---
bump: patch
---
### `DataTable` — select-all speaks for the rows shown, and keeps the rest (November 2026)

Found in a review of the prototype's Added Values list, which pages and filters its rows but keeps one selection. The header checkbox compared counts: with 3 rows selected on page 1, a page of 3 other rows showed as all selected though none of them was, and pressing it cleared every selection. Select-all on page 2 also replaced page 1's selection instead of adding to it.

The header now looks at which of the rows shown are selected: checked when all of them are, partial when some are, clear when none are. Select-all adds the rows shown, or removes them, and never touches rows another page or filter is hiding. No API change: `AVTable` gets it through `DataTable`.
