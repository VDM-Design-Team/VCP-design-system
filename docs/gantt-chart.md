# GanttChart

Each Added Value drawn as a bar from its start to its due date, against people
down the side and time across the top. Three views of the same data — one cycle by
the day, a month by the day, a year by the cycle — with a Today column, a legend, a
tooltip on every bar, and rows that open to show their bars.

It takes the data the way a backend sends it: flat `tasks`, the `users` with their
availability figures, the `projects` and the `cycles`. It does the one thing the
page design dictates — the layout below — and never fetches, pages or sorts.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | sub-atomic |
| `IconButton` | atom |
| `LegendItem` | atom |
| `Select` | atom |
| `Skeleton` | atom |
| `DatePicker` | component |
| `GanttTooltip` | component |
| `Menu` | component |
| `Popover` | component |
| `SearchSelect` | component |
| `Tooltip` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `GanttChart` | Showing who is doing what over time, with due dates, across a team or a set of projects |
| `ProgressBar` / `DonutChart` | How much of one known whole is used or done |
| `AVTable` | A sortable list of Added Values, when *when* matters less than *what* |

## The data

```ts
tasks:    { id, title, userId, projectId, status, statusLabel?, initiator?,
            points, start, end, href? }[]          // dates are YYYY-MM-DD, end inclusive
users:    { id, name, wip?, planned?, ead?, eadTd? }[]
projects: { id, name }[]
cycles:   { id, label, short?, start, end }[]      // "Cycle 44" / "C44", a fortnight each
```

- **`status`** is the bar's colour and legend entry (see below). **`statusLabel`**
  is the Added Value's own workflow status — "AB Testing", "Ready for Deploy" —
  which the tooltip prints as "Status".
- **A user's figures** fill the panel under their name when their row is open:
  `wip` and `planned` are counts, `ead` is the earliest date they are available
  (printed `dd.mm`), `eadTd` the days until then. Each line shows only if given.
- **A cycle is the company's delivery period**, not something the calendar gives, so
  `cycles` is an input. Dates are whole days in UTC, so a time zone never moves a
  bar by a column. A cycle belongs to the year it starts in.

## What it shows

| Filters | Rows |
|---|---|
| None | One row per user, in the order given, with their tasks from every project |
| Projects | One group per selected project — a header with its count and points, and under it only the people who have tasks in it, showing only that project's tasks. The same person can sit under two projects |
| Users | Only those people, in whichever layout the row above gives |

Only tasks inside the period are drawn; a task that runs past the edge is cut at it.
A project with nothing in the period keeps its header.

## Props

| Prop | Type | Notes |
|---|---|---|
| `tasks`, `users`, `projects`, `cycles` | | The data above |
| `view`, `onViewChange` | `'cycle' \| 'month' \| 'year'` | Controlled. The view menu calls `onViewChange` |
| `date`, `onDateChange` | `YYYY-MM-DD` | Any day inside the period on screen. The navigator's arrows call `onDateChange` with the day to move to |
| `today` | `YYYY-MM-DD` | Which column is Today. Defaults to the system date; pass it for a stable chart or story |
| `projectIds`, `onProjectIdsChange` | `string[]` | The selected projects. Empty means all |
| `userIds`, `onUserIdsChange` | `string[]` | The selected users. Empty means all |
| `expandedIds`, `defaultExpandedIds`, `onExpandedChange` | `string[]` | Which user rows are open, controlled or not. A row's id is the user's id, or `projectId:userId` under a project |
| `onTaskSelect` | `(task) => void` | A task without an `href` was activated |
| `loading` | `boolean` | The data is on its way: the rows become placeholders and the filters switch off. See Loading below |
| `title`, `infoText` | `string` | The heading, and the (i) beside it with its tooltip. Use `infoText` to say how to read the chart: what a bar is, what a closed row shows, how project grouping works, what the hatched column is |

