---
bump: minor
---
### `AcceptPendingAVModal` — naming the parts of a multipart value (November 2026)

New `parts` prop (`{ label, preview? }[]`, one per problem set). With multipart ticked, the dialog shows **Rename Individual parts**: each part's label, a **Preview** of its set and an optional title ("Enter a title, or leave blank for “Part (X/X) Parent Title”."), as Figma's "Accepting AV with Multipart + Custom Titles" (`1666:263661`) draws it. `onConfirm` now also hands back `titles` (one per part, trimmed, `''` for the default). Without `parts` the dialog is unchanged.
