---
bump: patch
---
### `TagEditor` — flagged: no Figma source (October 2026)

Docs and Storybook only. `TagEditor` was ported from the original export and has no Figma source; checked against the *Tag Management* page, it matches no part of it (that page is cards of rows
with Add New / edit / delete buttons plus add and delete modals — no tone swatches, coloured tags or inline form). Flagged in `docs/tag-editor.md`, the Storybook description,
`docs/inventory.md` and `docs/figma-audit.md`. No code change; nothing in the repo imports it.
