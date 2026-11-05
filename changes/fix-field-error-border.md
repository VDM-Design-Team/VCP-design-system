---
bump: minor
---
### A `Field` error turns the control's edge red too (November 2026)

`Input`, `Select`, `Textarea`, `SearchSelect` and `DateField` now draw the critical border when they are `aria-invalid`, which is what a `Field` with an `error` puts on its control. Before, only passing `invalid` to the control did, so a `Field` with just an `error` showed the red message and left the edge alone. The red message and the red edge now always arrive together. Passing `invalid` still works on its own.
