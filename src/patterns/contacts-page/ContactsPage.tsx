import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { ContactsTable, type ContactsTableProps } from '../contacts-table';

/**
 * ContactsPage — the main content of the Contact List page: the title, then the table. It goes inside `AppShell`, which draws the sidebar, the top bar and the footer. Built to Figma's `Contact List Page`.
 *
 * It is the one place the page's layout lives (the title, then the table 16 apart and 32 in from the sides, as `AVListPage` lays it out), so the app only passes the data: **`<AppShell><ContactsPage table={{…}} /></AppShell>`**.
 * The pagination is inside the table's card. **Add Account** in Figma's top bar is `TopBar`'s `primaryAction`, the page's to pass.
 *
 * **It is controlled and holds no data.** The page owns the rows, the sort, the page and the search, and what the table's buttons do (open a dialog, confirm a delete, move focus on afterwards): see
 * `docs/contacts-table.md`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ContactsPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** The page's `h1`. Figma's frame says the placeholder "Page Title"; this is "Contact List". */
  title?: string;
  /** The table: `ContactsTable`'s own props. */
  table: ContactsTableProps;
}

export function ContactsPage({ className, title = 'Contact List', table, ...props }: ContactsPageProps) {
  return (
    <div className={cn('flex min-w-0 flex-col font-sans', className)} {...props}>
      <PageTitle title={title} />
      <div className="flex min-w-0 flex-col gap-4 px-8 pb-8">
        <ContactsTable {...table} />
      </div>
    </div>
  );
}
ContactsPage.displayName = 'ContactsPage';
