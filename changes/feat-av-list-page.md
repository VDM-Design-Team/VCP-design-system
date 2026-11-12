---
bump: minor
---
### New `AVListPage` (pattern): My Values, Assigned Values, Drafts, Manage and the Archived Values tabs (November 2026)

The main content of a page that lists Added Values: the title, an optional totals strip (`MyValuesStats`), and `AVTable` with its `FilterBar` inside the table's card. Figma's six list pages are this one layout, and each passes what it has: My Values passes `stats` and `table.actions`, Drafts `table.selectable`, Manage a `filters` with Assignee and Initiator, Assigned and the Archive tabs only a title and the table.

The filters sit in the card (`TableCard`'s rule), not on the canvas above it as Figma draws them. An empty table says why through `TableEmpty` ("No added values yet.", or "No added values match “…”." with a **Reset** that hands focus to the search box). Controlled and holds no data. Composed of `PageTitle`, `MyValuesStats`, `FilterBar`, `AVTable` and `TableEmpty`; nothing existing changes. 

The Archive tabs are titled "Archived Values: Completed", "Archived Values: Rejected" and "Archived Values: Backlogged" and filter by Priority, Tags and Date only (each holds one status, so no Status filter). In the Development domain, Manage and Assigned also pass `FilterBar`'s `cycle`, preselected to the current cycle.

On Drafts and Manage, `bulk` (`BulkActionBar`'s props) adds the bar stuck to the bottom of the table while rows are selected; when the selection empties, focus goes to the table's select-all checkbox, wired by the pattern. The table's own Delete Selected is left out.
