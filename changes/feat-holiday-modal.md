---
bump: minor
---
### Holiday Registry: `HolidayModal`, `HolidayTypeTag`, and a range mode for `DateField` (November 2026)

New **`HolidayModal`** (Figma's `Holiday_Registry_Modal`): add or edit a holiday — name, Recurring Yearly (a switch with an ⓘ), a period picked on a two-month calendar and applied, and the type — checked when Add or Save is pressed. New **`HolidayTypeTag`**: Public (globe), Team (group), Individual (person).

`DateField` gains `mode="range"` (with `rangeEnd`, `onRangeChange` and `formatDate`): two clicks on a two-month calendar, then **Apply** or **Clear**; nothing reaches the page until Apply. `DatePicker` gains `onApply` / `applyLabel`: a primary Apply beside Clear. The table and row come next.

**Table and row:** new **`HolidayTable`** (Figma's `_Holiday_Registry_Table` and `Holiday_Registry_Row`): the filter row (type, period, applies to) with Add Holiday and Import from Hubstaff for an admin, the rows (name with its Hubstaff-duplicate flag, date with its day count, type, applies to, all day, recurring, added by, source, and edit / delete for an admin), the empty state and the pagination. New **`HolidaySourceBadge`** (Manual Entry, Google Calendar, In Hubstaff) The Period filter is the existing `DateField` in month mode with the sprints passed in as `presets`: `DateField` gains `onClear` (the picker's own Clear, for a filter) and, in month mode, reports a named period's start and end through `onRangeChange` and reads it after its month. `DatePicker` in month mode shows range presets (a named stretch beside the months); day mode still hides them.

`DataTable` columns gain `minWidth` (a floor in CSS length). `DatePicker`'s preset column is as wide as its longest name (it was a fixed 140), still centred.
