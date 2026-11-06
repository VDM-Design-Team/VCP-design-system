---
bump: patch
---
### `RemoveButton`: `plain` is not offered on a filled brand surface (November 2026)

The bare red ✕ on the brand blue is about 1.3:1, well under the 3:1 a graphic needs (WCAG 1.4.11). `plain` is for plain surfaces only; on a filled brand surface use `tonal` (the ✕ on its own disc, 3.91 light / 3.47 dark). The `Surfaces` story no longer draws `plain` on brand, `ContrastHolds` now measures that surface in both themes (tonal passes; the bare ✕ is asserted not to), and the docs say so.
