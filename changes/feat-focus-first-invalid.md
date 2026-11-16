---
bump: minor
---
### `focusFirstInvalid` — take the person to the first missing field (November 2026)

New helper in `src/lib`: after a blocked submit, `focusFirstInvalid(form)` scrolls to the first `aria-invalid` control (the page order) and focuses it, smoothly unless the person prefers reduced motion, and only scrolling when the field is not already fully in view. It is the "go to the field" half of the Missing input behaviour. Described in `docs/field.md`, with a Field story that submits a form with two missing fields and checks the earlier one has focus.
