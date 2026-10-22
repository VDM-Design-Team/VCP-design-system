---
bump: minor
---
### `UserSelect` — one person from a searchable list; `FilterBar` gets user fields (October 2026)

New component, to Figma's `_Filter_User` field and user menu: a field that shows the person picked, over a panel with a search field and avatar rows, plus an "Unassigned" row. Unlike `SearchSelect`, it shows who was chosen. The trigger is a button and focus moves to the search when it opens; arrows, Enter, Escape and Tab all work.

`FilterBar` takes `users`, one `UserSelect` per entry (Assignee, Initiator…), after tags.
