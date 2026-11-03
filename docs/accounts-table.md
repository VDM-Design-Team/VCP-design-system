# AccountsTable *(pattern)*

The Accounts page's list of users: a search box, who they are, which domains they are in, when they were added, an edit and a delete
button on every row, and the pages beneath. Built to Figma's `Accounts_Page_Content` (`_Accounts_Table`, `Accounts_Table_Row` and `_Accounts_Row_*`).

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |
| `Icon` | atom |
| `Input` | atom |
| `Pagination` | atom |
| `Skeleton` | atom |
| `Tag` | atom |
| `DataTable` | component |
| `UserLabel` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AccountsTable` | The Accounts page's list of users |
| `DataTable` | Any other table |
| `UserAccountModal` | What the edit button opens |
| `ConfirmDeleteModal` | What the delete button should open |

## The columns

| Column | What it is |
|---|---|
| **Name** | The avatar, the name and, under it, the email (`UserLabel`). Sortable |
| **Domains** | One neutral `Tag` per domain they are in. None reads empty |
| **Date Added** | **Already formatted** — "7 days ago". This table does not do relative time. Sortable |
| **Actions** | **Edit** and **delete**, each named for the person ("Edit John", "Delete John"). A glyph and nothing else at rest; a soft wash of its own colour on hover and press |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `AccountRow[]` | required | `id`, `name`, `email`, `avatarSrc?`, `domains`, `dateAdded` |
| `search` / `onSearchChange` | `string` / `(s) => void` | required | The box's text. **Filtering by it is the caller's job** |
| `searchPlaceholder` | `string` | `Search by name, email, or role...` | |
| `sort` / `onSortChange` | `DataTableSort` / `(sort) => void` | — | Sorting is the caller's job, as in `DataTable` |
| `onEdit` / `onDelete` | `(row) => void` | — | The button was pressed. They **ask**: see below |
| `page` / `pageCount` / `onPageChange` | | required | `Pagination`'s |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | `Pagination`'s range readout ("1-50 of 1,250") and Items select |
| `loading` | `boolean` | — | Placeholder rows; the search and headers stay; one status says "Loading accounts" |
| `empty` | `ReactNode` | words that depend on the search | What no rows say |
| `caption` | `string` | `Accounts` | The table's accessible name |

## It is controlled, and does nothing itself

The caller **filters** by `search`, **sorts** by `sort` and **pages** by `page`. `onEdit` and `onDelete` only *ask*. The page owns what
follows, and the `OnThePage` story shows the whole of it:

| Press | What the page does |
|---|---|
| **Edit** | Opens `UserAccountModal` in `edit` mode, filled |
| **Delete** | Opens `ConfirmDeleteModal` first — **nothing is deleted until it is confirmed** — then removes the row and shows a toast ("User deleted") |
| **Add Account** (a page-header action, not the table's) | Opens `UserAccountModal` in `new` mode |

## Empty

With no rows it says so: "No accounts yet." — or, while a search is typed, **No accounts match “…”.** with the words searched. Pass `empty` to say
something else.

## Tokens

The card is `surface.elevated`, `radius.md`, `space.16`. The name is `body-sm-medium` `text.primary` with the email in `caption-md-medium`
`text.tertiary`; Date Added is `body-sm-medium` `text.tertiary` (7.58:1 light / 9.85:1 dark); the domain `Tag`s are `sm`, neutral tonal. The
row buttons are `IconButton` `tertiary` squares — **no outline**: the edit glyph in `action.tertiary.content`, the delete glyph in
`accent.critical.outline.content` (the Deliverable Link's pair), and on hover and press a wash of their own colour
(`action.secondary.surface.hover` / `.pressed`, `accent.critical.outline.surface.hover` / `.pressed`). The search is the same `Input type="search"`
with a leading magnifying glass that `PlanningFilters` uses.

**Differences from Figma, on purpose.**

- The row buttons are 40 (`md`, the touch minimum), not Figma's 32, and have **no outline** (Figma draws a bordered white square; no such
  button exists in the system, so design asked for the glyph alone with a wash on hover).
- The search has a magnifying glass, as `PlanningFilters`' does; Figma's Accounts search has none.
- The Actions column has a visible "Actions" header, as `AVTable`'s does; Figma leaves it blank. A header with no words has no accessible name.
- The edit glyph is `note-pencil`, the system's edit icon (Figma's is `PencilSimple`).
- When `IconButton` gets a `critical` variant (open with the Tag Management PR), the delete button should move to it.

## Accessibility

- A real `<table>` named by `caption`, with `scope="col"` headers and `aria-sort` on the sorted one (`DataTable`'s).
- Every row button is named for its person, so a screen reader never meets thirty "Edit" buttons.
- The search is a labelled `searchbox` ("Search accounts"); the empty message is text.
- Loading: the table is `aria-busy` and one `status` says so; the skeletons are hidden from assistive tech.

## Don't

- **Don't delete on press.** `onDelete` asks; confirm first (`ConfirmDeleteModal`), then delete, then say so with a toast.
- **Don't format the date here.** Pass "7 days ago"; relative time depends on now and is the page's.
- **Don't filter, sort or page inside it.** It renders what it is given.
