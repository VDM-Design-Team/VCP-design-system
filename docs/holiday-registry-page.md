# HolidayRegistryPage *(pattern)*

The main content of the Holiday Registry page: the title, then the table. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Holiday Registry` page in Pages & Flows (the admin and the normal-user views, and the empty state).

## Composed of

| Piece | Tier |
|---|---|
| `PageTitle` | component |
| `HolidayTable` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HolidayRegistryPage` | The whole page: **`<AppShell><HolidayRegistryPage table={{…}} /></AppShell>`** |
| `HolidayTable` on its own | The table inside something else |

## What it lays out

The title (the page's one `h1`; Figma's frames say the placeholder "Page Title"), then the table, in a column **16 apart and 32 in from the sides** (`px-8 pb-8`), as `AVListPage` lays it out. The filters, **Add Holiday**, **Import from Hubstaff** and the pagination are already inside the table's card. `table.admin` makes it the admin's page. Opening `HolidayModal`, and confirming a removal, are the app's.

## It is controlled and holds no data

The app owns the rows, the sort, the page and the search, and what the table's buttons do (open a dialog, confirm a delete, move focus on afterwards): see `docs/holiday-table.md`, which also describes the flow its `OnThePage` story shows.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `Holiday Registry` | The `h1` |
| `table` | `HolidayTableProps` | required | `HolidayTable`'s own props |
| `className`, rest | | | On the wrapping `div` |

## Accessibility

The title is the page's one `h1`. Everything else is the table's own: see `docs/holiday-table.md`.

## Don't

- **Don't lay the page out again in the app.** Pass the table's props; the title and the spacing are here.
- **Don't add a second `h1`.**
