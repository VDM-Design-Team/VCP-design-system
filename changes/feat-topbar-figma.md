---
bump: minor
---
### `TopBar` / `Toggle` — a toggle for the primary action, the divider, the bell, and a sun and moon switch (October 2026)

`TopBar` gains `showPrimaryAction` (default `true`): `false` leaves the left side empty (action and logo), for screens like the AV editor that show nothing there. A vertical divider now sits between the bell and the mode and user group. The bell is neutral instead of brand blue, with a 10px critical dot (it was 8) and a slow pulse, on a 2.5s cycle, that reduced motion removes. `Toggle` gains `knobIcons`, a glyph in the knob for each state, and the mode switch uses it for the sun (light) and moon (dark). Adds the `sun`, `sun-fill`, `moon` and `moon-fill` glyphs.
