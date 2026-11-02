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
| `CopyText` | atom |
| `Avatar` | atom |
| `Icon` | sub-atomic |
| `Input` | atom |
| `Pagination` | atom |
| `Tag` | atom |
| `Tooltip` | atom |
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
| `onOpen` | `(row) => void` | — | Given, the title is a button. (The ID is click-to-copy, so opening is the title's job) |
| `onStartChange` / `onDueChange` | `(row, iso) => void` | — | Each date edits in place only if its callback is given |
| `onPointsChange` | `(row, points) => void` | — | Same, for points |
| `page` / `pageCount` / `onPageChange` | | — | Pagination renders only when all three are given |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | With the pagination: the "Items 50 ▾" selector and the "1-50 of 1,250" range |
| `hints` | `{ urgency, type, start, points, due, status }` | the design's copy for `start`, `points`, `due` | The tooltips. Start Date, Points and Due Date are the formula columns (ƒ glyph) and have Figma's copy; Urgency, Type and Status have none in Figma, so omit one and its glyph does not render |
| `empty` | `ReactNode` | — | What a section with no rows says |

A row is `{ id, ref, title, domain?, urgency?, type?, initiator?, assignee?, start?, points?, due?, status? }`;
`start` and `due` are `{ value (ISO), estimated? }`, and an estimated date reads "2026-03-16 (estimate)".

## Columns

ID · Added Value Title (sortable) · Urgency · Type · Initiator · Assignee · Start Date · Points · Due
Date · Status. The mappings live where they always did: `StatusTag`, `UrgencyTag`, `TypeTag`,
`AssigneeWithStatus` (the green / amber / red dot and its tooltip).

## Sections

Each is a card: a caret button, the title with its dates, and — for a cycle — Total Capacity and
Capacity Remaining in points, in the design's blue — `action.tertiary.content`, not `text.brand.medium`, whose dark value is 3.9:1 on the card. The Backlog has neither. The caret is one glyph that turns in place (as `Accordion`'s does), 20 in `text.secondary` — the title is
the heading, the caret only its hinge. It is a real button inside the heading (`aria-expanded`,
`aria-controls`); a folded section shows only its header.

## Accessibility

- Each section is a `<section>` named by its heading; the table has a caption ("Cycle 27 Added Values").
- The caret toggles with Enter / Space; the focus ring is the system's.
- Editable cells are `InlineEdit` / `InlineDateEdit`: named pens ("Edit points", "Change due date for VCP-1234"),
  Enter confirms, Escape cancels. Pens show on hover **and keyboard focus**.
- Availability is never colour alone: the dot's tooltip and the avatar's accessible name both say
  "John Doe (Assignee, Busy)".

## Tooltips

| Where | Says |
|---|---|
| Start Date ƒ | "This column is editable, changing Start Date affects Due Date." |
| Points ƒ | "This column is editable, changing Points affects Due Date." |
| Due Date ƒ | "This column is editable, changing Due Date affects Start Date. Due Date = Approx. Start Date + Approx. Working Days + Buffer" |
| An estimated date | "This date is an estimate and may not be fully accurate." |
| The assignee's avatar | "John Doe (Assignee, Available)" |
| A pen | "Edit" |

**ID: click to copy.** The reference is `CopyText` — a click copies it and "Copied" confirms (and is announced).

## Not here

- **Dragging an Added Value from the Backlog into a Cycle** (which opens the *Add Required Details* modal) —
  tracked as its own PR with the modal.
- **The filter row** above the table (search, status, priority, Reset, View Cycle) is page composition
  and needs a `FilterBar`; it is tracked separately.
- **The animated cells** (a value that changed draws attention to itself) are tracked for a later pass.
- **Folding is not animated** yet; the body shows and hides.

## Don't

- **Don't re-map statuses, urgencies or availability** to colours here.
- **Don't sort or page inside the table.** The order of a thousand rows is the server's business.
