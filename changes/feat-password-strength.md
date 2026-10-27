---
bump: minor
---
### `PasswordStrength` — new component; `ProgressBar` gains `info`, `valueLabel` and `role` (October 2026)

`PasswordStrength` is a labelled five-step meter (`very-weak` → `strong`) for the
password being typed, ported from the Settings "New Password" item and built on
`ProgressBar`. The caller scores the password and may pass a one-line `message`.

`ProgressBar` grows three additive pieces so it can carry this: a `tone="info"`
(`accent.info.filled.surface`), a `valueLabel` that paints and announces words
("Strong") in place of the percentage, and `role="meter"` for a value that is not
progress toward finishing. Existing bars are unchanged. No new tokens.
