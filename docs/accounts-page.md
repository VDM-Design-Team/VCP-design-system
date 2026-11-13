# AccountsPage *(pattern)*

The main content of the Accounts page: the title, then the table. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Accounts Page` in Pages & Flows.

## Composed of

| Piece | Tier |
|---|---|
| `PageTitle` | component |
| `AccountsTable` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AccountsPage` | The whole page: **`<AppShell><AccountsPage table={{…}} /></AppShell>`** |
| `AccountsTable` on its own | The table inside something else |
| `UsersTable` | The Settings Users tab's list, not this one |

## What it lays out

The title (the page's one `h1`; Figma's frames say the placeholder "Page Title"), then the table, in a column **16 apart and 32 in from the sides** (`px-8 pb-8`), as `AVListPage` lays it out. The search and the pagination are already inside the table's card. **Add Account** is not on the page: Figma draws it in the top bar, so it is `TopBar`'s `primaryAction`, and opening the user modal (`UserAccountModal`, in `new` or `edit` mode) is the app's.

## It is controlled and holds no data

The app owns the rows, the sort, the page and the search, and what the table's buttons do (open a dialog, confirm a delete, move focus on afterwards): see `docs/accounts-table.md`, which also describes the flow its `OnThePage` story shows.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `Accounts` | The `h1` |
| `table` | `AccountsTableProps` | required | `AccountsTable`'s own props |
| `className`, rest | | | On the wrapping `div` |

## Accessibility

The title is the page's one `h1`. Everything else is the table's own: see `docs/accounts-table.md`.

## Don't

- **Don't lay the page out again in the app.** Pass the table's props; the title and the spacing are here.
- **Don't add a second `h1`.**
