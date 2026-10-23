---
bump: major
---
### `SearchSelect` — rebuilt as the one searchable select; `Tag` can be removable; `CheckboxMark` (October 2026)

`SearchSelect` is now the system's single dropdown for picking from a list that is too long or too rich for `Select`: a field that shows the value and a panel with an optional search box over the rows, in the look of Figma's Edit Viewers dropdown. **Search lives in the panel, never in the field**; the reasons are recorded in `docs/search-select.md` so they are not reversed by accident.

- **One or several.** A pick closes the panel and the picked row carries a trailing check; with `multiple` a pick toggles, the panel stays open and each row leads with a checkbox. The field shows the name, "3 selected", or with `display="tags"` a removable tag per pick.
- **Rows** can sit under group headings (`group`), lead with an avatar or photo (`avatars`, `avatar`, `src`) or the "Unassigned" glyph, and be disabled.
- **`confirm`** (multiple) drafts the ticks behind a Clear all / Apply footer, as Figma's status menu.
- **`searchable={false}`** drops the search box for a short list; the trigger is then the select-only combobox.

Migration: the old `SearchSelect` was a text input that searched in the field. Its `placeholder` now labels the field (the search box takes `searchPlaceholder`); `renderOption` is gone; avatars are no longer on by default, so pass `avatars` for a list of people; `onChange` receives a `string` for a single pick and a `string[]` with `multiple` (the old `string & string[]` hybrid is gone). Nothing in this repository imported it.

`Tag` gains `onRemove` and `removeLabel`: a ✕ button after the label, for a value picked into a field (also an AV's tags in edit mode). The ✕ is the only interactive part; a Tag without `onRemove` is unchanged. A tag that toggles or opens something is still a `Chip`.

`Checkbox` gains a `CheckboxMark` export: the box and tick with no input behind it, for rows that are themselves the control. Same box, tokens and tick as `Checkbox`.
