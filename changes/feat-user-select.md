---
bump: minor
---
### `UserSelect` — people from a searchable list, one or several; `FilterBar` gets user fields (October 2026)

New component, to Figma's `_Filter_User` field and the Edit Viewers dropdown: a field that shows who is picked, over a panel with a boxed "Search by name" field and 40-tall avatar rows, plus an "Unassigned" row. Unlike `SearchSelect`, it shows who was chosen. **Single** closes on a pick; **`multiple`** toggles and stays open, with the field showing a summary or, with `display="tags"`, a removable tag per person. The trigger is a button and focus moves to the search when it opens; arrows, Enter, Escape and Tab all work.

The panel is the system's dropdown-with-search look; `docs/user-select.md` records its numbers so the next searchable dropdown reuses them.

`FilterBar` takes `users`, one `UserSelect` per entry (Assignee, Initiator…), after tags; an entry can be `multiple`.
