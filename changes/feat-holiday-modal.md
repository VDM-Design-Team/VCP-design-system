---
bump: minor
---
### Holiday Registry: `HolidayModal`, `HolidayTypeTag`, and a range mode for `DateField` (November 2026)

New **`HolidayModal`** (Figma's `Holiday_Registry_Modal`): add or edit a holiday — name, Recurring Yearly (a switch with an ⓘ), a period picked on a two-month calendar and applied, and the type — checked when Add or Save is pressed. New **`HolidayTypeTag`**: Public (globe), Team (group), Individual (person).

`DateField` gains `mode="range"` (with `rangeEnd`, `onRangeChange` and `formatDate`): two clicks on a two-month calendar, then **Apply** or **Clear**; nothing reaches the page until Apply. `DatePicker` gains `onApply` / `applyLabel`: a primary Apply beside Clear. The table and row come next.
