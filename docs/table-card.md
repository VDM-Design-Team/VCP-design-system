# TableCard

The card a table sits in: **filters above the table, the table, then its pagination, all in one card.** It is the one place that says where a table's filters go. It draws the surface (`surface.elevated`, `radius.md`, `space.24` all round, `space.16` between its parts) and owns no state.

## Composed of

| Piece | Tier |
|---|---|

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `TableCard` | A table with filters, a search box or pagination |
| `DataTable` alone | A table that is a quiet part of a larger card (inside a detail panel) |
| `PlanningTable` | Sectioned tables: filters sit above all the sections, each section keeps its own card |

## The rule

- **Filters and search go above the table, outside `DataTable`.** `DataTable` never owns them.
- **The table inside keeps rounded corners** (`radius.md`, 8, the card's own), so a header band or a hovered row is not square against the card's padding.
- **They share the table's card.** The card is drawn here, once; the `DataTable` inside is `bare` (no border or fill of its own).
- **Pagination goes in `footer`**, at the end, right-aligned.

## Props

| Prop | Type | Notes |
|---|---|---|
| `filters` | `ReactNode` | Above the table. Nothing renders (and no gap) when omitted |
| `footer` | `ReactNode` | Below the table, right-aligned. Nothing renders when omitted |
| `children` | `ReactNode` | The table: a `DataTable` with `bare` |
| `className` | `string` | On the card |

## Accessibility

The card adds no role: the table keeps its own caption and the filters their own labels. Tab order is filters, table, pagination, the reading order.

## Don't

- **Don't put the filters inside `DataTable`.** It has no slot for them on purpose.
- **Don't give the table inside a border.** Use `bare`; the card is the edge.
- **Don't nest it in another card.**
