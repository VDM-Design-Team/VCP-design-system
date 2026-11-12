import * as React from 'react';
import { cn } from '../../lib/cn';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { PageTitle } from '../../components/page-title';
import { PlanningFilters, type PlanningFiltersProps } from '../planning-filters';
import { PlanningTable, type PlanningTableProps } from '../planning-table';

/**
 * PlanningPage — the main content of the Planning page: the title, the filter row, the Cycle and Backlog sections, and the pages beneath. It goes inside `AppShell`, which draws the
 * sidebar, the top bar and the footer. Built to Figma's `Planning Page` (the `Planning List`, with its inline-editing and drag-from-Backlog flows).
 *
 * **One layout, typed sections** (as `AVListPage` and `DashboardPage` are): a section shows only when it is passed. The filters and the pagination are optional; the table is not.
 *
 * - **The filters sit on the canvas above the sections**, not inside a card, as Figma draws them: each Cycle and the Backlog is its own card, so there is no one card to put them in.
 * - **The pagination sits under the last section**, on the right, as Figma draws it.
 * - **Everything the table does stays the table's**: editing a date or points in place, dragging a Backlog row onto a Cycle (or the Actions menu's **Move to Cycle** submenu), the sort, folding. The page only lays them out.
 *
 * **It is controlled and holds no data.** The page owns the sections and their rows, the filters, the sort, the page, and what moving a row does (in the design a Backlog row dropped on a Cycle opens *Add Required Details*,
 * `MoveAVToCycleModal`; the move happens when that is confirmed). This puts them in order, 16 apart and 32 in from the sides.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface PlanningPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. Figma's frame says "Planning List". */
  title?: string;
  /** The search, status and priority filters, Reset and View Cycle (`PlanningFilters`' props). Leave it out and the page has none. */
  filters?: PlanningFiltersProps;
  /** The Cycle and Backlog sections: `PlanningTable`'s own props. */
  table: PlanningTableProps;
  /** The pages beneath the last section (`Pagination`'s props). Leave it out and there are none. */
  pagination?: PaginationProps;
}

export function PlanningPage({ className, title = 'Planning List', filters, table, pagination, ...props }: PlanningPageProps) {
  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        {filters && <PlanningFilters {...filters} />}
        <PlanningTable {...table} />
        {pagination && (
          <div className="flex justify-end">
            <Pagination {...pagination} />
          </div>
        )}
      </div>
    </div>
  );
}
PlanningPage.displayName = 'PlanningPage';
