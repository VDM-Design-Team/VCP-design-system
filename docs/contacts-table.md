# ContactsTable *(pattern)*

The Contact List page: the messages people have sent through the contact form, one row each — who, what about, and what they said — with a
delete button on every row and the pages beneath. Built to Figma's `Contact_List` (`_Contact_List_Table_Item_*`, `Contact_List_Row`).

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |
| `Pagination` | atom |
| `Skeleton` | atom |
| `DataTable` | component |
| `TableCard` | component |
| `TableEmpty` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ContactsTable` | The Contact List page |
| `AccountsTable` | The Accounts page's users |
| `DataTable` | Any other table |
| `ConfirmDeleteModal` | What the delete button should open |

## On a page

The Contact List page is `PageTitle` (the page's one `h1`; Figma's frame says the placeholder "Page Title", write "Contact List") and then this table, in a column **16 apart and 32 in from the sides** (`px-8 pb-8`), as `AVListPage` lays it out. It goes inside `AppShell`. The pagination is already inside the table's card. **Add Account** in Figma's top bar is `TopBar`'s `primaryAction`, the page's to pass. The whole page, title and spacing included, is `ContactsPage`: use that rather than laying it out again.

**Figma draws this table with no card around it** (the rows sit straight on the canvas), where `AccountsTable` is in one. The system keeps the card on purpose, so every table reads the same (decided 12 Nov 2026).

## The columns

| Column | What it is |
|---|---|
| **Email** | Who wrote — `body-sm-medium`, `text.primary` |
| **Subject** | `body-sm-medium`, `text.tertiary` |
| **Message** | `body-sm-medium`, `text.tertiary`. **A long message wraps and is shown whole** |
| **Actions** | **Delete**, named for the row ("Delete message from john@vdm.technology"): the plain glyph-only `IconButton` with the critical red glyph, as the Accounts table's |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `ContactRow[]` | required | `id`, `email`, `subject`, `message` |
| `onDelete` | `(row) => void` | — | The bin was pressed. It **asks**: see below |
| `page` / `pageCount` / `onPageChange` | | required | `Pagination`'s |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | The range readout ("1-8 of 20") and the Items select |
| `loading` | `boolean` | — | Placeholder rows; the headers stay; one status says "Loading messages" |
| `empty` | `ReactNode` | `TableEmpty`, “No messages yet.” | What no rows say |
| `caption` | `string` | `Contact messages` | The table's accessible name |

## It is controlled, and does nothing itself

The caller **pages** by `page`; `onDelete` only *asks*. The page owns what follows, and the `OnThePage` story shows it: **delete** opens
`ConfirmDeleteModal` first (`itemLabel="Contact"`) — **nothing is deleted until it is confirmed**, and Cancel keeps the message — then removes the
row and shows a toast ("Message deleted").

### Focus after a delete — the page's job

When the row goes its **Delete button goes with it**, so the dialog's focus return lands on nothing and focus falls to the page: a keyboard or screen-reader user is sent back to the top (CLAUDE.md: "Never drop focus"). The
table only reports the delete, so after the row is removed the page moves focus on purpose:

| What is left | Focus goes to |
|---|---|
| A message after the deleted one | That row's **Delete** button |
| It was the last row on the page | The **previous** row's Delete button (the first on the page that takes its place when the page empties) |
| The table is empty | The empty message ("No messages yet."), made focusable for the purpose |

Do it after the dialog has closed. Cancel needs nothing: the row stays and focus returns to its Delete button. The `OnThePage` story does this and asserts `document.activeElement` for the next row; `DeletingTheLastMessage` asserts the empty table. The same rule
is in `docs/accounts-table.md` and `docs/confirm-delete-modal.md`.

## A long message is shown whole

Nothing here can open a message, and an admin has to be able to read what was sent, so a long message **wraps** and the row grows, rather than
being cut with "…". (Figma draws only short placeholder text, so how a long one should behave is a question for design — if a message should be
cut, the page then needs a way to read the rest.)

## Tokens

The card is `surface.elevated`, `radius.md`, `space.16`, the same as `AccountsTable`. Email is `text.primary` (20.17:1 light / 14.63:1 dark);
Subject and Message are `text.tertiary` (7.58:1 / 9.85:1). No new tokens.

**Differences from Figma, on purpose.**

- The headers read "Email", "Subject", "Message", in the system's header style; Figma types them in capitals.
- The bin is the plain `IconButton` at 40 (`md`, the touch minimum), not Figma's 24 around a 16 glyph.
- The Actions column has a visible "Actions" header, as `AVTable`'s and `AccountsTable`'s do; Figma leaves it blank, and a header with no
  words has no accessible name.
- When `IconButton` gets a `critical` variant (the Tag Management PR), the bin should move to it.

## Accessibility

- A real `<table>` named by `caption`, with `scope="col"` headers (`DataTable`'s).
- Every bin is named for its row, so a screen reader never meets twenty "Delete" buttons.
- Loading: the table is `aria-busy` and one `status` says so; the skeletons are hidden from assistive tech.

## Don't

- **Don't delete on press.** `onDelete` asks; confirm first (`ConfirmDeleteModal`), then delete, then say so with a toast.
- **Don't cut a message the page cannot open.**
- **Don't page inside it.** It renders the page it is given.
