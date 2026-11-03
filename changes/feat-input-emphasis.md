---
bump: minor
---
### `Input` — `emphasis`; `DateField`'s value is medium (November 2026)

`Input` takes `emphasis: 'regular' | 'medium'` (regular by default, so every input is unchanged): `medium` sets the value in medium weight while the placeholder stays regular — what a chosen value reads as in `Select` and `SearchSelect`. `DateField` now uses it, so a chosen date is medium (it was regular) and a date field reads the same as the selects beside it. This changes the look of existing day-mode date fields, such as the Add Required Details dialog's.
