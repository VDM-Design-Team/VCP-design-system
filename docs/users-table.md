# UsersTable *(pattern)*

The Settings Users tab's list: a search box, who they are, their status, when they were added, **View** on every row, **+ New User** in
the Actions header, and the pages beneath. Built to Figma's `Settings_Users`.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `Input` | atom |
| `Pagination` | atom |
| `Skeleton` | atom |
| `AccountStatusTag` | component |
| `DataTable` | component |
| `TableCard` | component |
| `TableEmpty` | component |
| `UserLabel` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `UsersTable` | The Settings Users tab's list of users |
| `AccountsTable` | The admin Accounts page (domains, edit and delete) |
| `DataTable` | Any other table |
| `UserAccountModal` | What **View** and **+ New User** open (pass `roles`, and `ACCOUNT_STATUS_OPTIONS` as its Status list) |
| `AccountStatusTag` | An account's status anywhere else |

## The columns

| Column | What it is |
|---|---|
| **Name** | The avatar, the name and, under it, the email (`UserLabel`). Sortable |
| **Status** | An `AccountStatusTag`: Approved (green), Pending (yellow) or Inactive (grey). Sortable. **`AccountStatusTag` owns the statuses and their colours**, not this table |
| **Date Added** | **Already formatted** — "4 months ago". A Date Added column is the written exception to dd/mm/yyyy (decided with design, 6 Nov 2026). Sortable |
| **Actions** | **+ New User** in the header (the column keeps "Actions" as its hidden name — `DataTableColumn.action`) and **View** on each row, named for the person ("View John"). **Right-aligned**; the header has room above and below the button |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `UserRow[]` | required | `id`, `name`, `email`, `avatarSrc?`, `status`, `dateAdded` |
| `search` / `onSearchChange` | `string` / `(s) => void` | required | **Filtering by it is the caller's job** |
| `searchPlaceholder` | `string` | `Search by name, email, or role...` | |
| `sort` / `onSortChange` | `DataTableSort` / `(sort) => void` | — | Sorting is the caller's job |
| `onNewUser` / `onView` | `() => void` / `(row) => void` | — | Pressed. They **ask**: the page opens the dialog |
| `page` / `pageCount` / `onPageChange` | | required | `Pagination`'s |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | The range readout ("1-50 of 1,250") and Items select |
| `loading` | `boolean` | — | Placeholder rows; the search, the headers and **+ New User** stay; one status says "Loading users" |
| `empty` | `ReactNode` | words that depend on the search | |
| `caption` | `string` | `Users` | The table's accessible name |

## It is controlled, and does nothing itself

| Press | What the page does |
|---|---|
| **+ New User** | Opens `UserAccountModal` (`mode="new"`, `title="Create New User"`, `roles`) |
| **View** | Opens it filled (`mode="edit"`), the user's name as its title |

## Empty

In a `TableEmpty` (`EmptyState`'s tile, title and **Reset**): "No users yet.", or while a search is typed, **No users match “…”.** with a hint.

## Tokens

The card is `TableCard`'s, as `AccountsTable`'s is (`surface.elevated`, `radius.md`, `space.24`), with the search in its filters and the pagination in its footer; Date Added `body-sm-medium` `text.tertiary`; the status is `AccountStatusTag`'s (`sm`; success, warning or neutral). Both buttons are the primary `sm` `Button` (36 high).

**Differences from Figma, on purpose.** The search has a magnifying glass (as `PlanningFilters`' does). Figma draws only "approved"; Pending and Inactive, and their
colours, were decided with design and live in `AccountStatusTag`. Statuses read capitalised ("Approved").

## Accessibility

- A real `<table>` named by `caption`, `aria-sort` on the sorted header.
- Every View is named for its person. The Actions header has a hidden name; its button is **New User**.
- The search is a labelled `searchbox` ("Search users"). Loading: `aria-busy` and one `status`.
- **+ New User stays while loading**, so focus returning to it after a user is created does not fall to the page.
- Status is written out in the tag, never colour alone.

## Don't

- **Don't pick the status colour here or at the call site.** The mapping lives in `AccountStatusTag`.
- **Don't format the date here.** Pass "4 months ago".
- **Don't filter, sort or page inside it.**
