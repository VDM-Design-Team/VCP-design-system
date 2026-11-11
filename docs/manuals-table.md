# ManualsTable *(pattern)*

The Settings Manuals tab's list: each manual's name, who uploaded it, its attachments and when it was added, and the pages beneath.
Built to Figma's `Manuals_Table` (`Filled=Yes` / `Filled=No`) and the Design Library's `_Manuals_Settings_Table_*` row cells.

## Composed of

| Piece | Tier |
|---|---|
| `Pagination` | atom |
| `Skeleton` | atom |
| `DataTable` | component |
| `TableCard` | component |
| `TableEmpty` | component |
| `UserLabel` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ManualsTable` | The Settings Manuals tab's list |
| `AccountsTable` | The Accounts page's list of users |
| `DataTable` | Any other table |

## The columns

| Column | What it is |
|---|---|
| **Name** | The manual's name, and **the way in**: with an `href` it is a link that opens the manual in a new tab. Sortable |
| **Uploaded by** | The avatar, name and email (`UserLabel`) |
| **Attachments** | A count: "None", "1 file", "3 files" (decided with design, 6 Nov 2026; Figma draws no content here yet) |
| **Date Added** | **Already formatted** — "4 months ago" (the Date Added exception to dd/mm/yyyy) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `ManualRow[]` | required | `id`, `name`, `href?`, `uploadedBy { name, email, avatarSrc? }`, `attachmentCount`, `dateAdded` |
| `sort` / `onSortChange` | `DataTableSort` / `(sort) => void` | — | Sorting is the caller's job |
| `page` / `pageCount` / `onPageChange` | | required | `Pagination`'s |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | The range readout and Items select |
| `loading` | `boolean` | — | Placeholder rows; headers stay; one status says "Loading manuals" |
| `empty` | `ReactNode` | `TableEmpty` "No items." | |
| `caption` | `string` | `Manuals` | The table's accessible name |

## It is controlled, and does nothing itself

The caller **sorts** by `sort` and **pages** by `page`. **Add Manual** is a page-header action (the top bar), not part of the table. It opens a
dialog (decided with design, 6 Nov 2026), which is its own piece and not part of this one.

## Tokens

The card is `TableCard`'s (`surface.elevated`, `radius.md`, `space.24`), with the pagination in its footer. A linked name is `text.link.default`,
underlined on hover. Name is `body-sm-medium` `text.primary`; Attachments and Date Added are
`body-sm-medium` `text.tertiary`.

**Differences from Figma, on purpose.** Figma's row sketch is a copy of the Users row (an avatar where the name goes); the name is text here.
There is no search and no row action, because none is drawn; the name is the way to open a manual. The empty glyph sits in the `TableEmpty` tile.

## Accessibility

- A real `<table>` named by `caption`, `aria-sort` on the sorted header.
- **A manual's name is a real link**, with a visible focus ring. It opens in a new tab and says so ("opens in a new tab").
- Loading: `aria-busy` and one `status`; skeletons are hidden from assistive tech.

## Don't

- **Don't format the date here.** Pass "4 months ago".
- **Don't sort or page inside it.**
- **Don't add a row button to open a manual.** The name is the link.
