---
bump: minor
---
### `DropdownStepper` — new component (October 2026)

One choice from an ordered list — previous / next arrows around a `Menu`
dropdown — ported from Figma's `_Dropdown_with_Stepper`. Controlled or
uncontrolled, `wrap` for cycles, disabled options skipped by the arrows, `sm`/`md`
= 32/40, a polite live region for every change. Composed of `Icon` and `Menu`; no
new tokens.

`invalid` and an optional `error` caption are included: critical border, and a
`role="alert"` caption tied to the dropdown with `aria-describedby`.
