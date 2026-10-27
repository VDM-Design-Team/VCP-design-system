---
bump: minor
---
### `GanttChart` — new pattern; `GanttTooltip` — new component; `Icon` gains `link-simple-horizontal` (October 2026)

`GanttTooltip` is the card a Gantt bar shows on hover or focus: the work item's
title with a link glyph, then label/value lines (Status, Initiator, Est. Due
Date). It is `Tooltip` with the content filled in, so the hover and focus
behaviour, `aria-describedby` and Escape all come from `Tooltip`; the title
truncates so every card is one width and the lines are a description list.

`Icon` gains the Phosphor `link-simple-horizontal` glyph (regular and fill),
which the card's title row uses. No new tokens.

`GanttChart` is the Gantt pattern: people or projects down the side, time across
the top, each Added Value a bar from start to due date, in three views (one cycle
by the day, a month by the day, a year by the cycle). It has a Today column, a
legend built from `LegendItem`, a `GanttTooltip` on every bar, open and closed
rows (a closed row draws a summary bar), and the filters as controlled props —
the caller owns the rows, the view, the period and the filter values. Status
colours are the accessible `filled` tones, with `accent.blue.medium` standing in
for Pre-Delivered until a cyan token exists. No new tokens.
