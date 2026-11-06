---
bump: patch
---
### `StatusHistory`: the count can no longer disagree with the entries (November 2026)

The "(3)" after the title was a separate `count` prop, so it could say a different number from the log under it (the dark story read "(2)" over one entry). With `entries` given the count is now the entries' — `count` is ignored — and `count` stays for a log whose entries are in `children`. The stories pass a wrong `count` on purpose to show it.
