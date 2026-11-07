# TaskLogTrail *(pattern)*

The log of changes made to Added Values: one row per change — **ID**, **Task**, **Change** ("In Progress → Design Review (Status)"), **Source**,
**Changed At** and **Changed By** — with the pages beneath. Built to Figma's `Task_Log_Trail` (`Table`, `Task_Log_Trail_Row`).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Pagination` | atom |
| `Skeleton` | atom |
| `Tag` | atom |
| `DataTable` | component |
| `EmptyState` | component |
| `TableCard` | component |
| `SourceTag` | component |
| `StatusTag` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TaskLogTrail` | The Task Log Trail page's list |
| `Input`, `Select`, `DateField` | The filter row, pieced together in the page and passed as `filters` (see the `WithFilters` story), with one **Reset** |
| `DataTable` | Any other table |

## The columns

| Column | What it is |
|---|---|
| **ID** | The AV's reference, quiet (`text.tertiary`) |
| **Task** | Its title. **At least 40 characters wide** (`min-w-88`), and it **wraps to three lines at most** before it is cut with "…" (the whole text is the hover `title`) |
| **Change** | Old value, an arrow (named "changed to"), new value, then **which field changed, in brackets: "(Status)" or "(Workflow)"**. A value is a `StatusTag` (a spine status or a domain step, "Design Review", each in its own colour), or an **event tag** — **Initial Creation** (the AV was just made, so nothing came before) or **Handoff** — in `Tag`'s neutral grey |
| **Source** | A `SourceTag`. The styling is the same for every source; only the **text inside the tag** changes ("VCP" for now) |
| **Changed At** / **Changed By** | Plain text. **Already formatted** ("Jun 10, 2026 2:37 PM"): this table does not do dates |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `TaskLogRow[]` | required | `id`, `ref`, `task`, `change { from, to, field }`, `source`, `changedAt`, `changedBy`. `from` / `to` are `{ status }`, `{ custom }` (a domain step) or `{ event: 'Initial Creation' \| 'Handoff' }`; `field` is `'Status' \| 'Workflow'` |
| `page` / `pageCount` / `onPageChange` | | required | `Pagination`'s |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | The range readout ("1-50 of 1,250") and Items select |
| `loading` | `boolean` | — | Placeholder rows; headers stay; one status says "Loading the task log trail" |
| `filters` | `ReactNode` | — | The page's filter row, drawn **inside the card above the table** (as `AccountsTable` carries its search). There is no filters pattern |
| `filtered` | `boolean` | — | Filters are on: an empty table says "No changes match these filters." (magnifier, with a hint) instead of "No changes yet." |
| `empty` | `ReactNode` | `EmptyState`, by `filtered` | |
| `caption` | `string` | `Task log trail` | The table's accessible name |

## It does nothing itself

It filters nothing and pages nothing: the page filters and passes the page's rows. **There is no filters pattern, and no separate Filters card**: the filters are one row of the system's own fields (a search `Input`, `Select`s, two `DateField`s) inside the table's card, the way `AccountsTable` and `ContactsTable` carry their search; the `WithFilters` story shows it. Figma draws a separate "Filters" card with a heading, a caption and a dates-only **Clear dates**; the page has the row in the table's card and one **Reset** that clears every filter, like every other filter row in the system.

## Tokens

The card is `surface.elevated`, `radius.md`; the cells have 16 above and below (Figma's), so a three-line task makes a row of about 93 (Figma's 95).

**Open for review.** The trail uses **coloured status tags** (each status in its own colour), which is familiar from the rest of the product and says more than one colour would — but Figma's trail draws them all in one blue, so this is for `creativedesignlead` to confirm. The Initial Creation / Handoff tags and the Workflow field come from the design lead, not from Figma.

**Differences from Figma, on purpose.** Columns use `DataTable`'s own cell padding and header (Figma's cells carry 24 left padding in four columns); the weights follow Figma's grid (1 : 2 : 2.5 : 1 : 1.5 : 1.25).

## Accessibility

- A real `<table>` named by `caption`, with `scope="col"` headers.
- The arrow is named "changed to", so a change reads "In Progress, changed to, Design Review, (Status)".
- Loading: `aria-busy` and one `status`; the skeletons are hidden from assistive tech.

## Don't

- **Don't truncate the task.** The log is read for what changed.
- **Don't format the date here.** Pass "Jun 10, 2026 2:37 PM".
- **Don't filter or page inside it.**
