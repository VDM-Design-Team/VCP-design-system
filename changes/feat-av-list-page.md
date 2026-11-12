---
bump: minor
---
### New `AVListPage` (pattern): My Values, Assigned, Drafts, Manage and the Archive tabs (November 2026)

The main content of a page that lists Added Values: the title, an optional totals strip (`MyValuesStats`), and `AVTable` with its `FilterBar` inside the table's card. Figma's six list pages are this one layout, and each passes what it has: My Values passes `stats` and `table.actions`, Drafts `table.selectable`, Manage a `filters` with Assignee and Initiator, Assigned and the Archive tabs only a title and the table.

The filters sit in the card (`TableCard`'s rule), not on the canvas above it as Figma draws them. An empty table says why through `TableEmpty` ("No added values yet.", or "No added values match “…”." with a **Reset** that hands focus to the search box). Controlled and holds no data. Composed of `PageTitle`, `MyValuesStats`, `FilterBar`, `AVTable` and `TableEmpty`; nothing existing changes. The bulk-action bar (#279) is not here yet.
