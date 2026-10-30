---
bump: patch
---
### `DropdownStepper` — a disabled control looks disabled (October 2026)

Fix: with `disabled` set, only the text and arrows turned grey. The control kept its enabled white fill and `stroke.strong` border and a normal cursor, so next to a disabled `Stepper`, `Input` or `Select` it looked like the only enabled one. It now takes the Input family's disabled look, the same as `Stepper`: `surface.neutral.subtle` fill, `stroke.subtle` border, a not-allowed cursor. The look follows the `disabled` prop only. An arrow that dies at the end of the list still leaves the control looking enabled. No API change.
