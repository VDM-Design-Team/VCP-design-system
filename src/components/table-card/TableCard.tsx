import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * TableCard — the card a table sits in: **the filters above the table, the table, and its pagination, in one card**. It is the one place that says where a table's filters go, so every table reads the same: filters
 * **above** the table, **outside** `DataTable` (which never owns them), **inside the same card** as the rows — not a separate row floating over a table that has its own border.
 *
 * Put a `DataTable` with `bare` inside (it then drops its own border, radius and fill, as the card draws them), the filters in `filters` (a `FilterBar`, a search box, a row of selects — whatever the page needs) and the
 * pagination in `footer`. The card is `surface.elevated`, `radius.md`, 16 all round with 16 between the parts. A piece with nothing in it (no filters, no footer) leaves no gap.
 *
 * It owns no state and no logic: filtering, sorting and paging are the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface TableCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The filters or search, above the table. */
  filters?: React.ReactNode;
  /** The pagination (and anything else under the table), right-aligned. */
  footer?: React.ReactNode;
  /** The table — a `DataTable` with `bare`. */
  children: React.ReactNode;
}

export const TableCard = React.forwardRef<HTMLDivElement, TableCardProps>(({ className, filters, footer, children, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-4 rounded-md bg-surface-elevated p-4 font-sans', className)} {...props}>
    {filters}
    {children}
    {footer && <div className="flex justify-end">{footer}</div>}
  </div>
));
TableCard.displayName = 'TableCard';
