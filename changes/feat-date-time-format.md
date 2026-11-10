---
bump: minor
---
### One date-and-time formatter: "10/06/2026 14:37" (November 2026)

`src/lib/format-date.ts` gains `formatDateTime` and `formatTime` (exported from the package) and `useDateFormat()` gains `dateTime(iso)` and `time(iso)`: anything that shows a time now has one way to write it, the date as every date reads (dd/mm/yyyy, or the person's locale's order) and then a **24-hour** time, whatever the locale. An ISO date-time with **no zone** reads as written and is never converted; one **with a zone** is an instant, shown in the provider's `timeZone` (new on `DateFormatProvider`) or the person's own; a date with no time is just the date; anything else comes back as given. Nothing existing changes: `format`, `range` and `placeholder` read as before.
