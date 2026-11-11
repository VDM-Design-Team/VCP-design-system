import * as React from 'react';
import { cn } from '../../lib/cn';
import { Select } from '../../atoms/select';
import { Skeleton } from '../../atoms/skeleton';
import { StatCard, type StatCardAccent } from '../../components/stat-card';
import { CardHeader } from '../../components/card-header';

/**
 * ValueCards — the dashboard's count of Added Values by status: a titled card holding a row of `StatCard`s (Figma draws six: Completed, In
 * Review, Overdue, In Progress, Pending, Draft), with an optional "whose" filter on the right of the title ("Assigned"). Built to Figma's `Value_Cards`.
 *
 * - **It is data, not a layout.** Pass `items` (a `label`, a `value` and an `accent` each): the cards follow, each a `StatCard` in
 *   the dashboard's look (a stripe in the status's tone, left-aligned, 100 high). Which statuses a role sees is the page's:
 *   a role may see all six, or fewer.
 * - **The filter is the page's.** `filter` is `{ label, value, options, onChange }` and draws a small, quiet `Select`; the card does
 *   no counting.
 * - **It reflows with its card, not the screen** (a container query). Six cards are one row when the card is 1184 wide (six 176 cards and five gaps of 16: a 1440 window less the 256 rail), then three by two, two by three, then one column; four cards or fewer are four across, two by two, then one column.
 * - **While the figures load**, pass `loading`; with no items, `empty` says so.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ValueCardItem {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  accent?: StatCardAccent;
  /** What the info glyph says. Omit it and there is none. */
  hint?: string;
}

export interface ValueCardsFilter {
  /** What the filter is, for assistive tech ("Show"). */
  label: string;
  value: string;
  options: ReadonlyArray<string | { value: string; label: string }>;
  onChange: (value: string) => void;
}

export interface ValueCardsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: readonly ValueCardItem[];
  title?: string;
  filter?: ValueCardsFilter;
  loading?: boolean;
  /** What it says with no items. */
  empty?: React.ReactNode;
}

/* The columns by how many cards there are, each a step of the card's own width. The wide step is 71rem (1136): six 176 cards and five gaps of 16. */
const GRID = {
  few: '@md:grid-cols-2 @4xl:grid-cols-4',
  five: '@md:grid-cols-2 @xl:grid-cols-3 @min-[71rem]:grid-cols-5',
  many: '@md:grid-cols-2 @xl:grid-cols-3 @min-[71rem]:grid-cols-6',
} as const;

export const ValueCards = React.forwardRef<HTMLElement, ValueCardsProps>(
  ({ className, items, title = 'Value Cards', filter, loading, empty = 'No Added Values to count yet.', ...props }, ref) => {
    const headingId = React.useId();
    return (
      <section ref={ref} aria-labelledby={headingId} aria-busy={loading || undefined} className={cn('@container flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)} {...props}>
        <CardHeader
          title={title}
          headingId={headingId}
          actions={filter ? <Select size="sm" edge="neutral" emphasis="regular" aria-label={filter.label} className="w-36" value={filter.value} options={filter.options} onChange={filter.onChange} /> : undefined}
        />

        {loading ? (
          <>
            <span role="status" className="sr-only">
              Loading {title}
            </span>
            <div className={cn('grid grid-cols-1 gap-4', GRID.many)}>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} height={100} />
              ))}
            </div>
          </>
        ) : items.length === 0 ? (
          <p className="m-0 text-body-sm-regular text-text-secondary">{empty}</p>
        ) : (
          <div className={cn('grid grid-cols-1 gap-4', items.length > 4 ? (items.length === 5 ? GRID.five : GRID.many) : GRID.few)}>
            {items.map((item) => (
              <StatCard key={item.key} label={item.label} value={item.value} accent={item.accent} hint={item.hint} />
            ))}
          </div>
        )}
      </section>
    );
  },
);
ValueCards.displayName = 'ValueCards';
