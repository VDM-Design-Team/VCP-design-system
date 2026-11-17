---
bump: patch
---
### `AvatarGroup`, `Avatar` — Figma's overlap and a 1 border inside the circle (November 2026)

A stack's circles overlapped by 4 / 6 / 8 / 9 at 16 / 24 / 32 / 36 and each wore a 2 `surface.elevated` ring outside its box. Figma's `Profile_Initials` "Multiple Users" (the pill the AV table's Members column uses) overlaps them by 2 / 4 / 6 / 8 and draws a 1 white stroke *inside* each circle. The overlap is now Figma's, and `Avatar`'s `ring` is a 1 `border` inside the box (so the circle is still exactly its size, and a photo shrinks to fit inside the border); the `+N` chip has the same border. A two-person stack is now 30 / 44 / 58 / 64 wide, as Figma's are, and a story checks it. The three larger sizes (`xl`, `2xl`, `3xl`) take about a fifth of the diameter; Figma draws no stack there. In every stack the gap between circles is narrower and the border thinner than before.
