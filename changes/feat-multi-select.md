---
bump: minor
---
### `MultiSelect` — several choices from a fixed list; `Tag` can be removable (October 2026)

New component, to Figma's filter fields and menus: a dropdown field that shows the picks as removable tags or a summary, over a panel of checkbox rows with optional group headings. `confirm` adds the status menu's Clear all / Apply footer, drafting the ticks until Apply. It is a select-only combobox with full keyboard support.

`Tag` gains `onRemove` and `removeLabel`: a ✕ button after the label, for a value picked into a field (also an AV's tags in edit mode). The ✕ is the only interactive part; a Tag without `onRemove` is unchanged. A tag that toggles or opens something is still a `Chip`.

`Checkbox` gains a `CheckboxMark` export: the box and tick with no input behind it, for rows that are themselves the control (`MultiSelect`'s options). Same box, tokens and tick as `Checkbox`.
