# GanttChart

People (or projects) down the side, time across the top, and each Added Value
drawn as a bar from its start to its due date. Three views of the same data — one
cycle by the day, a month by the day, a year by the cycle — with a Today column,
a legend, a tooltip on every bar, and open/closed rows.

It draws what it is given. **The caller owns the data and the filters**: `rows`
is rendered as passed, and the view, the period on screen and every filter are
controlled props the chart only reports changes to. It never fetches, sorts or
filters.

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

## Props

| Prop | Type | Notes |
|---|---|---|
| `view`, `onViewChange` | `'cycle' \| 'month' \| 'year'` | Controlled. The view menu calls `onViewChange` |
| `date`, `onDateChange` | `YYYY-MM-DD` | Any day inside the period on screen. The navigator's arrows call `onDateChange` with the day to move to |
| `cycles` | `GanttCycle[]` | `{ id, label, short?, start, end }`. A cycle is the company's delivery period, so it is passed in. The cycle view shows one; the month view names them over the days; the year view makes one column of each |
| `today` | `YYYY-MM-DD` | Which column is Today. Defaults to the system date; pass it for a stable chart or story |
| `rows` | `GanttRow[]` | `{ id, name, kind?, badge?, stats?, bars }`. `kind="project"` puts the row on the quiet surface with a count badge |
| `rows[].bars` | `GanttBar[]` | `{ id, title, status, start, end, points?, project?, details?, href? }` |
| `rows[].stats` | `GanttStat[]` | The panel under the name while a person is open: `{ label, value, tone? }` |
| `expandedIds`, `defaultExpandedIds`, `onExpandedChange` | `string[]` | Which rows are open. Controlled or not |
| `projectOptions`, `projectIds`, `onProjectIdsChange` | | The projects filter, a multi-select. It appears when `projectOptions` is given |
| `userOptions`, `userIds`, `onUserIdsChange` | | The users filter, likewise |
| `onResetFilters` | `() => void` | Shows "Reset Filters" |
| `onBarSelect` | `(bar) => void` | A bar without an `href` was activated |
| `title`, `infoText` | `string` | The heading, and the (i) beside it with its tooltip |

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

- **A closed row** draws one summary bar — how many Added Values, how many
  points, over what span. **An open row** draws each bar on its own line.
- **A bar one column wide** has no room for words, so it keeps its points only.
- **Today** is a hatched column through the header and every row, labelled, and
  scrolled into view when the period changes.
- **Bars outside the period** are not drawn; a bar that runs past its edge is cut
  at it.
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

- **Don't filter or sort inside the chart.** Pass the rows you want shown.
- **Don't invent a status colour.** Add a status here, with its token.
- **Don't put the only copy of a fact in the tooltip.** Touch users never see it.
- **Don't use it for a handful of dates** — a list or a timeline is simpler.
