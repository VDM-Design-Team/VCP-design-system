---
bump: patch
---
### `DateField` — no Clear button that did nothing (November 2026)

Fix: a date field's calendar showed `DatePicker`'s footer **Clear** button, but nothing was wired to it, so pressing it left the date as it was and the calendar open. It showed in every `DateField`: the Add Required Details dialog's dates, and since #258 the super admin dashboard's month filter, where Figma's month selector draws no Clear. The field now turns it off (`clearable={false}`), in day and month mode. A form whose date is optional offers its own way to clear it, as the docs already said. No API change.
