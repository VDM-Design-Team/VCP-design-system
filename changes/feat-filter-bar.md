---
bump: minor
---
### `FilterBar` — the filter row above a list (October 2026)

New pattern, to Figma's `_Filter_Bar`: a search field, then period (a range calendar in a popover), status (`SearchSelect` with Clear all / Apply), priority (`Select`) and tags (`SearchSelect` with search, and removable tags), then Reset and a Filters button that shows or hides the fields. Every filter is controlled by the page. It is three columns from `md` up, with the buttons pinned top right and the fields wrapping between, and stacks as Figma's Mobile below. `children` adds more fields to the row.

`DatePickerPreset` and `DatePickerMode` are now exported from `DatePicker`.
