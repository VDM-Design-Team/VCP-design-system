import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { TaskLogTrail, type TaskLogTrailProps } from '../task-log-trail';

/**
 * TaskLogPage — the main content of the Task Log Trail page: the title, then the table. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Task Log Trail` page.
 *
 * It is the one place the page's layout lives (the title, then the table 16 apart and 32 in from the sides, as `AVListPage` lays it out), so the app only passes the data: **`<AppShell><TaskLogPage table={{…}} /></AppShell>`**.
 * The filters (a `FilterBar`, through `table.filters`) and the pagination are inside the table's card.
 *
 * **It is controlled and holds no data.** The page owns the rows, the sort, the page and the search, and what the table's buttons do (open a dialog, confirm a delete, move focus on afterwards): see
 * `docs/task-log-trail.md`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface TaskLogPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. Figma's frame says the placeholder "Page Title"; this is "Task Log Trail". */
  title?: string;
  /** The table: `TaskLogTrail`'s own props. */
  table: TaskLogTrailProps;
}

export function TaskLogPage({ className, title = 'Task Log Trail', table, ...props }: TaskLogPageProps) {
  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        <TaskLogTrail {...table} />
      </div>
    </div>
  );
}
TaskLogPage.displayName = 'TaskLogPage';
