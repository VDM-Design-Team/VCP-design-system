# DataTable

The generic table: columns, rows, sortable headers, optional row selection, an
empty slot. A real `<table>`, not a div grid.

## Composed of

| Piece | Tier |
|---|---|
| `Checkbox` | atom |
| `Icon` | atom |
| `Tooltip` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

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
| `columns` | `DataTableColumn<Row>[]` | required | `{ key, label, width?, fit?, grow?, sortable?, hint?, render? }` |
| `rows` | `Row[]` | required | Rendered **in the order given** — sorting is the caller's job |
| `sort` | `{ key, direction: 'asc' \| 'desc' }` | — | What the caller sorted by; drawn as `aria-sort` + a sort glyph |
| `onSortChange` | `(sort) => void` | — | Click asks for `asc`; clicking the sorted column flips it |
| `selectable` | `boolean` | — | Leading checkbox column + select-all header (indeterminate when partial) |
| `selected` / `onSelectedChange` | ids / `(ids) => void` | — | Ids are `row.id`, falling back to the row index — give rows real ids |
| `selectLabel` | `(row) => string` | `Select row ${id}` | The per-row checkbox's accessible name — give it the row's real name |
| `empty` | `ReactNode` | `'Nothing here yet.'` | An `<EmptyState>` fits; its copy rules apply |
| `dense` | `boolean` | — | 44 rows instead of 56 |
| `caption` | `string` | — | Visually hidden `<caption>` naming the table. Strongly encouraged |
| `cellProps` (on a column) | `(row) => HTMLAttributes<td>` | — | Extra attributes for that column's `<td>` in a row — a class that lets something fill the whole cell, a pointer handler on the cell. `className` is merged |
| `rowProps` | `(row) => HTMLAttributes<tr>` | — | Extra attributes for a row — a drag source, a data attribute. `className` is merged; the row stays a plain row |
| `className` | `string` | — | On the scrolling container |

`DataTableColumn.hint` renders after the label and **before the sort arrows** — a
tooltip trigger, a count, a badge: "Label ⓘ ⇅". It sits **outside** the sort button, because a header that both sorts
and explains would otherwise nest one interactive element inside another:
invalid HTML, and the inner one unreachable by keyboard. `AVTable` uses it for
the four info tooltips its design draws. `ColumnHint` is the ready-made one: the info
glyph with a tooltip, on hover and on keyboard focus (`hint: <ColumnHint column="owner"
text="Who is working it" />`).

**Cell values and headers are always left-aligned.** There is no `align` option — the
VCP design never draws right-aligned numbers (design review, October 2026).

**Headers are 14px medium, sentence case.** They were 11px uppercase until
11 September 2026, which came from the original export and matched nothing:
every header in the VCP Figma library is drawn `ORIGINAL` case at 14 medium,
the AV table's nine included. Measured, not assumed — `docs/figma-audit.md`,
batch 5.

A trap worth naming: **the repo's type ramp and Figma's share names but not
values.** Figma's `label-sm` is 14px; this repo's is 11px. Read a spec off the
canvas by *value*, not by token name — 14px medium here is `label-lg`.

### How a column is sized: a floor, then a share

The responsive pattern for every VCP table: **no column is ever narrower than its content, and above that
the spare room is shared out** — so a wide table fills out, and only a squeezed one scrolls.

