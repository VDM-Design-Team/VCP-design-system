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
| `sections` | `PlanningSection[]` | required | `{ id, kind?, title, dates?, totalCapacity?, remainingCapacity?, rows }` — `kind` is `cycle` or `backlog` |
| `collapsed` / `defaultCollapsed` / `onCollapsedChange` | `string[]` | — | Folded section ids. Controlled when `collapsed` is given |
| `sort` / `onSortChange` | `DataTableSort` | — | The sortable key is `title`. **Sorting is a handler, not the table's job**: the header reports the key and direction and the caller (usually the server) returns the rows in that order. The table never reorders rows in the browser |
| `onMoveRow` | `(row, from, to) => void` | — | A Backlog row was dropped on a Cycle. The table moves nothing — in the design this opens *Add Required Details*. With no handler, rows are not draggable |
| `onOpen` | `(row) => void` | — | Given, the title is a button. (The ID is click-to-copy, so opening is the title's job) |
| `onStartChange` / `onDueChange` | `(row, iso) => void` | — | Each date edits in place only if its callback is given |
| `onPointsChange` | `(row, points) => void` | — | Same, for points |
| `page` / `pageCount` / `onPageChange` | | — | Pagination renders only when all three are given |
| `itemCount` / `pageSize` / `pageSizeOptions` / `onPageSizeChange` | | — | With the pagination: the "Items 50 ▾" selector and the "1-50 of 1,250" range |
| `hints` | `{ urgency, type, start, points, due, status }` | the product's copy | The header tooltips. Start Date, Points and Due Date are the formula columns (ƒ in a ring, brand blue, as wide as the ⓘ's circle); Urgency, Type and Status use the copy their own pieces own, as `AVTable` does. Pass a string or node to change a column's copy, `''` to drop its glyph |
| `empty` | `ReactNode` | — | What a section with no rows says |

A row is `{ id, ref, title, domain?, urgency?, type?, initiator?, assignee?, start?, points?, due?, status? }`;
`start` and `due` are `{ value (ISO), estimated? }`, and an estimated date reads "2026-03-16 (est.)".

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
| Urgency ⓘ | "Indicates how urgent or important a task is compared to others" |
| Type ⓘ | "Type 1: Direct KPI impact with clear ROI / Type 2: Indirect impact, enablement/optimization / Type 3: Non-critical, no meaningful KPI impact" (one line each) |
| Status ⓘ | "Reflects the current stage of the task (e.g., in progress, completed)." |
| A type tag | "Type 3: Non-critical, no meaningful KPI impact" |
| The initiator's avatar | Their name |
| Start Date ƒ | "This column is editable, changing Start Date affects Due Date." |
| Points ƒ | "This column is editable, changing Points affects Due Date." |
| Due Date ƒ | "This column is editable, changing Due Date affects Start Date. Due Date = Approx. Start Date + Approx. Working Days + Buffer" |
| An estimated date | "This date is an estimate and may not be fully accurate." |
| The assignee's avatar | "John Doe (Assignee, Available)" |
| A pen | "Edit" |

**ID: click to copy.** The reference is `CopyText` — a click copies it and "Copied" confirms (and is announced).

## Not here

- **The *Add Required Details* dialog** that a drop opens — its own PR. The table only reports the drop.
- **A keyboard way to move a row.** Dragging is pointer-only; a "Move to cycle…" row action that opens the same dialog
  is tracked with the dialog's PR.
- **The filter row** above the table (search, status, priority, Reset, View Cycle) is page composition
  and needs a `FilterBar`; it is tracked separately.
- **The animated cells** (a value that changed draws attention to itself) are tracked for a later pass.
- **Folding is not animated** yet; the body shows and hides.

## Dragging

With `onMoveRow`, Backlog rows are draggable and each Cycle is a drop target: it takes a blue outline while a row
is over it. Dropping calls `onMoveRow(row, from, to)`; **nothing moves until you move it** (the design opens a
dialog first, and the move happens on confirm).

## Popovers

An inline date picker opens out of its cell. `InlineDateEdit`'s popover is `strategy="fixed"`, so it floats over
the table's horizontal scroll instead of being clipped by it.

## Sizing

Every column hugs its content (`fit`) except the title, which takes the rest and truncates (`grow`, minimum
16rem). Narrow the window and the title gives way first; below that the table scrolls sideways, one scroller
per section (see `docs/data-table.md`).

## Don't

- **Don't re-map statuses, urgencies or availability** to colours here.
- **Don't sort or page inside the table.** Sorting is a handler (`onSortChange`): the order of a thousand rows is the server's business.
