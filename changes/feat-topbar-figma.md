---
bump: minor
---
### `TopBar` / `Toggle` — a toggle for the primary action, the divider, the bell, and a sun and moon switch (October 2026)

`TopBar` gains `showPrimaryAction` (default `true`): `false` hides the action and the bar takes the logo variant. A vertical divider now sits between the bell and the mode and user group. The bell is neutral instead of brand blue, with a 12px critical dot (it was 8) and a slow pulse that reduced motion removes. `Toggle` gains `knobIcons`, a glyph in the knob for each state, and the mode switch uses it for the sun (light) and moon (dark). Adds the `sun`, `sun-fill`, `moon` and `moon-fill` glyphs.