| Column option | What it does | Use it for |
|---|---|---|
| `fit` | Its floor is its widest cell or header — never wrapped, never cut with "…". Above the floor it takes a share of the spare room by its `width` weight (its content's length without one) | Tags, dates, avatars, counts: anything whose length *is* the information |
| `grow` | The column that gives way: its content truncates with "…" as the table narrows, down to 16rem, below which the table scrolls sideways. Give it a `width` weight for its share of spare room; with none it takes what the others leave | The one long text column — an Added Value's title. Use it once |
| neither | The browser sizes it (or `width` does) | Anything else — the generic default |

So narrowing the window squeezes the title first; when it cannot give any more the table scrolls horizontally (the
container, never the page). `width` percentages are *weights*, not promises — a floor always wins. `AVTable` and
`PlanningTable` use it. A tag in a cell needs `max-w-none`: a `Tag` is `max-w-full`, which would clip it.

`DataTableColumn.width` takes CSS widths (`'120px'`, `'30%'`) applied to
`<col>` — **not** the export's grid tracks; `'1fr'` has no meaning in a table.
Unsized columns share the remainder, and the container scrolls horizontally
when the table cannot fit (the page never does).

## How developers customise it

`DataTable` has no cell types. A column's `render` is `(row) => ReactNode`, so a cell is
anything you can write in JSX, closed over its row — and the system's pieces slot in
without the table knowing about them. That is the whole extension model.

| You want | Do this | Story |
|---|---|---|
| Plain text | Nothing — `key` reads `row[key]` | Default |
| A link, a tag, an avatar | `render: (r) => <a …/>`, `<Tag/>`, `<Avatar/>` | Default |
| **An actions column** | `render: (r) => <Menu items={…} trigger={<IconButton icon="dots-three" label={`Actions for ${r.id}`} />} />` | Actions Column |
| **A header that explains itself** | `hint: <ColumnHint column="owner" text="…" />` | Column Tooltips |
| **A value you copy, not follow** | `render: (r) => <CopyText text={r.id} />` — underline on hover, "Copied" for 800ms | Copyable Column |
| **A cell you edit in place** | `render: (r) => <InlineEdit label="owner" editor={<Input …/>} onConfirm={…}>{r.owner}</InlineEdit>` | Inline Editing |
| A table for one domain | A pattern in `src/patterns/` that builds `columns` and calls `DataTable` — `AVTable` is the model | — |

Three rules keep it customisable without it becoming a bag of options: the table never
sorts or fetches (rows arrive in order), it never knows a domain (a pattern owns that),
and an interactive cell is a real control inside the cell, never a whole-row click.

**An actions menu is clipped by the table's scroll container.** A `Menu` is a child of its
trigger with no portal, and the table scrolls horizontally, so a menu opened near the
bottom is cut off. Pass `className="overflow-visible"` where the table fits its space.
A portal for `Popover`/`Menu` is the real fix and is not built yet.

## Two deliberate API changes from the export

- **Sort has a direction.** The export's `sort?: string` couldn't say which
  way. The component still never sorts rows — the server or the caller does —
  it only *asks* via `onSortChange` and *shows* via `aria-sort` and a glyph —
  Figma's `_AV_Table_Sort`: `arrows-down-up` unsorted, `sort-ascending` /
  `sort-descending` sorted, 20 and `text.secondary` like the label.
- **No `onRowClick`.** The system does not offer whole-row click targets
  anywhere, for one reason: such a target is invisible to keyboards and screen
  readers, and it swallows clicks meant for controls inside cells. Put the
  row's action in a cell as a real link (`render` on the reference column is
  the idiom — see the Default story). Row hover paints `surface.brand.base`
  as a reading aid, not an affordance.

## Tokens

Container `surface.elevated` on `stroke.subtle`, `radius.md`. Header row
`surface.canvas`, labels `label-lg` sentence case in `text.secondary`. Cells
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

## Filters go above the table, in a card

`DataTable` never owns its filters or search. They sit above it, in the same card as the table, drawn by `TableCard` (see `docs/table-card.md`); the table inside is `bare` (no border or fill of its own). `AVTable` does this when given `filters`.

## A cut name says the whole of it

A first column that can truncate (`grow`) renders its text with **`TruncatedText`** (or, for a button that opens the row, `useIsTruncated` with its own `Tooltip`), so hovering or focusing a cut name shows it in full — never the browser's `title`. `AVTable` and `PlanningTable` do.

## A table that scrolls sideways is reachable by keyboard

When a table is wider than its container it scrolls sideways. A table with a control in it (a link, a button, a sortable header) needs nothing: tabbing through the controls brings the rest into view. A table of **only text** has nothing to tab to, so the scroller itself becomes a tab stop — and a named `region`, from the `caption` — **only while it scrolls**, so the arrow keys can reach the rest. A table that fits adds no stop. This is what the accessibility rule for a scrollable region asks (`scrollable-region-focusable`); the `HorizontalScrollTextOnly` story holds it.
