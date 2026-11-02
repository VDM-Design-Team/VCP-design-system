# PlanningTable

The Planning list: Added Values grouped into collapsible sections — one per Cycle plus the
Backlog — with the dates and points editable in place and each assignee's availability on their
avatar. `DataTable` specialised, as `AVTable` is. Read off the Figma Planning Page (`4632:65090`):
`_Planning_Table` (Expanded / Collapsed × Cycle / Backlog), `_Planning_Table_Header`, `_Planning_Table_Row`,
`_Planning_Table_Item` (nine cell types) and the editable Date and Points cells.

## Composed of

| Piece | Tier |
|---|---|
| `AssigneeStatus` | atom |
| `Avatar` | atom |
| `Icon` | sub-atomic |
| `Input` | atom |
| `Pagination` | atom |
| `Tag` | atom |
| `AssigneeWithStatus` | component |
| `DataTable` | component |
| `InlineEdit` | component |
| `StatusTag` | component |
| `TypeTag` | component |
| `UrgencyTag` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `PlanningTable` | Planning Added Values into Cycles, with capacity in view |
| `AVTable` | The workspace's Added Value list (nine columns, no sections) |
| `DataTable` | Any other tabular data |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `sections` | `PlanningSection[]` | required | `{ id, title, dates?, totalCapacity?, remainingCapacity?, rows }` |
| `collapsed` / `defaultCollapsed` / `onCollapsedChange` | `string[]` | — | Folded section ids. Controlled when `collapsed` is given |
| `sort` / `onSortChange` | `DataTableSort` | — | The sortable key is `title`. Sorting is the caller's |
| `onOpen` | `(row) => void` | — | Given, the reference is a button |
| `onStartChange` / `onDueChange` | `(row, iso) => void` | — | Each date edits in place only if its callback is given |
| `onPointsChange` | `(row, points) => void` | — | Same, for points |
| `page` / `pageCount` / `onPageChange` | | — | Pagination renders only when all three are given |
| `hints` | `{ urgency, type, start, points, due, status }` | — | The info tooltips. **No default copy**: omit one and its glyph does not render |
| `empty` | `ReactNode` | — | What a section with no rows says |

A row is `{ id, ref, title, domain?, urgency?, type?, initiator?, assignee?, start?, points?, due?, status? }`;
`start` and `due` are `{ value (ISO), estimated? }`, and an estimated date reads "2026-03-16 (estimate)".

## Columns

ID · Added Value Title (sortable) · Urgency · Type · Initiator · Assignee · Start Date · Points · Due
Date · Status. The mappings live where they always did: `StatusTag`, `UrgencyTag`, `TypeTag`,
`AssigneeWithStatus` (the green / amber / red dot and its tooltip).

## Sections

Each is a card: a caret button, the title with its dates, and — for a cycle — Total Capacity and
Capacity Remaining in points, in the design's blue — `action.tertiary.content`, not `text.brand.medium`, whose dark value is 3.9:1 on the card. The Backlog has neither. The caret is a real button
inside the heading (`aria-expanded`, `aria-controls`); a folded section shows only its header.

## Accessibility

- Each section is a `<section>` named by its heading; the table has a caption ("Cycle 27 Added Values").
- The caret toggles with Enter / Space; the focus ring is the system's.
- Editable cells are `InlineEdit` / `InlineDateEdit`: named pens ("Edit points", "Change due date for VCP-1234"),
  Enter confirms, Escape cancels. Pens show on hover **and keyboard focus**.
- Availability is never colour alone: the dot's tooltip and the avatar's accessible name both say
  "John Doe (Assignee, Busy)".

## Not here

- **The filter row** above the table (search, status, priority, Reset, View Cycle) is page composition
  and needs a `FilterBar`; it is tracked separately.
- **The animated cells** (a value that changed draws attention to itself) are tracked for a later pass.
- **Folding is not animated** yet; the body shows and hides.

## Don't

- **Don't re-map statuses, urgencies or availability** to colours here.
- **Don't sort or page inside the table.** The order of a thousand rows is the server's business.
