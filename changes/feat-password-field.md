---
bump: minor
---
### `PasswordField` — a password input with a show/hide eye (November 2026)

New, built to Figma's `_Password_Show_Hide_Icon`: an `Input` with an eye at its end (`Input`'s new `trailingAction`) that shows what was typed. The eye is a real button named "Show password" with `aria-pressed`, with a 40 press area; the field is `type="password"` until it is pressed. `visible` / `onVisibleChange` control it from outside.
