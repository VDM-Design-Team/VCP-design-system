---
bump: patch
---
### `DetailCard`, `AVTable` — three gaps from the Pages & Flows audit (November 2026)

- **`DetailCard`: the Initiator (and Assignee) error now shows.** `errors.initiators` and `errors.assignees` were accepted and never drawn, so a page that told a person to "select at least one Initiator" had no field error behind it. The message is now under the chips, in the critical colour, and the field's group is described by it (no `role="alert"`, like the other fields' errors: the page's toast announces it once). A new story checks it.
- **`DetailCard`: a multipart part's edit page locks Tags too.** Figma greys Projects, AV Category, Tags, Type and Urgency there (`1404:132644`); the docs and the story locked four and asserted Tags stayed editable. `readOnly` already worked for Tags, so only the documented set and the story change.
- **`AVTable`: the Members header's tooltip has its copy.** Figma's Assigned page writes "Displays the people assigned to or responsible for the task"; the table had no default, so the glyph never showed. Ours says "…responsible for the Added Value" (decided 17 November 2026: the column tooltips say "Added Value", not "task"). New `MEMBERS_COLUMN_HINT` is the default for `hints.members` (pass your own, or `''` to drop it). The "Still open" note in `docs/av-table.md` is gone. A story checks it.
