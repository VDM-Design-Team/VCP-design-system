---
bump: minor
---
### `GanttChart` — new pattern; `GanttTooltip` — new component; `Tooltip` `followPointer`; `SearchSelect` `inline`; `Icon` `link-simple-horizontal` (October 2026)

**`GanttChart`** is the Gantt pattern: each Added Value a bar from start to due date,
against people down the side and time across the top, in three views (one cycle by the
day, a month by the day, a year by the cycle). It takes flat `tasks`, `users` (with their
WIP, planned and availability figures), `projects` and `cycles`, and lays them out as the
page design does: one row per user or, with projects selected, a header per project with
the people who have tasks in it. It has a Today column, a legend built from `LegendItem`,
a `GanttTooltip` on every bar, open and closed rows (a closed row draws a summary bar, an
open one packs tasks onto shared lines), and the view, period and filters as controlled
props. The filters are the new `SearchSelect` (`multiple`, avatars for users) and Reset
Filters is the filter bar's own button. Status colours are the accessible `filled` tones,
with `accent.blue.medium` standing in for Pre-Delivered until a cyan token exists.

Beyond the design, for approval: the period bar's middle is a quick pick (the filter bar's
cycle field in Cycle view, a list of years in Year view, a month calendar in Month view);
a Today button returns to today and scrolls its column into view; the month/cycle and day
headings stay at the top of the screen as the page scrolls; a person's figures slide open
and shut (not under reduced motion); and on a phone held upright (under 30rem) the name
column becomes a header above each row. A blue line under the headings marks where the
Added Values are. A `loading` state keeps the header, Today column and legend and swaps the
rows for `Skeleton` placeholders, announced as busy.

**`GanttTooltip`** is the card a Gantt bar shows on hover or focus: the work item's title
with a link glyph, then label/value lines (Status, Initiator, Est. Due Date). It is `Tooltip`
with the content filled in, so hover and focus, `aria-describedby` and Escape come from
`Tooltip`; the title truncates so every card is one width and the lines are a description list.

**`Tooltip`** gains `followPointer`: the bubble opens under the pointer, kept inside the
viewport, for a trigger far wider than the bubble. `GanttTooltip` uses it. Off by default;
nothing changes for existing tooltips.

**`SearchSelect`** gains `inline`: the button drawn as plain text in a bar, without the
bordered field (the panel is unchanged), for a picker inside another control's toolbar. Off
by default; nothing changes for existing fields.

**`Icon`** gains the Phosphor `link-simple-horizontal` glyph (regular and fill), which the
card's title row uses.

No new tokens.
