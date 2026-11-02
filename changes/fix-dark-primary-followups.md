---
bump: patch
---
### `Tag`'s filled brand ✕ shows its pressed fill (November 2026)

Fix: since the dark `action.primary` pressed fill now gets lighter, a filled brand tag's ✕ takes `action.primary.surface.pressed` when pressed, like every other filled tone, instead of holding its hover fill. The Button story *Filled text contrast, both themes* now fills the page, so its dark half no longer stops short under the buttons. No API change.
