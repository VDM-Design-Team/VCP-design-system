---
bump: patch
---
### `ProgressBar` — the unfilled track shows in dark on a card (November 2026)

`surface.track` equals `surface.elevated` in dark, so the empty part of a bar (and of `PasswordStrength`) vanished on a card. The track now has an inset `stroke.subtle` hairline; fills and their contrast are unchanged.
