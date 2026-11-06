---
bump: minor
---
### One date format everywhere: dd/mm/yyyy, or the person's locale (November 2026)

Dates read two or three ways: `DateField`, `InlineDateEdit` and the Planning table showed the raw ISO string ("2026-03-04"), the detail card's fields month-first ("10-01-2025"), and the filter bar dd/mm/yyyy. They all read **dd/mm/yyyy** now, from one place (`src/lib/format-date.ts`), by splitting the string so no time zone can move the day. Wrap the app in `<DateFormatProvider locale="en-US">` to read in the person's locale instead (order, separators and the detail card's placeholder follow it); `useDateFormat()` gives a component the same formatter. `formatDate`, `formatDayMonthYear` and `datePlaceholder` are exported. `InlineDateEdit`'s `format` still overrides.

Visible change: any story or page that showed an ISO date now shows dd/mm/yyyy.
