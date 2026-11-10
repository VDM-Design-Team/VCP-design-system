import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { Skeleton } from '../../atoms/skeleton';
import { AccountStatusTag } from '../../components/account-status-tag';
import { DataTable, type DataTableColumn, type DataTableSort } from '../../components/data-table';
import { EmptyState } from '../../components/empty-state';
import { UserLabel } from '../../components/user-label';

/**
 * UsersTable — the Settings Users tab's list: a search box, a table of who they are, their status and when they were added, a
 * **View** button on every row, **+ New User** in the Actions header, and the pages beneath. Built to Figma's `Settings_Users`.
 *
 * It is `DataTable` specialised, as `AccountsTable` is:
 *
 * - **Name** — the person's avatar, their name and, under it, their email (`UserLabel`). Sortable.
 * - **Status** — the account's status as an `AccountStatusTag`: Approved (green), Pending (yellow) or Inactive (grey). Sortable.
 *   **`AccountStatusTag` owns the statuses and their colours**, so neither this table nor a call site chooses one.
 * - **Date Added** — already formatted ("4 months ago"): a Date Added column is the written exception to dd/mm/yyyy. Sortable.
 * - **Actions** — **+ New User** in the header and **View** on each row, named for the person ("View John"). Both sit at the end of the column.
 *
 * **It is controlled and does nothing itself.** The caller filters by `search`, sorts by `sort`, pages by `page`, and handles
 * `onNewUser` and `onView` — which only *ask*: the page opens `UserAccountModal` (Create New User / View User).
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface UserRow {
  id: string | number;
  name: string;
  email: string;
  /** A photo. Without one the avatar shows initials. */
  avatarSrc?: string;
  /** Their account status: "approved", "pending" or "inactive" (`AccountStatusTag` shows it). */
  status: string;
  /** When they were added, already formatted: "4 months ago". */
  dateAdded: string;
}

export interface UsersTableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>,
    Pick<PaginationProps, 'page' | 'pageCount' | 'itemCount' | 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange'> {
  rows: readonly UserRow[];
  /** The search box's text. Filtering by it is the caller's job. */
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder?: string;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** + New User was pressed. Opening the dialog is the page's. */
  onNewUser?: () => void;
  /** A row's View was pressed. Opening the dialog is the page's. */
  onView?: (row: UserRow) => void;
  onPageChange?: (page: number) => void;
  /** Placeholder rows instead of `rows`, while the users load. The search, the headers and + New User stay. */
  loading?: boolean;
  /** What an empty table says. Defaults to words that depend on whether a search is active. */
  empty?: React.ReactNode;
  /** The table's accessible name. */
  caption?: string;
}

export function UsersTable({
  className,
  rows,
  search,
  onSearchChange,
  searchPlaceholder = 'Search by name, email, or role...',
  sort,
  onSortChange,
  onNewUser,
  onView,
  page,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  loading,
  empty,
  caption = 'Users',
  ...props
}: UsersTableProps) {
  const columns: DataTableColumn<UserRow>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '50%',
      render: (row) => <UserLabel name={row.name} description={row.email} src={row.avatarSrc} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      fit: true,
      width: '18%',
      render: (row) => <AccountStatusTag status={row.status} />,
    },
    {
      key: 'dateAdded',
      label: 'Date Added',
      sortable: true,
      fit: true,
      width: '20%',
      render: (row) => <span className="whitespace-nowrap text-body-sm-medium text-text-tertiary">{row.dateAdded}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      fit: true,
      width: '12%',
      action: (
        <Button size="sm" type="button" iconLeft={<Icon name="plus" size="sm" />} onClick={() => onNewUser?.()}>
          New User
        </Button>
      ),
      render: (row) => (
        <div className="flex justify-end">
          <Button size="sm" type="button" aria-label={`View ${row.name}`} onClick={() => onView?.(row)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  const LOADING_CELL: Record<string, React.ReactNode> = {
    name: (
      <div className="flex items-center gap-3">
        <Skeleton circle width={32} />
        <Skeleton width={120} textStyle="body-sm" />
      </div>
    ),
    status: <Skeleton width={72} height={24} />,
    dateAdded: <Skeleton width={72} textStyle="body-sm" />,
    actions: <Skeleton width={64} height={36} />,
  };
  const placeholders: UserRow[] = Array.from({ length: 8 }, (_, i) => ({
    id: `loading-${i}`,
    name: '',
    email: '',
    status: '',
    dateAdded: '',
  }));

  return (
    <div
      className={cn('flex flex-col gap-4 rounded-md bg-surface-elevated p-4 font-sans', className)}
      aria-busy={loading || undefined}
      {...props}
    >
      <Input
        type="search"
        aria-label="Search users"
        placeholder={searchPlaceholder}
        leadingIcon={<Icon name="magnifying-glass" size="sm" />}
        className="w-full max-w-108"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {loading && (
        <span role="status" className="sr-only">
          Loading users
        </span>
      )}
      <DataTable
        caption={caption}
        className="rounded-none border-0"
        /* Loading swaps each cell for a placeholder and leaves the header alone: + New User stays, so focus returning to it after a create has somewhere to land. */
        columns={loading ? columns.map((column) => ({ ...column, render: () => LOADING_CELL[column.key] })) : columns}
        rows={loading ? placeholders : rows}
        sort={sort}
        onSortChange={onSortChange}
        empty={
          empty ??
          (search.trim() ? (
            <EmptyState
              icon={<Icon name="magnifying-glass" size="lg" />}
              title={`No users match “${search.trim()}”.`}
              description="Try a different name, email or role."
            />
          ) : (
            <EmptyState icon={<Icon name="users" size="lg" />} title="No users yet." />
          ))
        }
      />

      <div className="flex justify-end">
        <Pagination
          page={page}
          pageCount={pageCount}
          onChange={onPageChange}
          itemCount={itemCount}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
UsersTable.displayName = 'UsersTable';
