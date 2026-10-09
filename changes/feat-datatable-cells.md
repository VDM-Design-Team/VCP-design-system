---
bump: major
---
### `DataTable` cells — copy, inline edit, column hints, always left-aligned (October 2026)

- **`InlineEdit` is reworked to Figma's buttons** (`_Planning_Table_Icon_Button`): cancel on the left, confirm on the right, 24 tonal discs, the pen a
  `note-pencil` with an "Edit" tooltip. **New `InlineDateEdit`**: a date with a calendar button that opens a `DatePicker` in a popover; picking a
  day commits it, no confirm. The Inline Editing story now shows all three kinds: type, choose, calendar.
- **`InlineEdit`: clicking outside an editing cell cancels it; the pen and the calendar button are drawn on hover or keyboard focus only (they stayed
  drawn after a mouse click closed the editor); the control sits 6 from the cancel and confirm buttons, and the two buttons are 4 apart.**
- **`IconButton` gains `variant="tonal"` and `size="xs"` (24, 16 glyph).** New tokens `neutral.tonal.surface.{hover,pressed,disabled}` and
  `neutral.tonal.content.{hover,pressed,disabled}`, from Figma's `colors/neutral/tonal/*`.
- **New `CopyText`**: a non-link value that underlines on hover and, on click, copies itself and shows "Copied" for 800ms
  (Figma `_AV_Table_ID`, `7247:39763`). **New `InlineEdit`**: a value with a pen that swaps to a caller-supplied control with confirm and
  cancel buttons, Enter/Escape and focus handling.
- **Header order: label, hint, then the sort arrows** ("Supplier ⓘ ⇅"). The sort button is now the label alone, with an overlay that makes
  the arrows clickable too, and the hint raised above it; still one tab stop per control.
- **`ColumnHint`** is exported from `DataTable` — the header info glyph with a tooltip, formerly private to `AVTable` (which now uses it).
- **Breaking:** `DataTableColumn.align` is removed. Cell values and headers are always left-aligned. Migration: delete `align: 'right'`;
  nothing in the repo used it outside the DataTable story.
- New stories: Actions Column (a `Menu` on a `dots-three` — horizontal — button), Column Tooltips, Copyable Column, Inline Editing; and a
  "How developers customise it" section in `docs/data-table.md`.
- **Known limit:** a `Menu` in a row is clipped by the table's scroll container (no portal); the story uses `className="overflow-visible"`.
