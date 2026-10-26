---
bump: minor
---
### `TopBar` / `Toggle` — a switch for the left side, the divider, the bell, and a sun and moon switch (October 2026)

`TopBar` gains `showLeftSide` (default `true`): `false` leaves the left side empty (no action, no logo), for screens like the AV editor that show nothing there. A vertical divider now sits between the bell and the mode and user group. The bell is neutral instead of brand blue, with a 10px dot (it was 8) in `accent.critical.filled.surface.default`. A halo pulses behind it three times, 1.5s each, when the unread count changes, then stops; reduced motion removes it. `Toggle` gains `knobIcons`, a glyph in the knob for each state, and the mode switch uses it for the sun (light) and moon (dark). Adds the `sun`, `sun-fill`, `moon` and `moon-fill` glyphs.

The user chip had 4px of padding all round, and its caret drew 7px from the right edge while the avatar sat 4px from the left. The chip now has 8px left and right (4 top and bottom), and the caret's box is pulled 3px into the padding, so both sides measure 8. The mode switch and the user chip are now one group with an 8px gap between them (the bar's other gaps are 16).
