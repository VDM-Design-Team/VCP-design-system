---
bump: minor
---
### New `AVPage` (pattern): an Added Value's page, to read or to edit (November 2026)

The main content of an Added Value's page, built to Figma's `AV Page: Viewing AVs` and `Editing AVs`: the header, then two columns. **Left:** the title, the four description blocks (Problems, Solutions, Acceptance Criteria / Deliverables, Desired outcome), Multipart, Status History, then Comments (reading) or Duplicate to other Domains (editing). **Right:** the detail card, and when reading the deliverables.

The page passes each piece's own props (typed sections) and a section shows only when it is passed, so what differs by status, role or domain is what the page passes. `mode` (`view` or `edit`) picks the title (text, or a **Title** field), whether Comments or Duplicate shows, and where the status buttons are: in the header when reading, and in a bar at the bottom right with **Discard** (red text) when editing. The columns stack on a narrow page. Controlled and holds no state. Composed of `AVHeader`, `DetailCard`, `DeliverablesCard`, `DescriptionSection`, `MultipartSection`, `StatusHistory`, `CommentSection`, `DuplicateToOtherDomain`, `StatusProgression`, `Field`, `Input` and `Button`; nothing existing changes.

Not covered: Undo / Redo, the more-options menu's contents, and the missing-information error flow.
