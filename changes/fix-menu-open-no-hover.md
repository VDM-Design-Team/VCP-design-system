---
bump: patch
---
### `Menu` — opening with a pointer no longer highlights the first item (October 2026)

Opening a `Menu` moves focus to its first item, and the item highlight rode plain `:focus`,
so the first item looked hovered the moment a mouse opened the menu. The highlight now rides
`:hover` and `:focus-visible`: a pointer-opened menu is clean; a keyboard-opened one (or any
arrow-key move) still highlights the focused item, with the focus ring on top. Danger items
likewise. Focus still moves into the list on open; only how it is drawn changes. No API change.