**The filters** are `SearchSelect` with `multiple`, as the filter bar draws them: the
field shows "3 selected", the panel has the search and the rows (people with avatars
for Users). **Reset Filters** is the filter bar's own Reset — `Button
variant="tertiary"` — and clears both the projects and the users. It leaves the view
and the period alone.

### Statuses

`planned`, `in-progress`, `pre-delivered`, `completed`, `overdue`. The mapping from
a status to a colour lives in this pattern, once, and drives both the bar and its
legend entry:

| Status | Colour | Text on it |
|---|---|---|
| Planned | `surface.brand.strong` | `text.inverted.primary` |
| Work In Progress | `accent.warning.filled` | its filled content |
| Pre-Delivered | `accent.blue.medium` | `text.primary` |
| Completed | `accent.success.filled` | its filled content |
| Overdue | `accent.critical.filled` | its filled content |

## Behaviour

- **A closed row** draws one summary bar — how many Added Values, how many points,
  over what span. **An open row** draws each task, and tasks that do not overlap
  share a line; only genuinely concurrent ones stack.
- **A task one column wide** has no room for words, so it keeps its points only.
- **Project groups** open and fold from their header, and start open. A person's
  figures slide open and shut (not under reduced motion); their bars and a project's
  people appear and go at once, out of the layout and out of reach of the pointer,
  keyboard and assistive tech when hidden.
- **Getting around.** The arrows step one period. In **Cycle** view the middle of the
  bar is the same cycle field the filter bar has (`SearchSelect`: a search, one pick, each
  row naming the cycle and its dates); in **Year** view the year opens a list of the
  years the cycles cover; in **Month** view the month opens a month calendar
  (`DatePicker`). **Today** returns to the period holding today and scrolls the Today
  column into view; inside that period it just scrolls to it.
- **The blue line** under the headings marks where the Added Values are: it starts at the
  first column any bar starts in and ends at the last column any bar ends in, across every
  row on show, in every view and on a phone too. With no bars in the period there is no line,
  and a bar-free day at either end is left out; the usual grey rule runs the whole width
  under the headings so they are always separated from the rows. An open person's cell has a grey left edge.
- **The headings stay put.** The cycles or months over the days, and the days
  themselves, are held at the top of the screen as the page scrolls, and slide with the
  bars when they scroll sideways, so a row far down is never lost.
- **On a phone held upright** (under 30rem, and only then: everything wider keeps the
  regular layout, name column and all) the name column becomes a header above each
  person's bars: the name and, when open, their figures stacked, as wide as the screen and
  held at the left edge while the bars scroll sideways, with a little space under an open one
  before the bars; project headers stack the same way. The grid lines and the Today column run unbroken behind the name blocks (an open person's block is half-opaque, so the figures stay readable). The dates
  start at the left edge, the period bar (year, month, arrows and the quick pick) spans the
  full width, and the cycle list opens from the bar's left edge so it stays on screen. On a phone the period bar and its labels above (year, month, arrows) are held at the top of the screen too, with the headings just under them.
- **Today** is a hatched column through the header and every row, labelled.
- **The chart starts at its left edge** — scrolled back to the beginning — whenever
  the view, the period or a filter changes.
- **Scrolling sideways** cuts the dates and bars off at the edge of the name column;
  they never slide under the empty corner above it.
- **Tooltips** are `GanttTooltip`: the first row's open below its bar, the rest
  above. The card opens under the cursor, kept inside the screen, so a bar far wider
  than the screen still shows it.

## Loading

`loading` keeps everything that does not depend on the data — the title, the
navigator, the column headings, the Today column and the legend — and swaps the rows
for five placeholder rows (a name and a couple of bars each, built from `Skeleton`).
The filters and Reset are disabled until it ends. The placeholders are hidden from
assistive tech, so the section is marked `aria-busy` and a visually hidden "Loading
Gantt Chart…" status says so; both clear when `loading` is false. Pass `loading` while
the first request is in flight; once it ends, pass the real lists, or empty ones for
the honest "Nothing matches these filters".

## Tokens

No new tokens. Surfaces `surface.elevated`, `surface.neutral.subtle` (project
rows), `surface.brand.faint` / `.subtle` / `.strong` (Today, navigator, rule);
lines `stroke.default`, `stroke.subtle`, `stroke.brand.medium`, `stroke.focused`
(the open-row bar); bars as in the table above; text `text.primary`,
`text.secondary`, `text.tertiary`, `text.brand.medium`. Column and name-column
widths (90 and 164) are measured chart geometry, like `DonutChart`'s size.

## Accessibility

- Every bar is a real `<a>` or `<button>` named with its title, status and dates,
  so it is reachable by keyboard, and its tooltip opens on focus as well as hover.
- Rows open with a button that carries `aria-expanded`.
- The scrolling area is a labelled, focusable region so the keyboard can scroll it.
- Today's heading is `aria-current="date"`; the hatching and the column
  backgrounds are decoration.
- **Colour is never the only signal.** Each bar says what it is in its name and its
  tooltip; the legend is a key, not the source of meaning.
- The accessible `filled` tones keep white text on every bar at 4.7:1 or better
  (`pre-delivered` uses dark text instead), unlike the bright fills Figma draws.

## Don't

- **Don't pre-filter the tasks to fake a layout.** Pass the filters; the chart groups.
- **Don't invent a status colour.** Add a status here, with its token.
- **Don't put the only copy of a fact in the tooltip.** Touch users never see it.
- **Don't use it for a handful of dates** — a list or a timeline is simpler.
