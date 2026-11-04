---
bump: minor
---
### Holiday Registry: `HolidayModal`, `HolidayTypeTag`, and a range mode for `DateField` (November 2026)

New **`HolidayModal`** (Figma's `Holiday_Registry_Modal`): add or edit a holiday — name, Recurring Yearly (a switch with an ⓘ), a period picked on a two-month calendar and applied, and the type — checked when Add or Save is pressed. New **`HolidayTypeTag`**: Public (globe), Team (group), Individual (person).

`DateField` gains `mode="range"` (with `rangeEnd`, `onRangeChange` and `formatDate`): two clicks on a two-month calendar, then **Apply** or **Clear**; nothing reaches the page until Apply. `DatePicker` gains `onApply` / `applyLabel`: a primary Apply beside Clear. The table and row come next.

**Table and row:** new **`HolidayTable`** (Figma's `_Holiday_Registry_Table` and `Holiday_Registry_Row`): the filter row (type, period, applies to) with Add Holiday and Import from Hubstaff for an admin, the rows (name with its Hubstaff-duplicate flag, date with its day count, type, applies to, all day, recurring, added by, source, and edit / delete for an admin), the empty state and the pagination. New **`HolidaySourceBadge`** (Manual Entry, Google Calendar, In Hubstaff) and **`PeriodSelect`** (a month or a named period such as a sprint, with Clear). `DatePicker` in month mode now shows range presets (named stretches beside the months); day mode still hides them.

`DataTable` columns gain `minWidth` (a floor in CSS length). `DatePicker`'s preset column is as wide as its longest name and, in month mode, starts at the top.
