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
| `SourceTag` | component |
| `StatusTag` | component |
| `TableEmpty` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TaskLogTrail` | The Task Log Trail page's list |
| `FilterBar` | The filter row, passed as `filters` (see the `WithFilters` story): search, the period and one **Reset** |
| `DataTable` | Any other table |

## The columns

| Column | What it is |
|---|---|
| **ID** | The AV's reference, quiet (`text.tertiary`) |
| **Task** | Its title, **in full**. At least 40 characters wide (`min-w-88`); it wraps and nothing cuts it, so there is no hover-only `title` for a keyboard to miss |
| **Change** | Old value, an arrow (named "changed to"), new value, then **which field changed, in brackets**: "(Status)", "(Workflow)", "(Assignee)", "(Start Date)" or "(Due Date)". **The new value is the coloured one**: a status is a `StatusTag` (the owner of the status mapping: a spine status or a domain step like "Design Review", each in its own colour). **The old value is a quiet grey `Tag`**, as `StatusHistory` draws it, and so are the events that stand in for a first value, **Initial Creation** (the AV was just made) and **Handoff**. An assignee is a name; a date is ISO, shown dd/mm/yyyy (or the person's locale's order) |
| **Source** | A `SourceTag`. The styling is the same for every source; only the **text inside the tag** changes ("VCP" for now) |
| **Changed At** | An ISO date and time, shown **"10/06/2026 14:37"**: dd/mm/yyyy (or the person's locale's order), then a 24-hour time, from `useDateFormat().dateTime`, in a `<time>`. The one date-and-time formatter in `lib/format-date` |
| **Changed By** | Plain text |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `TaskLogRow[]` | required | `id`, `ref`, `task`, `change { from, to, field }`, `source`, `changedAt` (ISO date and time), `changedBy`. `to` is `{ status }`, `{ custom }` (a domain step), `{ person }` (an assignee) or `{ date }` (ISO); `from` is any of those, or `{ event: 'Initial Creation' \| 'Handoff' }` when there was no value before; `field` is `'Status' \| 'Workflow' \| 'Assignee' \| 'Start Date' \| 'Due Date'` |
| `page` / `pageCount` / `onPageChange` | | required | `Pagination`'s |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | The range readout ("1-50 of 1,250") and Items select |
| `loading` | `boolean` | — | Placeholder rows; headers stay; one status says "Loading the task log trail" |
| `filters` | `ReactNode` | — | The page's `FilterBar`, drawn **inside the card above the table** (as `AccountsTable` carries its search) |
| `filtered` | `boolean` | — | Filters are on: an empty table says "No changes match these filters." (magnifier, with a hint) instead of "No changes yet." |
| `empty` | `ReactNode` | `TableEmpty`, by `filtered` | |
| `caption` | `string` | `Task log trail` | The table's accessible name |

## It does nothing itself

It filters nothing and pages nothing: the page filters and passes the page's rows. **The filters are the system's `FilterBar`** (search, the period, **Reset**), with one `Select` among its fields for which field changed (Status, Workflow, Assignee, Start Date or Due Date), labelled **Change** above it and on the lighter filter edge like the bar's own fields (a `Field` around a `Select edge="neutral"`, passed as the bar's `children`), inside the table's card, the way `AccountsTable` and `ContactsTable` carry their search; the `WithFilters` story shows it. Figma draws a separate "Filters" card with a heading, a caption and a dates-only **Clear dates**; the page has the bar in the table's card and one **Reset**, `FilterBar`'s, that clears every filter, like every other filter row in the system. **There is no Source filter**: every change is from VCP (no Jira), so it would have one option.

## Tokens

The card is `surface.elevated`, `radius.md`; the cells have 16 above and below (Figma's), so a three-line task makes a row of about 93 (Figma's 95).

**Decided by design.** The new status is coloured and the old one is grey, matching `StatusHistory` (one owner per mapping: `StatusTag`). Initial Creation and Handoff are on the grey, old side. The fields are Status, Workflow, Assignee and the two dates; the source is VCP only. These come from the design lead, not from Figma, whose trail draws every status in one blue.

**Differences from Figma, on purpose.** Columns use `DataTable`'s own cell padding and header (Figma's cells carry 24 left padding in four columns); the weights follow Figma's grid (1 : 2 : 2.5 : 1 : 1.5 : 1.25).

## Accessibility

- A real `<table>` named by `caption`, with `scope="col"` headers.
- The arrow is named "changed to", so a change reads "In Progress, changed to, Design Review, (Status)". The task is real text, in the page in full.
- Loading: `aria-busy` and one `status`; the skeletons are hidden from assistive tech.

## Don't

- **Don't truncate the task**, and don't leave its full text to a `title`. The log is read for what changed.
- **Don't colour the old value.** The new one is the coloured one; colouring both loses which is which.
- **Don't format the time.** Pass the ISO date and time ("2026-06-10T14:37:00"); the table shows it the system's way. A zone-less clock reads as written; with a zone ("…Z") it is shown in the provider's `timeZone`, else the person's own.
- **Don't filter or page inside it.**
