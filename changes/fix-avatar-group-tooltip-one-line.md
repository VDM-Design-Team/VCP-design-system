---
bump: patch
---
### `AvatarGroup` — a member's tooltip stays on one line (November 2026)

With a domain, "Eve Kestrel (Development) — Assignee" was wider than the 256 tooltip, so "— Assignee" wrapped under
the name (the AV table's Members column). The tooltips are now `wide` (384), and the role never breaks away from its
dash: a name too long even for that moves "— Assignee" down whole. The `+N` chip's list gets the same.
