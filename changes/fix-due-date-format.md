---
bump: minor
---
### `DueDateTag` and `AVTable` — due dates read dd/mm/yyyy (November 2026)

A due date in the Added Value table could read "October 1, 2025" while every other date read 01/10/2025, because the tag took ready-made text and each page formatted its own.

- **`DueDateTag` takes `date`** (ISO `yyyy-mm-dd`) and shows it through the system's one formatter: dd/mm/yyyy, or the person's locale (`DateFormatProvider`), inside a `<time>`. `children` is still accepted for text that is not a date ("-").
- **`AVTable` rows take `due.date`** (ISO). `due.label` still works, for text that is not a date.
- `DetailCard` and `MultipartRow` pass the date the same way; they read as before.

Callers that pass a formatted date as `children` or `due.label` keep working, but should switch to `date`.
