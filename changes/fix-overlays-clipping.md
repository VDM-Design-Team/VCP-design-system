---
bump: minor
---
### `Popover`, `Menu`, `Tooltip`, `SearchSelect` — nothing is cut off at an edge any more (November 2026)

Fix, found by putting each one next to shadcn's in the same tight spot: four floating pieces could be cut off by the container around them or by the screen.

- **`Popover`** floats above the page by default: `strategy` now defaults to `fixed`, so a panel that scrolls, a table or a dialog no longer clips it. While the page scrolls it moves with its trigger and keeps the side it opened on. `strategy="absolute"` keeps the old placement, for the one case `fixed` gets wrong: an ancestor with a CSS `transform` (none of the system's containers has one). This covers everything built on it: `Menu`, `DateField`, `InlineDateEdit`, `EmojiReactionPicker` and `NotificationPopover`.
- **`Menu`** no longer has its last row's list cut off by `DataTable`, and takes Popover's `strategy` as a new prop.
- **`Tooltip`** stays on screen. When its `placement` has no room (a toolbar along the top of the page) it opens on the opposite side, and it slides along the edge so a long tooltip at the right of the screen is not cut off. The side it took is on the positioner as `data-side`.
- **`SearchSelect`**'s list floats above the page and opens above the field when there is no room below, so a field at the foot of the screen or of a dialog shows its whole list. The side is chosen as it opens and kept while you filter; when neither side has room for all of it, the list gets shorter and scrolls.

No visual change where there was room already. Each fix has a story that fails without it: `FloatsOutOfAScrollingPanel`, `FloatsOutOfATable`, `StaysOnScreen`, `OpensAboveNearTheBottom`.
