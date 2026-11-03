# ChangePasswordForm *(pattern)*

The Password tab of Settings: your current password, the new one, the new one again, and Set Password. Built to Figma's `Settings_Password` (the
`_Password_Item_*` items).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Field` | component |
| `PasswordField` | component |
| `PasswordStrength` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ChangePasswordForm` | The Password tab of Settings: changing your own password |
| `PersonalInfoForm` | The Personal Info tab |
| `PasswordField` | A password field on its own (a login, a reset) |

## What it shows

- **Old Password**, **New Password** and **Confirm Password** — each a `PasswordField`: dots, with an eye to show what you typed.
- **Under New Password, a `PasswordStrength` meter** says how strong it is while you type. **The page scores it** (`getStrength`): what makes a password Fair or
  Strong is product policy. Left out, there is no meter. The meter is advice, not a gate.
- **Set Password** hands the old and new passwords to `onSubmit`. It changes nothing itself.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onSubmit` | `({ oldPassword, newPassword }) => void` | required | Valid, it gets the old and new passwords. **Changes nothing itself** |
| `getStrength` | `(password) => { strength, message? }` | — | The page's rule: `strength` is a `PasswordStrengthLevel`, `message` the line under the meter. Left out, no meter |
| `saving` | `boolean` | — | The button spins and every field (and eye) locks |
| `errors` | `{ oldPassword?, newPassword?, confirmPassword? }` | — | What only the server knows ("Old password is incorrect") |

It keeps its own draft. **After a successful change, clear it by giving the form a new `key`.**

## Validation, in Figma's words

Each field is required, with the words Figma's Error variants use: **"Old password is required"**, **"New password is required"**, **"Password confirmation is
required"**. A confirmation that is not the new password — **"Passwords do not match"** — is an addition. Set Password then says what is wrong under the field,
**moves focus to the first problem** and does not call `onSubmit`; fixing a field clears what was said about it. Figma's empty-state placeholders are used: "Enter your
current password", "Enter a strong password", "Confirm your new password".

**The strength is not a gate:** a weak password is allowed through by this form. A rule the server enforces comes back in `errors`.

## Tokens

None of its own: `Field`, `PasswordField` (`Input`'s shell, 40 high) and `Button` `sm` on a `surface.elevated` card (`radius.md`, `space.16`), the fields 32rem wide as Figma's
512. The meter is `PasswordStrength`'s (see docs/password-strength.md).

## Accessibility

- A real `<form>`; every field has a visible label; an error sits under its field, is announced (`aria-invalid`, `role="alert"`) and the first takes focus.
- `autocomplete` is `current-password` for the old password and `new-password` for the other two, so a password manager fills and saves them correctly.
- The New Password field is **described by the strength meter**, so focusing it reads the strength (a meter is not announced as it changes).
- Each eye is a real button named "Show password" with `aria-pressed` and a 40 press area.

## Don't

- **Don't score the password inside it.** `getStrength` is the page's policy.
- **Don't treat the meter as the rule.** It advises; the server enforces.
- **Don't keep the passwords after a change.** Give the form a new `key`.
