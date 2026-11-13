# ContactsPage *(pattern)*

The main content of the Contact List page: the title, then the table. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Contact List Page` in Pages & Flows.

## Composed of

| Piece | Tier |
|---|---|
| `PageTitle` | component |
| `ContactsTable` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ContactsPage` | The whole page: **`<AppShell><ContactsPage table={{…}} /></AppShell>`** |
| `ContactsTable` on its own | The table inside something else |

## What it lays out

The title (the page's one `h1`; Figma's frames say the placeholder "Page Title"), then the table, in a column **16 apart and 32 in from the sides** (`px-8 pb-8`), as `AVListPage` lays it out. The pagination is already inside the table's card. **Add Account** in Figma's top bar is `TopBar`'s `primaryAction`, the app's to pass. Figma draws this table with no card round it; the system keeps the card on purpose, so every table reads the same.

## It is controlled and holds no data

The app owns the rows, the sort, the page and the search, and what the table's buttons do (open a dialog, confirm a delete, move focus on afterwards): see `docs/contacts-table.md`, which also describes the flow its `OnThePage` story shows.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `Contact List` | The `h1` |
| `table` | `ContactsTableProps` | required | `ContactsTable`'s own props |
| `className`, rest | | | On the wrapping `div` |

## Accessibility

The title is the page's one `h1`. Everything else is the table's own: see `docs/contacts-table.md`.

## Don't

- **Don't lay the page out again in the app.** Pass the table's props; the title and the spacing are here.
- **Don't add a second `h1`.**
