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
| `weak` | 40% | `critical` | `accent.critical.filled.surface` |
| `fair` | 60% | `warning` | `accent.warning.filled.surface` |
| `good` | 80% | `info` | `accent.info.filled.surface` |
| `strong` | 100% | `success` | `accent.success.filled.surface` |

The track and the fills are `ProgressBar`'s, so the contrast figures in
`docs/progress-bar.md` apply. The accessible `filled` shades were chosen over
the brighter `outline.border` ones the Figma file paints (its Fair amber would
be about 1.6:1 against the track).

Very Weak and Weak share `critical`: the Figma design painted Weak orange with
an unbound colour, and VCP has no orange semantic token yet (GDL's core scale
has one). The fill length separates them.

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
