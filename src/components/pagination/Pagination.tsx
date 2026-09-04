import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * Pagination — page numbers for a data set with pages worth naming: tables,
 * search results, anywhere "page 3 of 12" is something a user might say out
 * loud. For a carousel or wizard where pages are positions, not addresses, use
 * `PaginationDots`.
 *
 * A `<nav aria-label="Pagination">`; the active page carries
 * `aria-current="page"` on top of its filled treatment, and every button has a
 * spoken name ("Page 3", "Previous page"). The trailing "Page 3 of 12" is
 * visible text — it restates position for sighted users scanning past the
 * number row.
 *
 * The window shows at most five numbers, centred on the current page and
 * clamped to the ends — the export's rule, kept. There is deliberately no
 * first/last-plus-ellipsis variant: at the page counts VCP's tables actually
 * reach, five numbers plus the arrows cover it. If a genuine thousand-page set
 * appears, extend this component rather than composing around it.
 *
 * Controls are 36 tall with the `radius.xs` inner-cell corner — the Figma
 * `VCP_Pagination` geometry (design audit, 3 Sep 2026). Still under the 40
 * target: the pointer-dense exemption, as pagination lives under tables.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 1-based. */
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
}

const pageButton = cn(
  'grid h-9 min-w-9 place-items-center rounded-xs px-2 font-sans text-label-md transition-colors',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

const quiet = cn(
  'border border-stroke-subtle bg-surface-elevated text-text-secondary',
  'hover:bg-surface-neutral-faint',
  'disabled:pointer-events-none disabled:text-text-disabled',
);

/* The active page is a fact, not a hover state — action.primary at rest. */
const active = cn(
  'border border-action-primary-surface-default bg-action-primary-surface-default',
  'text-action-primary-content-default',
);

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, page, pageCount, onChange, ...props }, ref) => {
    /* At most five numbers, centred on the page, clamped to the ends. */
    const from = Math.max(1, Math.min(page - 2, pageCount - 4));
    const to = Math.min(pageCount, from + 4);
    const numbers = [];
    for (let n = from; n <= to; n++) numbers.push(n);

    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={cn('flex flex-wrap items-center gap-1.5', className)}
        {...props}
      >
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange?.(page - 1)}
          className={cn(pageButton, quiet)}
        >
          <Icon name="caret-left" size="sm" />
        </button>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Page ${n}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onChange?.(n)}
            className={cn(pageButton, n === page ? active : quiet)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onChange?.(page + 1)}
          className={cn(pageButton, quiet)}
        >
          <Icon name="caret-right" size="sm" />
        </button>
        {/* Restates position in words; hidden from screen readers, which get
            the same fact from aria-current. */}
        <span aria-hidden="true" className="ml-2 text-body-sm text-text-tertiary">
          Page {page} of {pageCount}
        </span>
      </nav>
    );
  },
);
Pagination.displayName = 'Pagination';
