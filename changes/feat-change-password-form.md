---
bump: minor
---
### `ChangePasswordForm` — the Password tab of Settings (November 2026)

New pattern, built to Figma's `Settings_Password`: Old, New and Confirm Password (each a `PasswordField` with a show/hide eye), a `PasswordStrength` meter under the new one (the page scores it with `getStrength`; the field is described by the meter), and Set Password. Each field is required, in Figma's own words ("Old password is required"…); a confirmation that does not match is an addition. Set Password says what is wrong, moves focus and does not go through; `errors` carries server messages; `saving` locks the fields. It changes nothing itself.
