import * as React from 'react';
import { cn } from '../../lib/cn';
import { MyValuesStats, type MyValuesStatsProps } from '../../components/my-values-stats';
import { PageTitle } from '../../components/page-title';
import { TableEmpty } from '../../components/table-empty';
import { AVTable, type AVTableProps } from '../av-table';
import { FilterBar, type FilterBarProps } from '../filter-bar';

/**
 * AVListPage — the main content of a page that lists Added Values: the title, an optional strip of totals, and the table with its filters. It goes inside
 * `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's list pages: **My Values**, **Assigned**, **Drafts**, **Manage Added Value** and the
 * three **Archive** tabs (Completed, Rejected, Backlogged).
 *
 * **One layout, and the pages differ by what they pass** (the same typed sections as `DashboardPage`):
 *
 * - **My Values** passes `stats` (the totals strip, `MyValuesStats`) and `table.actions` (the ⋯ column).
 * - **Assigned** passes a title ("Assigned Values") and a table: the plain page.
 * - **The Archive tabs** are titled "Archived Values: Completed", "…: Rejected" and "…: Backlogged", and filter by **Priority, Tags and Date** only: each tab holds one status, so there is no Status filter.
 * - **Drafts** passes `table.selectable` (the checkbox column).
 * - **Manage Added Value** passes a `filters` with the Assignee and Initiator fields.
 * - **In the Development domain**, **Manage** and **Assigned** also pass a `cycle` filter, preselected to the current cycle so nobody has to pick it (it can still be changed).
 *
 * **The filters sit inside the table's card**, above the rows (`TableCard`'s rule, as `AccountsTable` and `TaskLogTrail` do): the search, **Reset** and **Filters** button, then the
 * field row the button opens. Figma draws them on the canvas above the card; the system puts them in it, so every table reads the same.
 *
 * **An empty table says why**, through `TableEmpty` ("No added values yet.", or "No added values match “…”." with **Reset** while a search is typed). Pass `table.empty` for other words.
 *
 * **It is controlled and holds no data.** The page owns the rows, the sort, the page, the search and which filters are open; this puts them in order, 16 apart and 32 in
 * from the sides.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AVListPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`: "My Values", "Assigned Values", "Drafts"… */
  title: string;
  /** The totals strip above the table. Only My Values has one. */
  stats?: MyValuesStatsProps;
  /** The search, Reset, the Filters button and the field row, in the table's card. Leave it out and the table has no filters. */
  filters?: FilterBarProps;
  /** The table: `AVTable`'s own props, without `filters` (those are the `filters` above). */
  table: Omit<AVTableProps, 'filters'>;
}

export function AVListPage({ className, title, stats, filters, table, ...props }: AVListPageProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const search = filters?.search;
  const onReset = filters?.onReset;
  /* With nothing to show the table says why, in the system's words: nothing yet, or (while a search is typed) nothing matches it. Its Reset puts the filters back
     and then goes away, so focus is handed to the search box, which stays. */
  const empty =
    table.empty ??
    (
      <TableEmpty
        noun="added values"
        search={search}
        onReset={
          onReset &&
          (() => {
            onReset();
            window.requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('input[type="search"]')?.focus());
          })
        }
      />
    );
  return (
    <div ref={root} className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        {stats && <MyValuesStats {...stats} />}
        <AVTable {...table} empty={empty} filters={filters ? <FilterBar {...filters} /> : undefined} />
      </div>
    </div>
  );
}
AVListPage.displayName = 'AVListPage';
