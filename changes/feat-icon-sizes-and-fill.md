---
bump: minor
---
### `Icon` — nine sizes, and a fill for every glyph (October 2026)

- **Sizes:** `size` takes 10, 12, 16, 20, 24, 28, 32, 40 or 48 — the sizes Figma draws every icon at — instead of only
  `sm` / `md` / `lg`. Those three still work as 16 / 20 / 24 (default stays `md`, 20). Exports `ICON_SIZES`, `IconSize`.
  The glyph already sits centred with a margin from the edges (Phosphor's own 256 artboard), at every size.
- **Regular and fill:** every glyph now ships both. 83 `-fill` glyphs added from Phosphor, plus `check-square` (it had
  only a fill), `caret-triple-up-fill` (built like the regular) and `smiley-plus-fill` (Figma, node 3605:1853). Still without
  a fill: the in-house `assigned-value` and `rectangle-stack`, which Figma doesn't draw filled. `rectangle-group-fill` comes from Figma
  (node 3129:61076).
- **Figma's own glyphs override Phosphor's** for `user`, `user-check`, `user-plus`, `user-minus`, `user-sound`, `users`,
  `users-three` and `fire` (Regular and Fill). Same names, redrawn shapes; `user-plus`, `user-minus` and `user-sound` are new.
