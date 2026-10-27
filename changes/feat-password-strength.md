---
bump: minor
---
### `PasswordStrength` — new atom (October 2026)

A labelled five-step meter (`very-weak` → `strong`) for the password being
typed, ported from the Settings "New Password" item. `role="meter"` with the
level read out as `aria-valuetext`; the caller scores the password and may pass
a one-line `message`. Fills reuse the `accent.*.filled` tokens and the
`surface.track` that `ProgressBar` introduced; no new tokens.
