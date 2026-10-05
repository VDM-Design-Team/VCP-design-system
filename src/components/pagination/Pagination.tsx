import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * Pagination — page numbers for a data set with pages worth naming: tables,
 * search results, anywhere "page 3 of 12" is something a user might say out
 * loud. For a carousel or wizard where pages are positions, not addresses, use
 * `PaginationDots`.
 *
 * Built to Figma's `VCP_Pagination` (`6794:12201`, aligned 5 Oct 2026), which
 * draws three versions:
 *
 * - **Tiny** (`variant="compact"`) — Previous, the numbers, Next.
 * - **Small** (`variant="default"`) — the same with **First** and **Last**
 *   either end.
 * - **Mid size** — Small, plus an **Items** per-page select and a range
 *   readout, "1-50 of 1,250". Those two are not a third variant: the readout
 *   shows whenever `itemCount` and `pageSize` are given, the select whenever
 *   `onPageSizeChange` is too.
 *
 * **Long page counts collapse to an ellipsis.** The first and last page always
 * show, with the current page and its neighbours between them — "1 2 3 4 … 25"
 * near the start, "1 … 12 13 14 … 25" in the middle. A gap of exactly one page
 * shows that page instead of an ellipsis standing in for it.
 *
 * A `<nav aria-label="Pagination">` holds the page controls; the active page
 * carries `aria-current="page"` on top of its filled treatment, and every
 * button has a spoken name ("Page 3", "Previous page", "First page"). The
 * ellipsis is hidden from assistive tech — it is not a page.
 *
 * Controls are 36 tall with the `radius.xs` corner, 6 apart — Figma's geometry.
 * Still under the 40 target: the pointer-dense exemption, as pagination lives
 * under tables.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type PaginationVariant = 'default' | 'compact';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 1-based. */
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
  /**
   * `default` has First and Last buttons either end (Figma's Small and Mid
   * size). `compact` drops them (Figma's Tiny), for tight spaces.
   */
  variant?: PaginationVariant;
  /** The total number of items. With `pageSize`, shows "1-50 of 1,250". */
  itemCount?: number;
  /** Items per page. Needed for the range readout and the Items select. */
  pageSize?: number;
  /** The Items select's choices. */
  pageSizeOptions?: readonly number[];
  /**
   * Shows the Items select. The component only reports the new size — whether
   * the page resets is the caller's call (usually back to page 1, since the
   * old page may no longer exist).
   */
  onPageSizeChange?: (pageSize: number) => void;
}

type Slot = number | 'gap-start' | 'gap-end';

/* First and last always; the current page and one either side; near either
   end, pad so four numbers sit against it — Figma's "1 2 3 4 … 25". A gap of
   one page shows the page itself, never an ellipsis standing in for it. */
function slots(page: number, pageCount: number): Slot[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const shown = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => shown.add(n));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((n) => shown.add(n));
  const numbers = [...shown].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: Slot[] = [];
  numbers.forEach((n, i) => {
    const prev = numbers[i - 1];
    if (prev !== undefined && n - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && n - prev > 2) out.push(out.length < 3 ? 'gap-start' : 'gap-end');
    out.push(n);
  });
  return out;
}

const NUMBER = new Intl.NumberFormat('en-US');

const cell = cn(
  'inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-xs border font-sans text-label-sm-medium transition-colors',
);
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused';

const quiet = cn(
  cell,
  focusRing,
  'border-stroke-default bg-surface-elevated text-text-primary',
  'hover:bg-surface-neutral-faint',
  'disabled:pointer-events-none disabled:text-text-disabled',
);

/* The active page is a fact, not a hover state — the brand fill at rest. */
const active = cn(cell, focusRing, 'border-surface-brand-strong bg-surface-brand-strong text-text-inverted-primary');

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      page,
      pageCount,
      onChange,
      variant = 'default',
      itemCount,
      pageSize,
      pageSizeOptions = [10, 25, 50, 100],
      onPageSizeChange,
      ...props
    },
    ref,
  ) => {
    const sizeSelectId = React.useId();
    const atStart = page <= 1;
    const atEnd = page >= pageCount;
    const go = (n: number) => onChange?.(Math.min(Math.max(n, 1), pageCount));

    const hasRange = itemCount !== undefined && pageSize !== undefined;
    const hasSizeSelect = pageSize !== undefined && onPageSizeChange !== undefined;
    const from = hasRange && itemCount > 0 ? (page - 1) * pageSize + 1 : 0;
    const to = hasRange ? Math.min(page * pageSize, itemCount) : 0;

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-x-8 gap-y-3', className)} {...props}>
        <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
          {variant === 'default' && (
            <button
              type="button"
              aria-label="First page"
              disabled={atStart}
              onClick={() => go(1)}
              className={cn(quiet, 'px-3')}
            >
              <Icon name="caret-double-left" size="sm" />
              First
            </button>
          )}
          <button
            type="button"
            aria-label="Previous page"
            disabled={atStart}
            onClick={() => go(page - 1)}
            className={cn(quiet, 'px-3')}
          >
            <Icon name="caret-left" size="sm" />
          </button>
          {slots(page, pageCount).map((s) =>
            typeof s === 'number' ? (
              <button
                key={s}
                type="button"
                aria-label={`Page ${s}`}
                aria-current={s === page ? 'page' : undefined}
                onClick={() => go(s)}
                className={cn(s === page ? active : quiet, 'px-3')}
              >
                {s}
              </button>
            ) : (
              /* Not a page, so not a control — hidden from assistive tech, which
                 already hears the numbers either side of it. */
              <span
                key={s}
                aria-hidden="true"
                className={cn(cell, 'border-stroke-default bg-surface-elevated px-2 text-text-primary')}
              >
                <Icon name="dots-three" size="sm" />
              </span>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={atEnd}
            onClick={() => go(page + 1)}
            className={cn(quiet, 'px-3')}
          >
            <Icon name="caret-right" size="sm" />
          </button>
          {variant === 'default' && (
            <button
              type="button"
              aria-label="Last page"
              disabled={atEnd}
              onClick={() => go(pageCount)}
              className={cn(quiet, 'px-3')}
            >
              Last
              <Icon name="caret-double-right" size="sm" />
            </button>
          )}
        </nav>

        {(hasSizeSelect || hasRange) && (
          <div className="flex items-center gap-5">
            {hasSizeSelect && (
              <div className="flex items-center gap-2">
                <label htmlFor={sizeSelectId} className="font-sans text-label-sm-medium text-text-secondary">
                  Items
                </label>
                {/* Figma's `_pagination result per page` — a pagination control,
                    not the general `Select`: same 36 height, border and type as
                    the page buttons around it. Native, so keyboard and mobile
                    pickers come for free; the caret is laid over the arrow the
                    native control would draw. */}
                <span className="relative inline-flex">
                  <select
                    id={sizeSelectId}
                    value={pageSize}
                    onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                    className={cn(quiet, 'appearance-none pl-3 pr-8')}
                  >
                    {pageSizeOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="caret-down"
                    size="sm"
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-primary"
                  />
                </span>
              </div>
            )}
            {hasRange && (
              <p className="font-sans text-label-sm-medium text-text-secondary">
                {itemCount === 0
                  ? '0 of 0'
                  : `${NUMBER.format(from)}-${NUMBER.format(to)} of ${NUMBER.format(itemCount)}`}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
Pagination.displayName = 'Pagination';
