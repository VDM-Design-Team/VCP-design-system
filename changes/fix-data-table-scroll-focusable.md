---
bump: patch
---
### `DataTable`: a text-only table that scrolls sideways is reachable by keyboard (November 2026)

A table wider than its container scrolls sideways; when it had no control in it (no link, button or sortable header) there was nothing to tab to and the hidden columns could not be reached from the keyboard — the accessibility check for a scrollable region failed it. The scroller now takes a tab stop, named by the `caption`, but only while it actually scrolls and has no control inside, so tables with controls or that fit add no stop. `HorizontalScrollTextOnly` holds it.
