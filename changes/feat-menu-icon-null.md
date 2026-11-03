---
bump: minor
---
### `Menu` — a danger item can go without a glyph (November 2026)

`MenuActionItem.icon` also takes `null`: a `danger` item then skips its fallback `warning` glyph, for a label that names the act itself ("Delete"). Red and the hidden "destructive action" in its accessible name remain. Default behaviour is unchanged.
