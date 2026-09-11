# AVTable

The Added Value table — the list every VCP workspace is built around.
`DataTable` specialised, exactly as `docs/data-table.md` says the VCP tables
should be: the generic table keeps the `<table>` semantics, the sorting
contract and the selection contract, and this adds the nine columns and
nothing else.

Read off the Figma `AV_Table` (`6785:35414`) and the `_AV_Table_Header_Item`
(nine types) and `_AV_Table_Row` (four variants) sets on the Added Value Table
page, audit batch 5, 11 September 2026.

## Composed of

| Piece | Tier |
|---|---|
| `Badge` | atom |
| `Button` | atom |
| `Divider` | atom |
| `Icon` | sub-atomic |
| `TypeTag` | atom |
| `UrgencyTag` | atom |
| `AvatarGroup` | component |
| `DataTable` | component |
| `DueDatePill` | component |
| `Pagination` | component |
| `StatusPill` | component |
| `Tooltip` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `AVTable` | Any list of Added Values — the workspace, a filtered view, search results |
| `DataTable` | A table of something that is not an Added Value |
| `StatusPill` etc. | One AV's facts outside a table — a card, a detail panel |

**It owns no mapping.** Every cell that has a vocabulary defers to the piece
that owns it: `StatusPill` for status, `UrgencyTag` for urgency, `TypeTag` for
type, `DueDatePill` for how near a date is. This pattern decides *which columns
exist and in what order*, and that is all — which is the difference between a
pattern and a second copy of the system.

**It does not sort, filter or paginate.** `rows` renders in the order given and
`page` is whatever the caller says, the same contract `DataTable` sets. The
order of a thousand Added Values is the server's business.

## The columns

| Column | Sortable | Cell |
|---|---|---|
| Checkbox | — | Optional. `selectable` |
| Task Title | ✓ `title` | Reference, divider, title; domain badge and counts below |
| Due Date | ✓ `due` | `DueDatePill` |
| Urgency | — | `UrgencyTag` |
| Type | — | `TypeTag` |
| Status | — | `StatusPill` |
| Members | — | `AvatarGroup` |
| Last Updated | ✓ `lastUpdated` | Already-formatted text |
| Actions | — | Optional. `actions` |

Three of the nine are optional, and they are the design's own four row
variants. Default draws seven; `selectable` adds the leading checkbox;
`actions` adds the trailing menu. Figma draws Default, Checkbox, Checkbox
Selected and Action Column — the same two booleans, so they are booleans here
rather than a `variant` prop.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `AVTableRow[]` | required | Rendered **in the order given** |
| `sort` / `onSortChange` | `DataTableSort` / `(sort) => void` | — | Keys: `title`, `due`, `lastUpdated` |
| `selectable` | `boolean` | — | Adds the leading checkbox column |
| `selected` / `onSelectedChange` | `string[]` / `(ids) => void` | `[]` | Ids are `row.id` |
| `onOpen` | `(row) => void` | — | Given, the reference is a button; omitted, it is text |
| `actions` | `(row) => ReactNode` | — | Adds the trailing Actions column |
| `onDeleteSelected` | `(ids) => void` | — | The destructive button above the pagination |
| `deleteSelectedLabel` | `(count) => string` | `Delete Selected (n)` | |
| `page` / `pageCount` / `onPageChange` | — | — | Pagination renders only when **all three** are given |
| `hints` | `AVTableHints` | — | The four info tooltips. No defaults — see below |
| `empty` | `ReactNode` | `DataTable`'s | An `<EmptyState>` fits |
| `caption` | `string` | `'Added Values'` | Visually hidden `<caption>` |

### `AVTableRow`

`id` and `ref` and `title` are required; everything else is optional, and an
absent value draws **nothing** — no dash, no em-dash placeholder. A column of
blanks reads as "not set", which is the truth; a column of dashes reads as a
value someone chose.

