---
bump: minor
---
### `AssigneeWithStatus`, `Tooltip`, `AssigneeSelectionDropdown`, `SearchSelect` — said once, dates with words, Escape noted (November 2026)

Follow-ups to the assignee availability pieces.

- **`AssigneeWithStatus`** — the sentence ("John Doe (Assignee, Busy)") is the avatar's name, and the tooltip
  used to add it again as a description, so a screen reader heard it twice. The tooltip still shows it; it no
  longer describes. **`Tooltip`** gains `describe` (default `true`) for this: off, the bubble shows but is not
  wired to the trigger with `aria-describedby`.
- **`AssigneeSelectionDropdown`** — new `freeFromText` (default "Free from"). A busy or unavailable row's date
  pill shows only the date; a screen reader now hears what it is ("Cy Park, Free from May 17").
- **`SearchSelect`** — a behaviour change that came with `collapsibleGroups` and was not noted: **Escape closes
  the panel from anything inside it** (Clear all, Apply, a group heading), putting focus back on the trigger. It
  used to do nothing there. With `confirm`, Escape discards the draft, as a click away does.
