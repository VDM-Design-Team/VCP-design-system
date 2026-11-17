import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { AccountsTable, type AccountsTableProps } from '../accounts-table';

/**
 * AccountsPage — the main content of the Accounts page: the title, then the table. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Accounts Page`.
 *
 * It is the one place the page's layout lives (the title, then the table 16 apart and 32 in from the sides, as `AVListPage` lays it out), so the app only passes the data: **`<AppShell><AccountsPage table={{…}} /></AppShell>`**.
 * The search and the pagination are inside the table's card. **Add Account** is not on the page: Figma draws it in the top bar, so it is `TopBar`'s `primaryAction`.
 *
 * **It is controlled and holds no data.** The page owns the rows, the sort, the page and the search, and what the table's buttons do (open a dialog, confirm a delete, move focus on afterwards): see
 * `docs/accounts-table.md`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface AccountsPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. Figma's frame says the placeholder "Page Title"; this is "Accounts". */
  title?: string;
  /** The table: `AccountsTable`'s own props. */
  table: AccountsTableProps;
}

export function AccountsPage({ className, title = 'Accounts', table, ...props }: AccountsPageProps) {
  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        <AccountsTable {...table} />
      </div>
    </div>
  );
}
AccountsPage.displayName = 'AccountsPage';
