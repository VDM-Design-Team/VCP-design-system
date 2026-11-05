---
bump: minor
---
### `DomainItem`, `DomainCard`, `TagManagementModal` — Tag Management (November 2026)

New, built to Figma's Tag Management page.

- **`DomainItem`** (component) — a row with edit and delete; a locked built-in with a "Default" `Tag`; a draggable row with a grip that also moves with ↑ / ↓.
- **`DomainCard`** (pattern) — a titled card with "Add New" and a column of rows. Draggable rows reorder by pointer or keyboard, among themselves only, with a live-region announcement.
- **`TagManagementModal`** (pattern) — add a tag, add a domain, confirm deleting a domain.

**`Modal`** — new `actions` prop (the standard Cancel + answer row; `secondary` + `primary`) and `tone="critical"` (swaps to a grey `neutral` Cancel and a red `danger` answer, and defaults to `alertdialog`, no ✕, no backdrop dismissal). `footer` is unchanged and wins when set.

**`TagManagementModal`** — `mode="edit"` + `initialName` rename a tag or domain (not drawn in Figma; the add dialog, reused).

**`IconButton`** — new `critical` variant: textual like `tertiary` but red — only the glyph colour changes on hover and press (`accent.critical.outline.content`). The quiet destructive control, for a row's bin; `danger` stays the loud filled one.
