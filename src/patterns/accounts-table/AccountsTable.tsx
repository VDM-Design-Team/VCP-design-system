import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import { Input } from '../../atoms/input';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { Skeleton } from '../../atoms/skeleton';
import { Tag } from '../../atoms/tag';
import { DataTable, type DataTableColumn, type DataTableSort } from '../../components/data-table';
import { UserLabel } from '../../components/user-label';

/**
 * AccountsTable — the Accounts page's list of users: a search box, a table of who they are, which domains they are in and when they
 * were added, an edit and a delete button on every row, and the pages beneath. Built to Figma's `Accounts_Page_Content`
 * (`_Accounts_Table`, `Accounts_Table_Row` and `_Accounts_Row_*`).
 *
 * It is `DataTable` specialised, as `PlanningTable` and `BudgetTable` are: the generic table keeps the `<table>` semantics and the
 * sorting contract; this adds the four columns, the search and the pagination.
 *
 * - **Name** — the person's avatar, their name and, under it, their email (`UserLabel`). Sortable.
 * - **Domains** — one neutral `Tag` per domain they are in. None reads empty.
 * - **Date Added** — already formatted ("7 days ago"): this table does not do relative time. Sortable.
 * - **Actions** — edit and delete, each named for the person ("Edit John").
 *
 * **It is controlled and does nothing itself.** The caller filters by `search`, sorts by `sort`, pages by `page`, and handles
 * `onEdit` and `onDelete` — which only *ask*: opening the edit dialog, confirming the delete (`ConfirmDeleteModal`) and telling
 * the person it worked (a toast) are the page's. The page story shows the whole flow.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface AccountRow {
  id: string | number;
  name: string;
  email: string;
  /** A photo. Without one the avatar shows initials. */
  avatarSrc?: string;
  /** The domains they are in, as they should read: "Design", "BESA Content". */
  domains: readonly string[];
  /** When they were added, already formatted: "7 days ago". */
  dateAdded: string;
}

export interface AccountsTableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>,
    Pick<PaginationProps, 'page' | 'pageCount' | 'itemCount' | 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange'> {
  rows: readonly AccountRow[];
  /** The search box's text. Filtering by it is the caller's job. */
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder?: string;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** The edit button was pressed. Opening a dialog is the page's. */
  onEdit?: (row: AccountRow) => void;
  /** The delete button was pressed. Confirming, and doing it, are the page's. */
  onDelete?: (row: AccountRow) => void;
  onPageChange?: (page: number) => void;
  /** Placeholder rows instead of `rows`, while the accounts load. The search and headers stay. */
  loading?: boolean;
  /** What an empty table says. Defaults to words that depend on whether a search is active. */
  empty?: React.ReactNode;
  /** The table's accessible name. */
  caption?: string;
}

/* The row's two buttons: outlined squares, the edit glyph in the brand blue and the delete glyph in the critical red, as the
   Deliverable Link's pair is. `neutral` gives the outline; the glyph colours are set here. */
const EDIT_GLYPH = 'text-action-tertiary-content-default hover:text-action-tertiary-content-hover';
const DELETE_GLYPH = 'text-accent-critical-outline-content-default hover:text-accent-critical-outline-content-hover';

export function AccountsTable({
  className,
  rows,
  search,
  onSearchChange,
  searchPlaceholder = 'Search by name, email, or role...',
  sort,
  onSortChange,
  onEdit,
  onDelete,
  page,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  loading,
  empty,
  caption = 'Accounts',
  ...props
}: AccountsTableProps) {
  const columns: DataTableColumn<AccountRow>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '46%',
      render: (row) => <UserLabel name={row.name} description={row.email} src={row.avatarSrc} />,
    },
    {
      key: 'domains',
      label: 'Domains',
      width: '30%',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.domains.map((domain) => (
            <Tag key={domain} size="sm">
              {domain}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      key: 'dateAdded',
      label: 'Date Added',
      sortable: true,
      fit: true,
      width: '14%',
      render: (row) => <span className="whitespace-nowrap text-body-sm-medium text-text-tertiary">{row.dateAdded}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      fit: true,
      width: '10%',
      render: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            variant="neutral"
            shape="square"
            icon="note-pencil"
            label={`Edit ${row.name}`}
            className={EDIT_GLYPH}
            onClick={() => onEdit?.(row)}
          />
          <IconButton
            variant="neutral"
            shape="square"
            icon="trash"
            label={`Delete ${row.name}`}
            className={DELETE_GLYPH}
            onClick={() => onDelete?.(row)}
          />
        </div>
      ),
    },
  ];

  /* Loading: the same columns and headers, a placeholder in each cell. The skeletons are hidden from assistive tech, so one
     status says what is happening. */
  const LOADING_CELL: Record<string, React.ReactNode> = {
    name: (
      <div className="flex items-center gap-3">
        <Skeleton circle width={32} />
        <Skeleton width={120} textStyle="body-sm" />
      </div>
    ),
    domains: <Skeleton width={72} height={24} />,
    dateAdded: <Skeleton width={72} textStyle="body-sm" />,
    actions: <Skeleton width={88} height={40} />,
  };
  const placeholders: AccountRow[] = Array.from({ length: 8 }, (_, i) => ({
    id: `loading-${i}`,
    name: '',
    email: '',
    domains: [],
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
        aria-label="Search accounts"
        placeholder={searchPlaceholder}
        className="w-full max-w-108"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {loading && (
        <span role="status" className="sr-only">
          Loading accounts
        </span>
      )}
      <DataTable
        caption={caption}
        className="rounded-none border-0"
        columns={loading ? columns.map((column) => ({ ...column, render: () => LOADING_CELL[column.key] })) : columns}
        rows={loading ? placeholders : rows}
        sort={sort}
        onSortChange={onSortChange}
        empty={
          empty ??
          (search.trim() ? (
            <span>No accounts match “{search.trim()}”.</span>
          ) : (
            <span>No accounts yet.</span>
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
AccountsTable.displayName = 'AccountsTable';
