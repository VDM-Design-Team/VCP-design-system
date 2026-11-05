# PasswordField

A password input with the eye at its end that shows what you typed. Built to Figma's `_Password_Show_Hide_Icon` (`State=Show` / `State=Hide`)
in the Password settings items.

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |
| `Input` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `PasswordField` | Any field where a password is typed |
| `Input` | Any other single-line text |
| `PasswordStrength` | The meter under a *new* password |

## How it behaves

It is `Input` with its `trailingAction`: the eye is a **real button inside the field's border and ring**, reachable by keyboard, named for what it does. The
field is a password field (`type="password"`, the dots) **until the eye is pressed**, then plain text, and back.

The eye is a **toggle**: its name is always **"Show password"** and **`aria-pressed`** says whether the password is showing — one name, not two, so a screen
reader hears "Show password, pressed" rather than a label that flips under it. The glyph is `eye` while hidden and `eye-slash` while showing.

## Props

It takes everything `Input` does — so `Field` can wire its `id`, `aria-describedby` and `aria-invalid` onto it — except `type`, `trailingIcon` and `trailingAction`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `visible` | `boolean` | — | Whether the password is showing. Controlled; left out, the field keeps its own |
| `onVisibleChange` | `(visible) => void` | — | The eye was pressed |
| `toggleLabel` | `string` | `Show password` | The eye's accessible name |
| `autoComplete` | `string` | — | **Set it**: `new-password` where a new one is chosen, `current-password` where the existing one is entered, so a password manager does the right thing |

## Tokens

`Input`'s, unchanged (`stroke.strong` border, `stroke.focused` ring, 40 high), with an `IconButton` `xs` at the end: 24 glyph button, with a **40 press area**
(its `::after` reaches 8 past it, as `PageTitle`'s does — the field is 40 high, the control inside it need not be). No new tokens.

## Accessibility

- The eye is a real `<button type="button">` named "Show password", `aria-pressed`, in the tab order right after the field; Enter and Space toggle it.
- Its press area is the 40 minimum.
- It does not submit the form it sits in.
- Don't disable `autoComplete`: a field with the wrong value stops a password manager.

## Don't

- **Don't make the eye a `trailingIcon`.** That slot is decoration; this is a control.
- **Don't use it for a field that is not a password.** A hidden-by-default value that is not a secret is a plain `Input`.
- **Don't rename the eye as it toggles.** One name and `aria-pressed`.
