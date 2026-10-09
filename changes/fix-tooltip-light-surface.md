---
bump: patch
---
### `Tooltip` — a light card, as Figma draws it (October 2026)

The bubble was a dark inverted surface (`surface.neutral.stronger` + `text.inverted.primary`) — the original export's look, carried over when the component was rebuilt on tokens. Figma
draws a light bubble, and our own figma-audit note ("dark-on-light per the design … consistent with what we ship") had it backwards. It is now `surface.elevated` with `text.primary`, a
1px `stroke.default` edge, the menu shadow and 12 / 8 of padding (sides / top and bottom; was 10 / 6) — the `Popover` / `Menu` / `Toast` family. It flips with the theme like them (white in light, `#1e293b` in
dark): 20.17:1 / 14.63:1. Every tooltip in the system changes (column hints, the StatCard hint, the sidebar, the emoji picker). No API change.
