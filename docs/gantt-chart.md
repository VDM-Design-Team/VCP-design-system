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
| `GanttTooltip` | component |
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
| `title`, `infoText` | `string` | The heading, and the (i) beside it with its tooltip |

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
- **Project groups** open and fold from their header, and start open.
- **Today** is a hatched column through the header and every row, labelled, and
  scrolled into view when the period changes.
- **Scrolling sideways** cuts the dates and bars off at the edge of the name column;
  they never slide under the empty corner above it.
- **Tooltips** are `GanttTooltip`: the first row's open below its bar, the rest
  above. They are positioned statically, so a bar far wider than the screen puts
  its card at the bar's middle.

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
