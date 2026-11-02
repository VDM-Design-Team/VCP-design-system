import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { Checkbox } from '../../atoms/checkbox';
import { Tooltip } from '../../atoms/tooltip';

/**
 * DataTable — the generic table: columns, rows, sortable headers, optional
 * row selection, an empty slot. The four VCP tables (Planning, Budget,
 * Holiday, Availability) will specialise this in `src/patterns/`; domain
 * columns and threshold logic belong there, never here.
 *
 * The export drew a CSS-grid of divs. Rebuilt on a real `<table>` — column
 * headers with `scope="col"`, `aria-sort` on the sorted one — because table
 * navigation (cell-by-cell, "column 3 of 7, Supplier") is assistive tech's
 * whole affordance for tabular data, and a div grid provides none of it.
 * Two API consequences:
 *
 * - **Sort has a direction.** The export's `sort?: string` could not say
 *   which way. Here `sort` is `{ key, direction }`, clicking a sorted header
 *   flips it, and the component still never sorts rows itself — the order of
 *   `rows` is the order rendered; sorting is the caller's (or the server's).
 * - **No `onRowClick`.** Same decision as Card, for the same reason: a
 *   whole-row click target hides the real action from keyboards and screen
 *   readers. Give a column a `render` with the actual link or button.
 *
 * **Everything reads left-aligned**, headers and cell values alike. There is no
 * `align` option: right-aligned numbers are a spreadsheet habit, and the VCP
 * design never draws them (design review, October 2026).
 *
 * **Headers are `label-lg`, sentence case.** They were `label-sm` uppercase
 * until 11 September 2026, which came from the original export and matched
 * nothing: every header in the VCP Figma library is drawn `ORIGINAL` case at
 * 14 medium, the AV table's nine included. Measured, not assumed —
 * docs/figma-audit.md, batch 5. Note that the repo's type ramp and Figma's
 * share names but not values: Figma's `label-sm` is 14, this repo's is 11.
 * Match by *value* when reading a spec off the canvas.
 *
 * `width` takes CSS widths for `<col>` ('120px', '30%'), not the export's ds-lint-ignore
 * grid tracks — '1fr' has no meaning in a table. Unsized columns share the
 * remainder. The container scrolls horizontally when the table cannot fit.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DataTableColumn<Row> {
  key: string;
  label: string;
  /** CSS width for the `<col>` — '120px', '30%'. Unsized columns share the rest. ds-lint-ignore */
  width?: string;
  /**
   * **Never narrower than its content.** Cells and header stay on one line — not wrapped, not cut with
   * "…" — so the column's floor is its widest cell. Above that floor it shares the table's spare room
   * like any column (by its `width` weight, or its content's length without one); the table scrolls
   * sideways only when even the floors do not fit. Use it for tags, dates, avatars, counts: anything
   * whose length is the information.
   */
  fit?: boolean;
  /**
   * **The column that gives way.** Its content truncates with "…" as the table narrows, down to a floor
   * (16rem) — below which the table scrolls sideways instead. Use it once, for the long text (an Added
   * Value's title) that is almost always longer than its header. Give it a `width` weight to say how
   * much of the spare room it takes; with none it takes what the others leave.
   */
  grow?: boolean;
  sortable?: boolean;
  /**
   * Rendered after the label and **before** the sort arrows — a tooltip
   * trigger, a count, a badge: "Label ⓘ ⇅". It is outside the sort button,
   * because a header that both sorts and explains would otherwise nest one
   * interactive element inside another, which is invalid and unreachable by
   * keyboard.
   */
  hint?: React.ReactNode;
  /** Cell content. Defaults to `row[key]` rendered as text. */
  render?: (row: Row) => React.ReactNode;
}

