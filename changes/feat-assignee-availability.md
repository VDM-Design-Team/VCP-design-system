---
bump: minor
---
### Assignee availability — `AssigneeStatus`, `AssigneeWithStatus`, `AssigneeSelectionDropdown`; `SearchSelect` collapsible groups (November 2026)

Built to Figma's Assignee Availability page and flow.

- **`AssigneeStatus`** (atom) — the green / amber / red dot, at the table (10) and menu (12) sizes. Owns the status → colour mapping and the status words.
- **`AssigneeWithStatus`** (component) — an avatar with the dot on its corner and a tooltip, "John Doe (Assignee, Busy)", which also names the avatar for a screen reader.
- **`AssigneeSelectionDropdown`** (component) — assignees grouped under collapsible Available / Busy / Unavailable headings with a date pill on busy and unavailable rows; unavailable people cannot be picked; an unknown state for when the dates are not set yet; a warning (busy) or error (unavailable) on the field after the pick.
- **`SearchSelect`** — new `collapsibleGroups`, `defaultCollapsedGroups`, `renderGroupHeading`, `panelNotice` and `warning` props. Additive: nothing changes without them.
