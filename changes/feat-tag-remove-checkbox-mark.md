---
bump: minor
---
### `Tag` can be removable; `CheckboxMark` (October 2026)

`Tag` gains `onRemove` and `removeLabel`: a ✕ button after the label, for a value picked into a field (also an AV's tags in edit mode). The ✕ is the only interactive part; a Tag without `onRemove` is unchanged. A tag that toggles or opens something is still a `Chip`. The ✕ is 20, the largest that fits inside the 24 tall small tag, so it is under the 40 touch minimum, the exception `TagEditor` already makes; its left margin cancels the tag's gap (`-ml-1` on `xs` / `sm`, `-ml-1.5` on `md` / `lg`).

`Checkbox` gains a `CheckboxMark` export: the box and tick with no input behind it, for rows that are themselves the control. Same box, tokens and tick as `Checkbox`.