export interface DataTableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<Row extends { id?: string | number }>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: ReadonlyArray<DataTableColumn<Row>>;
  /** Rendered in the order given — sorting is the caller's job. */
  rows: readonly Row[];
  /** The column and direction the caller sorted by. */
  sort?: DataTableSort;
  /** Clicking an unsorted sortable header asks for `asc`; clicking again flips. */
  onSortChange?: (sort: DataTableSort) => void;
  /** Adds the leading checkbox column with a select-all header. */
  selectable?: boolean;
  /** Selected row ids (`row.id`, falling back to the row index). */
  selected?: ReadonlyArray<string | number>;
  onSelectedChange?: (ids: Array<string | number>) => void;
  /**
   * Accessible name for a row's checkbox. Give it the row's real name —
   * "Select AV-2041" — or every checkbox announces alike.
   */
  selectLabel?: (row: Row) => string;
  /** Shown when `rows` is empty — an `<EmptyState>` fits. */
  empty?: React.ReactNode;
  /** 44 rows instead of 56 — audit-style density. */
  dense?: boolean;
  /** Names the table for assistive tech. Strongly encouraged. */
  caption?: string;
  /**
   * Extra attributes for a row's `<tr>` — a drag source, a data attribute. `className` is merged with
   * the row's own; the handlers are yours. The row stays a plain row: nothing here makes it a control.
   */
  rowProps?: (row: Row) => React.HTMLAttributes<HTMLTableRowElement>;
}

const headerCell = 'h-11 bg-surface-canvas px-2 text-left align-middle first:pl-4 last:pr-4';

/* Label and hint side by side. `gap-1.5` is the Figma header's own 6. */
const headerInner = 'flex items-center gap-1.5';

/**
 * The glyph that explains a column — Figma's header `ⓘ` (or, with `icon="function"`, the ƒ in a ring that marks a formula column). Pass it as a
 * column's `hint`: it sits beside the label, outside the sort button, and opens
 * `text` in a tooltip on hover **and** on keyboard focus. There is no default
 * copy; the product says what the column is for. With no `text` it renders
 * nothing, so a conditional hint needs no conditional.
 */
export function ColumnHint({
  text,
  column,
  icon = 'info',
}: {
  text?: React.ReactNode;
  column: string;
  /** The glyph. `info` (ⓘ) by default; the Planning table marks its editable, formula-linked columns with `function`. */
  icon?: IconName;
}) {
  if (!text) return null;
  return (
    <Tooltip
      content={
        typeof text === 'string' && text.includes('\n')
          ? text.split('\n').map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))
          : text
      }
      placement="bottom"
      wide={typeof text !== 'string' || text.includes('\n')}
    >
      <button
        type="button"
        aria-label={`About ${column}`}
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded-sm',
          /* `function` is the formula columns' mark (Figma's `_function_tooltip_icon`): a ƒ in a ring, in
             brand blue, where the info glyph is a quiet grey. */
          icon === 'function'
            ? 'text-text-brand-medium hover:text-text-brand-strong'
            : 'text-text-tertiary hover:text-text-secondary',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
        )}
      >
        {icon === 'function' ? (
          /* The ring is drawn as wide as the ⓘ's own circle (12 inside its 16), so the two marks match. */
          <span className="grid size-3 place-items-center rounded-pill border border-current">
            <Icon name="function" size={10} />
          </span>
        ) : (
          <Icon name={icon} size="sm" />
        )}
      </button>
    </Tooltip>
  );
}

