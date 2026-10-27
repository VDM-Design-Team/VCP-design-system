---
bump: minor
---
### `Stepper` — `variant="stacked"` (October 2026)

New `variant` prop: `sides` (default, unchanged) or `stacked`, the number-input
layout from Figma's `_Number_Input_Step` — the value left-aligned like an
`Input` with one up/down caret pair stacked at the end. Same props and behaviour
(draft-based typing, clamping, disabled-at-the-ends); the carets leave the tab
order and Arrow Up/Down covers the keyboard. No new tokens.

Also fixes `Stepper`'s shell greying out as if disabled whenever a nudge button
disabled at `min`/`max`; the disabled treatment now follows the `<input>` only.
