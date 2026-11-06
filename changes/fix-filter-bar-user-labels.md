---
bump: minor
---
### `FilterBar`: a filled user field says which person it filters (November 2026)

Once filled ("Amy Lee", "2 selected") a user field gave no hint whether it was the Assignee or the Initiator. It now reads **"Assignee: Amy Lee"** (or "Assignee: 2 selected"). New `SearchSelect` prop `valuePrefix` does it (drawn only; the trigger's accessible name is still its label and then its value, so it is not read twice); `FilterBar` passes each user entry's `label`. The placeholder is unchanged.
