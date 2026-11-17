import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { HolidayTable, type HolidayTableProps } from '../holiday-table';

/**
 * HolidayRegistryPage — the main content of the Holiday Registry page: the title, then the table. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's
 * `Holiday Registry` page (the admin and the normal-user views, and the empty state).
 *
 * It is the one place the page's layout lives (the title, then the table 16 apart and 32 in from the sides, as `AVListPage` lays it out), so the app only passes the data:
 * **`<AppShell><HolidayRegistryPage table={{…}} /></AppShell>`**. The filters, **Add Holiday**, **Import from Hubstaff** and the pagination are inside the table's card.
 *
 * **It is controlled and holds no data.** The page owns the rows, the filters, the sort and the page, and what the table's buttons do (open `HolidayModal`, confirm a removal, move focus on afterwards):
 * see `docs/holiday-table.md`. `table.admin` is what makes it the admin's page.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface HolidayRegistryPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. */
  title?: string;
  /** The table: `HolidayTable`'s own props. */
  table: HolidayTableProps;
}

export function HolidayRegistryPage({ className, title = 'Holiday Registry', table, ...props }: HolidayRegistryPageProps) {
  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        <HolidayTable {...table} />
      </div>
    </div>
  );
}
HolidayRegistryPage.displayName = 'HolidayRegistryPage';
