---
bump: minor
---
### `FilterBar` — the filter row above a list (October 2026)

New pattern, to Figma's `_Filter_Bar`: a search field, then period (a range calendar in a popover), status (`SearchSelect` with Clear all / Apply), priority (`Select`) and tags (`SearchSelect` with search, and removable tags), then Reset and a Filters button that shows or hides the fields. Every filter is controlled by the page. It is three columns from `md` up, with the buttons pinned top right and the fields wrapping between, and stacks as Figma's Mobile below. `children` adds more fields to the row.

`DatePickerPreset` and `DatePickerMode` are now exported from `DatePicker`.

The search box and every field are fluid between a minimum and a maximum width instead of fixed, so they stretch with the page; the minimums are measured so nothing is cut off, and a page with period, status, priority and tags fits one row at 1440 with the expanded sidebar. A page chooses which filters show by which props it passes (a draft page leaves `status` out), and the bar closes up around the rest.

`FilterBar` also takes `cycle`: a one-pick searchable field whose rows read **C33** (May 25, 2026 - Jun 08, 2026), as in the AV details card, while the field says just the code so it stays narrow. It is built on `SearchSelect`'s new `shortLabel`.

When the filters are folded away, the search box widens (up to 40rem) to use the room the fields leave.
