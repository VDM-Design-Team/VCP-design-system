---
bump: minor
---
### `accent.pending` tokens; `PasswordStrength` component; `ProgressBar` tones and props (October 2026)

**New tokens: `accent.pending.*`** — an orange status family with the same shape as
`accent.warning` (`filled` / `outline` / `tonal` × `surface` / `content` / `border` ×
`default` / `hover` / `pressed` / `disabled`), light and dark, built from GDL's core
orange scale. The name is the one GDL's contract reserves for CAF's "pending", so
`npm run check:contract` recognises it.

**New component: `PasswordStrength`** — a labelled five-step meter (`very-weak` →
`strong`) for the password being typed, ported from the Settings "New Password"
item and built on `ProgressBar`. The caller scores the password and may pass a
one-line `message`.

**`ProgressBar`** grows additive pieces so it can carry this: `tone="info"`,
`tone="pending"` (`accent.pending.filled.surface`), `tone="caution"` (the bright
`accent.warning.outline.border` — **1.55:1 on the light track**, documented as only
for use beside a written value), a `valueLabel` that paints and announces words in
place of the percentage, and `role="meter"`. Existing bars are unchanged.
