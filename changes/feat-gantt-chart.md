---
bump: minor
---
### `GanttChart` — new pattern; `GanttTooltip` — new component; `Icon` gains `link-simple-horizontal` (October 2026)

`GanttTooltip` is the card a Gantt bar shows on hover or focus: the work item's
title with a link glyph, then label/value lines (Status, Initiator, Est. Due
Date). It is `Tooltip` with the content filled in, so the hover and focus
behaviour, `aria-describedby` and Escape all come from `Tooltip`; the title
truncates so every card is one width and the lines are a description list.

`Tooltip` gains `followPointer`: the bubble opens under the pointer, kept inside the viewport, for a trigger far wider than the bubble. `GanttTooltip` uses it, so a bar's card is always on screen. Nothing changes for existing tooltips.

`Icon` gains the Phosphor `link-simple-horizontal` glyph (regular and fill),
which the card's title row uses. The period label opens a `DatePicker` (a day, or a month) to jump anywhere; a Today button returns to today and scrolls its column into view; folding and opening rows animates, except under reduced motion. It has a `loading` state: the header, Today column and legend stay and the rows become `Skeleton` placeholders, announced as busy. No new tokens.

`GanttChart` is the Gantt pattern: each Added Value a bar from start to due date,
against people down the side and time across the top, in three views (one cycle by
the day, a month by the day, a year by the cycle). It takes flat `tasks`, `users`
(with their WIP, planned and availability figures), `projects` and `cycles`, and
lays them out as the page design does: one row per user, or — with projects
selected — a header per project with the people who have tasks in it. It has a
Today column, a legend built from `LegendItem`, a `GanttTooltip` on every bar, open
and closed rows (a closed row draws a summary bar, an open one packs tasks onto
shared lines), and the view, period and filters as controlled props. The filters are the new `SearchSelect`
(`multiple`, avatars for users) and Reset Filters is the filter bar's own button. Status colours are the accessible `filled`
tones, with `accent.blue.medium` standing in for Pre-Delivered until a cyan token
exists. It has a `loading` state: the header, Today column and legend stay and the rows become `Skeleton` placeholders, announced as busy. No new tokens.
