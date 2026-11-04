---
bump: minor
---
### `ChangePasswordForm` — the Password tab of Settings (November 2026)

New pattern, built to Figma's `Settings_Password`: Old, New and Confirm Password (each a `PasswordField` with a show/hide eye), a `PasswordStrength` meter under the new one (the page scores it with `getStrength`; the field is described by the meter), and Set Password. Each field is required, in Figma's own words ("Old password is required"…); a confirmation that does not match is an addition. Set Password says what is wrong, moves focus and does not go through; `errors` carries server messages; `saving` locks the fields. It changes nothing itself.

The strength score is VCP's own, `scorePassword` in `src/lib/password-strength.ts` (length, character kinds, common passwords; 0–4), and the form uses it by default, debounced 300ms; `getStrength={null}` removes the meter. A new password under 8 characters is refused ("Password must be at least 8 characters"), and New Password says so beforehand, under the field ("At least 8 characters"); strength is never required. A field with an error turns its edge critical. `scorePassword` and `MIN_PASSWORD_LENGTH` are exported, so a page uses the same rule. `PasswordField`'s eye is grey (`neutral.outline` content) rather than brand blue.
