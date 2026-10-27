# PasswordStrength

A five-step meter that tells someone how strong the password they are typing
is. It sits directly under a password `Input`.

## Composed of

| Piece | Tier |
|---|---|
| `ProgressBar` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `PasswordStrength` | Feedback on a *new* password while it is being typed (sign-up, reset, change) |
| `ProgressBar` | A known fraction of a known whole — budget, upload, capacity. `PasswordStrength` is built on it |
| `Field`'s `error` | A rule that must pass before submit ("at least 12 characters") |

The meter is advice, not a gate. A rule the server enforces still needs a
`Field` error — don't rely on a "Weak" bar to block submission.

**The caller scores, this draws.** What counts as Fair or Strong — length,
character classes, a breach list — is product policy and changes without a
design change, so `strength` is an input. Likewise the one-line `message`:
the copy belongs to whoever owns the rule.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `strength` | `very-weak \| weak \| fair \| good \| strong` | required | The caller's verdict |
| `label` | `string` | `Password Strength` | Names the meter, top left |
| `message` | `string` | — | One line under the bar. Critical-coloured for `very-weak` and `weak`, quiet otherwise |
| `className` | `string` | — | Merged via `cn()` on the root |

## Levels

| Level | Fill | `ProgressBar` tone | Token |
|---|---|---|---|
| `very-weak` | 20% | `critical` | `accent.critical.filled.surface` |
| `weak` | 40% | `pending` | `accent.pending.outline.border` |
| `fair` | 60% | `caution` | `accent.warning.outline.border` |
| `good` | 80% | `info` | `accent.info.filled.surface` |
| `strong` | 100% | `success` | `accent.success.filled.surface` |

The label row is `ProgressBar`'s `labelSize="md"` (14px, as Figma draws it); the
message under it stays 12px. The track and the other fills are `ProgressBar`'s, so the contrast figures in
`docs/progress-bar.md` apply.

**Weak and Fair do not pass on the light track.** Both use the bright
`outline.border` shades the Figma file paints — Weak
`accent.pending.outline.border.default` (**2.27:1** light, 4.11:1 dark) and Fair
`accent.warning.outline.border.default` (**1.55:1** light, 4.98:1 dark) — under
the 3:1 a meaningful graphic should reach. That is kept deliberately: the level
is printed at the end of the label row and read out as `aria-valuetext`, so the
fill's colour is never the only signal. Don't copy this choice to a bar that has
no words beside it.

`pending` is the new orange status family (`accent.pending.*`, built from GDL's
core orange scale).

## Accessibility

- `ProgressBar` with `role="meter"`: `aria-valuemin="0"`, `aria-valuemax="5"`, a
  real `aria-valuenow`, and `aria-valuetext` carrying the word ("Weak"), so a
  screen reader says the level rather than "2".
- The meter is named by the visible `label` via `aria-labelledby`.
- Colour is never the only signal: the status word is printed at the right and
  read out as `aria-valuetext`.
- `message` is `aria-live="polite"`, so a change from "too simple" to nothing is
  not silent. Keep it to one short sentence.
- The bar's width eases over 300ms (`ProgressBar`'s); it does not animate from
  zero on mount.

## Don't

- **Don't compute strength inside the component.** One rule, one owner — the
  caller.
- **Don't use it for a login form.** Strength feedback on an existing password
  is noise and leaks policy.
- **Don't put the only error text in the meter.** Pair a hard rule with a
  `Field` error.
- **Don't recolour the fill per screen.** The level → colour mapping is owned
  here.
