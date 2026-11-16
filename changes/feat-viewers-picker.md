---
bump: minor
---
### `ViewersPicker` — the Edit Viewers picker, and `DetailCard`'s `viewers` (November 2026)

New `ViewersPicker`: the viewers pill (an eye and a count) with the list on hover or focus ("3 Viewers", or "No viewers yet"), and, when the page gives `onAdd` or `onRemove`, a picker on press: a **Search by name** field, the matches who are not viewers yet (press one to add), and the viewers each with a remove button. Built to Figma's `Detail_Card_Edit_Viewers`, its dropdown and its menu item. `DetailCard` gains `viewers`, which draws it in place of the placeholder pill; `viewerCount` and `onViewers` still work and `viewers` wins when both are given. Stories cover the read-only list, nobody viewing, adding and removing (with focus back in the search), and no match. The detail card's docs no longer list Edit Viewers as unbuilt, and now say UI Changes is not wanted and Estimated Duration is undecided.
