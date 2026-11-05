---
bump: minor
---
### `Stepper` — commit after a pause, and only numbers (November 2026)

New opt-in `commitDelay` (ms): what is typed commits after that long without a keystroke, without leaving the field, so anything derived from the value follows while it is typed. Off by default; a stepper still commits on blur or Enter unless it is set. Also, only a number can now be typed: digits, a leading minus when `min` is below zero, a point when the steps are fractional; anything else is dropped as it is typed.
