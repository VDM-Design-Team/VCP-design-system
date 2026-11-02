---
bump: patch
---
### `action.primary` (dark) — hover and pressed get lighter, not darker (November 2026)

In dark, the primary action's label is near-black, but its fill got darker on hover and press, so the label fell to 3.26:1 hovered and 2.23:1 pressed, under the 4.5:1 text rule. The dark `action.primary.surface` states now step lighter, as every dark `accent.*.filled` fill already does: hover `vcp-blue.300` (was `.500`), pressed `vcp-blue.200` (was `.600`), and selected follows hover to `vcp-blue.300`. The label now reads 8.73:1 hovered and 13.69:1 pressed. Everything on these tokens changes with it in dark: primary `Button` and `IconButton`, a checked `Checkbox` and a switched-on `Toggle` when hovered or pressed, the selected `RadioGroup` ring when hovered, and `Field`'s "+" button. Their hover fills and rings also now clear 3:1 against the page (were 2.37:1 on `surface.base`). Light is unchanged. No API change.