export function DataTable<Row extends { id?: string | number }>({
  className,
  columns,
  rows,
  sort,
  onSortChange,
  selectable,
  selected = [],
  onSelectedChange,
  selectLabel,
  empty,
  dense,
  caption,
  rowProps,
  ...props
}: DataTableProps<Row>) {
  const rowId = (row: Row, index: number) => row.id ?? index;
  const allOn = rows.length > 0 && selected.length === rows.length;
  const someOn = selected.length > 0 && !allOn;

  const toggleAll = () =>
    onSelectedChange?.(allOn ? [] : rows.map((r, i) => rowId(r, i)));
  const toggleOne = (id: string | number) =>
    onSelectedChange?.(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
    );

  const requestSort = (key: string) =>
    onSortChange?.({
      key,
      direction: sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc',
    });

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-md border border-stroke-subtle bg-surface-elevated font-sans',
        className,
      )}
      {...props}
    >
      <table className="w-full border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <colgroup>
          {/* The checkbox column is a fixed 40 gutter. */}
          {selectable && <col style={{ width: '40px' }} /> /* ds-lint-ignore */}
          {columns.map((c) => (
            <col key={c.key} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-stroke-subtle">
            {selectable && (
              <th scope="col" className={headerCell}>
                <Checkbox
                  aria-label="Select all rows"
                  checked={allOn}
                  indeterminate={someOn}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((c) => {
              const sorted = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={
                    sorted ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cn(headerCell, columnSizing(c))}
                >
                  {/* Label, then the hint, then the sort arrows — in that order, as
                      Figma draws a header that has both. The sort button is the
                      label alone; its `::after` stretches over the whole row so a
                      click on the arrows sorts too, and the hint (raised above the
                      overlay) keeps its own click. One tab stop per control. */}
                  <span className={cn(headerInner, 'group/sort relative w-fit')}>
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => requestSort(c.key)}
                        className={cn(
                          'rounded-sm text-label-sm-medium text-text-secondary transition-colors',
                          'group-hover/sort:text-text-primary',
                          'after:absolute after:-inset-1 after:rounded-sm',
                          'focus-visible:after:outline-2 focus-visible:after:outline-offset-0 focus-visible:after:outline-stroke-focused',
                        )}
                      >
                        {c.label}
                      </button>
                    ) : (
                      <span className="text-label-sm-medium text-text-secondary">{c.label}</span>
                    )}
                    {c.hint && <span className="relative z-10 inline-flex">{c.hint}</span>}
                    {c.sortable && (
                      /* Figma's `_AV_Table_Sort`: arrows-down-up unsorted,
                         sort-ascending / sort-descending sorted — 20, in
                         text.secondary like the label. aria-sort carries the
                         fact; the glyph is decoration, and it is not a second
                         button — the label's overlay is what you click. */
                      <Icon
                        name={
                          sorted
                            ? sort!.direction === 'asc'
                              ? 'sort-ascending'
                              : 'sort-descending'
                            : 'arrows-down-up'
                        }
                        size="md"
                        className="shrink-0 text-text-secondary transition-colors group-hover/sort:text-text-primary"
                      />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-body-sm-regular text-text-tertiary"
              >
                {empty ?? 'Nothing here yet.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const id = rowId(row, i);
              const extra = rowProps?.(row);
              return (
                <tr
                  key={id}
                  {...extra}
                  className={cn(
                    'border-b border-stroke-subtle transition-colors last:border-b-0',
                    'hover:bg-surface-brand-base',
                    selected.includes(id) && 'bg-surface-brand-base',
                    extra?.className,
                  )}
                >
                  {selectable && (
                    <td className={cell(dense)}>
                      <Checkbox
                        aria-label={selectLabel?.(row) ?? `Select row ${id}`}
                        checked={selected.includes(id)}
                        onChange={() => toggleOne(id)}
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn(cell(dense), 'text-left', columnSizing(c))}>
                      {c.render
                        ? c.render(row)
                        : ((row as Record<string, unknown>)[c.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* 56 rows by default, 44 dense — the export's two densities, as min-heights so
   a tall cell can grow. */
/* `fit`: no wrapping, so the column's floor is its content. `grow`: `max-w-0` so its own content truncates
   instead of widening the column, with a floor of its own — and the rest of the row unless it was given a
   `width` weight. */
const columnSizing = (c: { fit?: boolean; grow?: boolean; width?: string }) =>
  c.grow ? cn('min-w-64 max-w-0', !c.width && 'w-full') : c.fit ? 'whitespace-nowrap' : undefined;

const cell = (dense?: boolean) =>
  cn(
    'px-2 align-middle text-body-sm-regular text-text-secondary first:pl-4 last:pr-4',
    dense ? 'h-11' : 'h-14',
  );