```tsx
{
  id: 'av-1',
  ref: 'VCP-12345',
  title: '[VCP] Collapsible Sidebar…',
  domain: 'VCP',
  attachments: 3,
  comments: 1,
  due: { label: 'October 1, 2025', proximity: 'due-soon' },
  urgency: 'Normal',
  type: 'Type 3',
  status: { custom: 'Ready for Deploy' },   // or { status: 'Review' }
  members: ['Ali Rahman'],
  lastUpdated: '7 days ago',
}
```

`due.label` and `lastUpdated` are **already formatted**. This table does no
date maths and no relative time — see `docs/due-date-pill.md` for why the
threshold is not a design-system decision.

### `hints` has no defaults, deliberately

Figma puts an info glyph on four headers — Urgency, Type, Status, Members —
and writes no tooltip text on any of them. Inventing four sentences of product
copy is not a design system's job, so the glyph renders only for a hint you
supply. **Open question for design**, below.

## Accessibility

- A real `<table>` with `scope="col"` headers and `aria-sort` on the sorted
  one, inherited from `DataTable`. Cell-by-cell navigation is assistive tech's
  whole affordance for tabular data.
- **No whole-row click target.** The reference is a button and its accessible
  name carries the title too — "VCP-12511: Audit every empty state…" — so a
  screen-reader user hears what they are opening rather than a bare code.
- **Every checkbox names its AV**, not "row 3", so two rows never announce
  alike.
- **Counts announce their noun.** "3" beside a paperclip is "3 attachments" to
  a screen reader, singular or plural as the number requires.
- **Header hints are outside the sort button.** A header that both sorts and
  explains would otherwise nest one interactive element inside another:
  invalid, and the inner one unreachable by keyboard. `DataTable.hint` renders
  as a sibling for exactly this reason.
- The urgency and type glyphs are decorative and the words beside them carry
  the meaning, so no cell announces twice.
- **Colour is never the only cue** in any column: urgency and type have
  distinct glyph shapes, status and due date are words.

## Don't

- **Don't re-derive a mapping here.** If a cell needs to know that Urgent is
  red or that Review has two treatments, the piece that owns it already does.
  A `tone={…}` ternary in this file is a bug.
- **Don't sort `rows` inside the table.** It renders what it is given.
- **Don't add a row-level `onClick`.** `DataTable` refuses those and is right
  to; give the cell the real control.
- **Don't render a dash for a missing value.** Draw nothing.
- **Don't copy this for the Budget, Holiday or Availability tables.** They
  specialise `DataTable` the same way, beside this one.

## Deviations from Figma

- **The domain badge** is `Badge tone="brand"` — `text.brand.strong` on
  `surface.brand.faint`. Figma writes the word in `text.brand.medium`. One step
  of brand navy apart on the text; the `Badge` tone is used so every brand
  chip in the system stays one colour.
- **Pagination is the repo's `Pagination`**, which draws arrows and five page
  numbers. Figma's `VCP_Pagination` additionally draws First/Last buttons, an
  items-per-page select and a "1–50 of 1,250" range. `docs/pagination.md` says
  to extend that component rather than compose around it, so those three are a
  follow-up on `Pagination`, not something rebuilt here.
- **Column widths** are `<col>` percentages, not Figma's grid `fr` tracks —
  `1fr` has no meaning in a table. Task Title takes 40%, matching its 4fr
  against six roughly-1fr columns.
- **The reference and Last Updated** use the repo's `text.tertiary`, which is
  one slate step darker than Figma's — a pre-existing, deliberate contrast fix
  in this repo, not a reading error. See `docs/figma-audit.md`, batch 5.
- **Pills are 13px**, `Badge`'s own small size; Figma draws 12. One consistent
  pixel across every pill in the system, which is better than one table
  disagreeing with the rest.

Row height, cell padding and avatar size were **measured in the browser against
the canvas**: 81, 16 and 32 respectively, all exact.

## Still open

1. **The four info tooltips have no copy.** Design drew the glyphs; nobody
   wrote the sentences. Until they exist, `hints` is empty and the glyphs do
   not render.
2. **What "due soon" means** — carried over from `docs/due-date-pill.md`.
3. **`Pagination`'s three missing affordances**, listed above. They belong on
   that component, not here.
