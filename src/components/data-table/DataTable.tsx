import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Checkbox } from '../../atoms/checkbox';

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
  sortable?: boolean;
  align?: 'left' | 'right';
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
}

const headerCell = 'h-11 bg-surface-canvas px-2 text-left align-middle first:pl-4 last:pr-4';

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
                  className={headerCell}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => requestSort(c.key)}
                      className={cn(
                        'inline-flex w-full items-center gap-1.5 rounded-sm uppercase',
                        'text-label-sm text-text-secondary transition-colors hover:text-text-primary',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                        c.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {c.label}
                      {/* Unsorted: the both-ways glyph, faint. Sorted: the
                          direction, full strength. aria-sort carries the fact. */}
                      <Icon
                        name={sorted ? (sort!.direction === 'asc' ? 'caret-up' : 'caret-down') : 'caret-up-down'}
                        className={cn('size-3', sorted ? 'text-text-secondary' : 'text-text-subtle')}
                      />
                    </button>
                  ) : (
                    <span
                      className={cn(
                        'block uppercase text-label-sm text-text-secondary',
                        c.align === 'right' && 'text-right',
                      )}
                    >
                      {c.label}
                    </span>
                  )}
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
                className="px-4 py-12 text-center text-body-md text-text-tertiary"
              >
                {empty ?? 'Nothing here yet.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const id = rowId(row, i);
              return (
                <tr
                  key={id}
                  className={cn(
                    'border-b border-stroke-subtle transition-colors last:border-b-0',
                    'hover:bg-surface-brand-base',
                    selected.includes(id) && 'bg-surface-brand-base',
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
                    <td
                      key={c.key}
                      className={cn(cell(dense), c.align === 'right' && 'text-right')}
                    >
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
const cell = (dense?: boolean) =>
  cn(
    'px-2 align-middle text-body-md text-text-secondary first:pl-4 last:pr-4',
    dense ? 'h-11' : 'h-14',
  );
