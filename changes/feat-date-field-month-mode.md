---
bump: minor
---
### `DateField` — `mode="month"` (November 2026)

`DateField` takes `mode: 'day' | 'month'` (`DatePicker`'s own prop; `day` by default, so every existing field is unchanged). In month mode the field reads "September 2026", the calendar opens on the month grid, and `onChange` reports the first of the chosen month; `estimated` is ignored. For a month with no day — a reporting period — where Figma draws a month selector. New helper `formatMonth`.
