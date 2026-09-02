# DataTable

The generic table: columns, rows, sortable headers, optional row selection, an
empty slot. A real `<table>`, not a div grid.

## When to use

| Use | For |
|---|---|
| `DataTable` | The same fields across many objects — result sets, registers |
| A table pattern (`PlanningTable` etc., to port) | A VCP table with domain columns and rules — built by specialising this |
| `DetailRow` stack | Field-by-field facts about *one* object |
| `Accordion` | Sections, not records |

**Domain logic stays out.** Status→tone mappings, point thresholds, column
sets for a particular screen — that is what the four table patterns in
`src/patterns/` are for. If a caller passes columns that encode VCP
vocabulary, it is halfway to being a pattern already; finish the thought.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `DataTableColumn<Row>[]` | required | `{ key, label, width?, sortable?, align?, render? }` |
| `rows` | `Row[]` | required | Rendered **in the order given** — sorting is the caller's job |
| `sort` | `{ key, direction: 'asc' \| 'desc' }` | — | What the caller sorted by; drawn as `aria-sort` + a caret |
| `onSortChange` | `(sort) => void` | — | Click asks for `asc`; clicking the sorted column flips it |
| `selectable` | `boolean` | — | Leading checkbox column + select-all header (indeterminate when partial) |
| `selected` / `onSelectedChange` | ids / `(ids) => void` | — | Ids are `row.id`, falling back to the row index — give rows real ids |
| `selectLabel` | `(row) => string` | `Select row ${id}` | The per-row checkbox's accessible name — give it the row's real name |
| `empty` | `ReactNode` | `'Nothing here yet.'` | An `<EmptyState>` fits; its copy rules apply |
| `dense` | `boolean` | — | 44 rows instead of 56 |
| `caption` | `string` | — | Visually hidden `<caption>` naming the table. Strongly encouraged |
| `className` | `string` | — | On the scrolling container |

`DataTableColumn.width` takes CSS widths (`'120px'`, `'30%'`) applied to
`<col>` — **not** the export's grid tracks; `'1fr'` has no meaning in a table.
Unsized columns share the remainder, and the container scrolls horizontally
when the table cannot fit (the page never does).

## Two deliberate API changes from the export

- **Sort has a direction.** The export's `sort?: string` couldn't say which
  way. The component still never sorts rows — the server or the caller does —
  it only *asks* via `onSortChange` and *shows* via `aria-sort` and the caret.
  Unsorted sortable columns show the faint both-ways glyph.
- **No `onRowClick`.** The same decision `Card` documents, for the same
  reason: a whole-row click target is invisible to keyboards and screen
  readers, and it swallows clicks meant for controls inside cells. Put the
  row's action in a cell as a real link (`render` on the reference column is
  the idiom — see the Default story). Row hover paints `surface.brand.base`
  as a reading aid, not an affordance.

## Tokens

Container `surface.elevated` on `stroke.subtle`, `radius.md`. Header row
`surface.canvas`, labels `label-sm` uppercase in `text.secondary`. Cells
`body-md` in `text.secondary`. Hover and selected rows `surface.brand.base`.
No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Header label on `surface.canvas` | **9.90:1** | **14.48:1** |
| Cell text on `surface.elevated` | **10.35:1** | **11.87:1** |
| Cell text on hover/selected tint | **9.65:1** | **16.64:1** |
| Unsorted sort glyph *(decorative — `aria-sort` carries the fact)* | 4.55:1 | 6.96:1 |

## Accessibility

- Real table semantics: `<th scope="col">`, an `sr-only` `<caption>` from the
  `caption` prop, `aria-sort` on the sorted header. Cell-by-cell navigation —
  "column 3 of 7, Supplier" — is the point of using a `<table>` at all.
- Sort headers are buttons with visible focus rings; the direction change is
  announced through `aria-sort`, not just the caret.
- Selection: the select-all checkbox is named, `indeterminate` while partial;
  per-row checkboxes need `selectLabel` to announce distinctly.
- Row ids fall back to the index — fine until rows reorder. **If the table
  sorts or filters, real `id`s are required** or selection silently follows
  positions instead of records.

## Don't

- **Don't sort inside a `render`d cell's data and not the row array** — the
  component renders `rows` as given; sort the array.
- **Don't reach for `onRowClick` workarounds** (a click handler on a wrapper).
  The action-in-a-cell idiom exists because it is reachable; a row-wide
  handler is not.
- **Don't build the four VCP tables by copying this** — specialise it in
  `src/patterns/` with domain columns as data.
- **Don't put paragraphs in cells.** Tables are for scannable values; a cell
  that wraps three lines wants a different layout.
- **Don't use `selectable` without wiring `selected`** — a checkbox column
  that never changes state is furniture.
