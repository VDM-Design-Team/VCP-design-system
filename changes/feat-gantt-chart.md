---
bump: minor
---
### `GanttTooltip` — new component; `Icon` gains `link-simple-horizontal` (October 2026)

`GanttTooltip` is the card a Gantt bar shows on hover or focus: the work item's
title with a link glyph, then label/value lines (Status, Initiator, Est. Due
Date). It is `Tooltip` with the content filled in, so the hover and focus
behaviour, `aria-describedby` and Escape all come from `Tooltip`; the title
truncates so every card is one width and the lines are a description list.

`Icon` gains the Phosphor `link-simple-horizontal` glyph (regular and fill),
which the card's title row uses. No new tokens.
