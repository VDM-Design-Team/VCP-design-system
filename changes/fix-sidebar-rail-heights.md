---
bump: patch
---
### `Sidebar` — the bottom row keeps a gap above it (October 2026)

Design review: "Report a problem" is pinned to the bottom of the rail, but in a rail with no
room to spare it sat straight under the last nav item and read as one of them. It now keeps
at least 32 above it (`mt-8`); a rail with room to spare is unchanged. The Every User Type
and Both Widths stories are sized to their rails' content instead of the window, so a short
preview no longer pushes items out past the rail's border. No API change.
