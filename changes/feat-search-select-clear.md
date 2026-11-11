---
bump: minor
---
### `SearchSelect` — a ✕ to clear one pick; `FilterBar`'s people fields have it (November 2026)

A one-pick `SearchSelect` can be `clearable`: with a value, a ✕ before the caret empties the field and gives focus back to it, as Figma's Manage filters draw it ("Filter by Assignee and Clear"). `FilterBar` turns it on for its one-person fields (Assignee, Initiator), so a filter by person can be undone without Reset Filters.
