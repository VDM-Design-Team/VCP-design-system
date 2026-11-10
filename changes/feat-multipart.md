---
bump: minor
---
### Multipart: `MultipartSection`, `MultipartRow`, `ChildPartModal` (November 2026)

New **`MultipartRow`** (a part: number — green when completed —, title, assignee, "10 CP", due date, status), new **`MultipartSection`** (the AV page's card: a Multipart heading, "33% (1/3 parts completed)", a progress bar worked out from the parts, the rows, and **Add Part** when editing; its rows share one grid, so the points, dates and status tags line up in columns — and stack when the section is narrow), and new **`ChildPartModal`** ("Add a New Child Part to Multipart AV": a Title that may be left blank, with a "Status will change" warning for a completed AV). Built to Figma's `Multipart_Section`, rows and `Multipart_Child_Part_Modal`. Each only asks: opening a part, adding one and working out the default title are the page's.

Hovering a row shows an edit button after its title (a 24 tonal pencil; also shown on focus and on touch screens) — `MultipartRow.onEditTitle`, `MultipartSection.onEditPartTitle` — and `ChildPartModal` gains `mode="edit"` ("Edit Child Part Title", **Save**, `initialTitle`) for renaming; a blank title means "use the default" in both modes.

Review changes: a long part title shows in full on hover and focus (`TruncatedText`, or a tooltip on the title button), the progress bar is named "Multipart progress" so the summary is said once, `dueDate` is ISO shown dd/mm/yyyy (or the person's locale), "a part is done" is one helper (`isPartCompleted`), and the info glyph is `InfoHint` with design's text. `ChildPartModal`'s footer is `ModalCancel` and `ModalConfirm` (40 high), like every other dialog's.
