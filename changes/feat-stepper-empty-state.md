---
bump: minor
---
### `Stepper` — an empty state (November 2026)

`value` can now be `null`: a number not chosen yet, shown as `placeholder` ("Set Budget") in italic `text.tertiary`. Nudging up gives an empty field its minimum; the down caret is disabled. New `onClear` is called when a field is committed empty, so a caller can take a value back to `null`. Without `onClear` an empty commit restores the number as before, so existing steppers are unchanged.
