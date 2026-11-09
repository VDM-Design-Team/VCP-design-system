import * as React from 'react';
import { cn } from '../../lib/cn';
import { Select } from '../../atoms/select';
import { Skeleton } from '../../atoms/skeleton';
import { StatCard, type StatCardAccent } from '../../components/stat-card';

/**
 * ValueCards — the dashboard's count of Added Values by status: a titled card holding a row of `StatCard`s (Overdue, In Progress,
 * Pending, Draft), with an optional "whose" filter on the right of the title ("Assigned"). Built to Figma's `Value_Cards`.
 *
 * - **It is data, not a layout.** Pass `items` (a `label`, a `value` and an `accent` each): the cards follow, each a `StatCard` in
 *   the dashboard's look (a stripe in the status's tone, left-aligned, 100 high). Which statuses a role sees is the page's:
 *   a dev admin's has four, a user's the same, a design user's may differ.
 * - **The filter is the page's.** `filter` is `{ label, value, options, onChange }` and draws a small, quiet `Select`; the card does
 *   no counting.
 * - **It reflows with its card, not the screen** (a container query): four across when there is room, two by two, then one column.
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

export const ValueCards = React.forwardRef<HTMLElement, ValueCardsProps>(
  ({ className, items, title = 'Value Cards', filter, loading, empty = 'No Added Values to count yet.', ...props }, ref) => {
    const headingId = React.useId();
    return (
      <section ref={ref} aria-labelledby={headingId} aria-busy={loading || undefined} className={cn('@container flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)} {...props}>
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 id={headingId} className="m-0 text-title-sm-semibold text-text-primary">
            {title}
          </h2>
          {filter && <Select size="sm" edge="neutral" emphasis="regular" aria-label={filter.label} className="w-36" value={filter.value} options={filter.options} onChange={filter.onChange} />}
        </header>

        {loading ? (
          <>
            <span role="status" className="sr-only">
              Loading {title}
            </span>
            <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} height={100} />
              ))}
            </div>
          </>
        ) : items.length === 0 ? (
          <p className="m-0 text-body-sm-regular text-text-secondary">{empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-4">
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
