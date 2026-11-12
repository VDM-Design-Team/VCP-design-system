# PlanningPage *(pattern)*

The main content of the Planning page: the title, the filter row, the Cycle and Backlog sections, and the pages beneath. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer.

Built to Figma's `Planning Page` in Pages & Flows (the `Planning List`, with its inline-editing and drag-from-Backlog flows).

## Composed of

| Piece | Tier |
|---|---|
| `Pagination` | atom |
| `PageTitle` | component |
| `PlanningFilters` | pattern |
| `PlanningTable` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `PlanningPage` | The whole Planning page |
| `PlanningTable` on its own | The sections inside something else |
| `AVListPage` | The other lists of Added Values (My Values, Assigned, Drafts, Manage, Archive) |

## One layout; typed sections

A section shows only when it is passed (the same as `AVListPage` and `DashboardPage`):

| Section | Prop | Notes |
|---|---|---|
| Title | `title` | The `h1`. Defaults to "Planning List", Figma's |
| Filters | `filters` | `PlanningFilters`' props: the search, status and priority, Reset and View Cycle. Leave it out and there are none |
| Sections | `table` (required) | `PlanningTable`'s props: the Cycle and Backlog sections |
| Pages | `pagination` | `Pagination`'s props. Leave it out and there are none |

## Where things sit

- **The filters are on the canvas above the sections**, not in a card, as Figma draws them: each Cycle and the Backlog is its own card, so there is no one card to put them in. (This differs from `AVListPage`, whose one table card holds its filters.)
- **The pagination is under the last section, on the right**, as Figma draws it.
- The column is **16 apart and 32 in from the sides**.

## What the page does

It is **controlled and holds no data.** The page owns the sections and their rows, the filters, the sort and the page, and narrows the rows by the filters itself.

Everything the table does stays the table's: editing a date or points in place (and what that does to the other dates), the drag from the Backlog or the Actions menu's **Move to Cycle** submenu, the sort, folding the sections. In the design a Backlog row dropped on a Cycle opens *Add Required Details* (`MoveAVToCycleModal`); the move happens when that is confirmed, and is the page's. See `docs/planning-table.md`.

## The animated cells

Figma's `Animation of Cells Flow`: when a date is calculated for the person (a Backlog row dropped on a Cycle gets estimated dates), the cell highlights, up to **three** times, and stops sooner if the pointer enters it. It **does not return**, even after a refresh, leaving and coming back, or filtering.

This is built, and it is `PlanningTable`'s: the sweep, the three loops, the stop on hover and focus, reduced motion, and ignoring a flag that was already set when the table first drew. The page's part is two things:

1. **Set it when the calculation happens.** In `onMoveRow`, give the calculated dates `estimated: true` and `animated: true`.
2. **Clear it when it is seen.** Pass `table.onAnimationDismiss` and set that date's `animated` to `false`.

Never keep the flag in anything that survives a reload (a stored filter, the URL, the server's data): it is a one-shot signal, not a state. The `BacklogRowMovedToACycle` story (drag the row yourself) shows the page's side; the table's own `AnimatedDates` and `AnimatedDatesBehaviour` stories show the behaviour. See `docs/planning-table.md`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `Planning List` | The `h1` |
| `filters` | `PlanningFiltersProps` | — | See `docs/planning-filters.md` |
| `table` | `PlanningTableProps` | required | See `docs/planning-table.md` |
| `pagination` | `PaginationProps` | — | `page`, `pageCount`, `onChange`, and `itemCount`, `pageSize`, `pageSizeOptions`, `onPageSizeChange` for the range and the Items select |
| `className`, rest | | | On the wrapping `div` |

## Accessibility

- The title is the page's one `h1`. The filter row is a `search` landmark named "Filter the planning list"; the pagination is a named navigation.
- Everything else is `PlanningFilters`', `PlanningTable`'s and `Pagination`'s own: named fields, the table's keyboard path for moving a row, and the one-shot date animation that respects reduced motion.

## Don't

- **Don't put the filters in a card.** They sit on the canvas above the sections, as Figma draws them.
- **Don't lay the page out again in the app.** Pass the props; the spacing is here.
- **Don't open the move dialog from the page's layout.** The table reports the move; the page opens *Add Required Details*.
