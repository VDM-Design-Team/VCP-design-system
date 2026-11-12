# AVListPage *(pattern)*

The main content of a page that lists Added Values: the title, an optional strip of totals, and the table with its filters. It goes inside `AppShell`, which draws the
sidebar, the top bar and the footer.

Built to Figma's list pages in Pages & Flows: **My Values**, **Assigned**, **Drafts**, **Manage Added Value** and the **Archive** tabs (Completed, Rejected, Backlogged).

## Composed of

| Piece | Tier |
|---|---|
| `MyValuesStats` | component |
| `PageTitle` | component |
| `TableEmpty` | component |
| `AvTable` (exported as `AVTable`) | pattern |
| `FilterBar` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AVListPage` | A page that is a list of Added Values, with filters |
| `AVTable` on its own | A table of Added Values inside something else (a card, a tab) |
| `PlanningTable` | The Planning list, which is not this table |

## One layout; each page passes what it has

| Page | What the page passes |
|---|---|
| **My Values** | `stats` (the totals strip) and `table.actions` (the ⋯ column) |
| **Assigned** | The title "Assigned Values" and the table. In the Development domain, also a `cycle` filter (below) |
| **Drafts** | `table.selectable` (the checkbox column) |
| **Manage Added Value** | `filters` with the Assignee and Initiator fields (`users`). In the Development domain, also a `cycle` filter (below) |
| **Archive** | The titles "Archived Values: Completed", "Archived Values: Rejected" and "Archived Values: Backlogged", and `filters` with **Priority, Tags and Date** only (each tab holds one status, so no Status filter). Only the status the rows carry changes |

The page names itself in `title` ("My Values", "Assigned Values", "Archived Values: Completed"…): Figma's frames all say the placeholder "Page Title".

## The Development domain's cycle filter

In the Development domain, **Manage** and **Assigned** also filter by cycle: pass `filters.cycle` (`FilterBar`'s own, a one-pick search of cycles) and set its `value` to the **current cycle**, so the page opens on it and nobody has to
pick it. It stays a normal filter: the person can change it, and what **Reset** does is the page's (`onReset`), so it can put the cycle back on the current one. Other domains and the other pages do not pass it.

## The filters are inside the table's card

The search, **Reset** and the **Filters** button, then the field row the button opens (Priority, Tags, Status, Date, and Assignee and Initiator on Manage), all sit **inside the table's
card, above the rows**: `TableCard`'s rule, as `AccountsTable` and `TaskLogTrail` do. Figma draws them on the grey canvas above the card; the system puts them in it so every table reads
the same. Pass them as `filters` (a `FilterBar`'s props); leave it out and the table has none.

## An empty table says why

With no rows the table is `TableEmpty`: "No added values yet." or, while a search is typed, "No added values match “…”." with a **Reset**. That Reset puts the filters back and then goes away,
so focus is handed to the search box, which stays. Pass `table.empty` for other words.

## It is controlled and holds no data

The page owns the rows, the sort, the page, the search, the selection and whether the filters are open; this puts them in order, 16 apart and 32 in from the sides.

```tsx
<AVListPage
  title="My Values"
  stats={{ user, total: 65, completed: 47, segments }}
  filters={{ search, onSearchChange, onReset, priority, tags, status, period }}
  table={{ rows, sort, onSortChange, page, pageCount, onPageChange, actions: (row) => <RowMenu row={row} /> }}
/>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | The page's `h1` |
| `stats` | `MyValuesStatsProps` | — | The totals strip. Only My Values has one |
| `filters` | `FilterBarProps` | — | In the table's card. Leave out: no filters |
| `table` | `Omit<AVTableProps, 'filters'>` | required | The rows and everything `AVTable` takes |

## Not here yet

- **Bulk actions** (the bar that appears when rows are selected on Drafts and Manage) are `BulkActionBar` in #279, still in review. Once it is in `main`, this takes it and shows it above the pager.
- Figma's My Values frame draws an **ID** column; `AVTable` keeps the reference with the title, as on every other page.
- The **Archive Backlog** frame draws the search, Reset and Filters mirrored left to right. That is a Figma slip and is not copied.

## Accessibility

- One `h1`, from `PageTitle`. The strip is a named region ("My Values statistics"); the table has a caption.
- Tab order is the page's order: the filters, then the table. The empty-state Reset hands focus to the search box instead of dropping it.
- Each piece keeps its own keyboard behaviour (the filter fields, sorting, the row checkboxes).

## Don't

- Don't draw the filters outside the table's card: `TableCard` puts them inside.
- Don't pass role logic here: leave out what a page does not have.
- Don't hide the title: every list page names itself.
