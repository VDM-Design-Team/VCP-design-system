import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { Skeleton } from '../../atoms/skeleton';
import { DataTable, type DataTableColumn, type DataTableSort } from '../../components/data-table';
import { EmptyState } from '../../components/empty-state';
import { UserLabel } from '../../components/user-label';

/**
 * ManualsTable — the Settings Manuals tab's list: each manual's name, who uploaded it, its attachments and when it was added, and the
 * pages beneath. Built to Figma's `Manuals_Table` (`Filled=Yes` / `Filled=No`) and its row cells in the Design Library
 * (`_Manuals_Settings_Table_*`).
 *
 * It is `DataTable` specialised, as `UsersTable` is:
 *
 * - **Name** — the manual's name. Sortable. (Figma's row sketch draws an avatar here; a manual has a name, so it is text.)
 * - **Uploaded by** — the person's avatar, name and email (`UserLabel`).
 * - **Attachments** — how many files it carries. Figma draws no content for this column yet.
 * - **Date Added** — already formatted ("4 months ago").
 *
 * No search and no row buttons: Figma draws neither. **Add Manual** is a page-header action (the top bar), not the table's.
 * **It is controlled and does nothing itself**: the caller sorts by `sort` and pages by `page`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface ManualRow {
  id: string | number;
  name: string;
  /** Who uploaded it. */
  uploadedBy: { name: string; email: string; avatarSrc?: string };
  /** How many files it carries. */
  attachmentCount: number;
  /** When it was added, already formatted: "4 months ago". */
  dateAdded: string;
}

export interface ManualsTableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>,
    Pick<PaginationProps, 'page' | 'pageCount' | 'itemCount' | 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange'> {
  rows: readonly ManualRow[];
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  onPageChange?: (page: number) => void;
  /** Placeholder rows instead of `rows`, while the manuals load. The headers stay. */
  loading?: boolean;
  /** What an empty table says. Defaults to Figma's "No items." */
  empty?: React.ReactNode;
  /** The table's accessible name. */
  caption?: string;
}

export function ManualsTable({
  className,
  rows,
  sort,
  onSortChange,
  page,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  loading,
  empty,
  caption = 'Manuals',
  ...props
}: ManualsTableProps) {
  const columns: DataTableColumn<ManualRow>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '30%',
      render: (row) => <span className="text-body-sm-medium text-text-primary">{row.name}</span>,
    },
    {
      key: 'uploadedBy',
      label: 'Uploaded by',
      width: '30%',
      render: (row) => (
        <UserLabel name={row.uploadedBy.name} description={row.uploadedBy.email} src={row.uploadedBy.avatarSrc} />
      ),
    },
    {
      key: 'attachments',
      label: 'Attachments',
      fit: true,
      width: '20%',
      render: (row) => (
        <span className="whitespace-nowrap text-body-sm-medium text-text-tertiary">
          {row.attachmentCount === 0 ? 'None' : row.attachmentCount === 1 ? '1 file' : `${row.attachmentCount} files`}
        </span>
      ),
    },
    {
      key: 'dateAdded',
      label: 'Date Added',
      fit: true,
      width: '20%',
      render: (row) => <span className="whitespace-nowrap text-body-sm-medium text-text-tertiary">{row.dateAdded}</span>,
    },
  ];

  /* Loading: the same columns and headers, a placeholder in each cell. The skeletons are hidden from assistive tech, so one
     status says what is happening. */
  const LOADING_CELL: Record<string, React.ReactNode> = {
    name: <Skeleton width={140} textStyle="body-sm" />,
    uploadedBy: (
      <div className="flex items-center gap-3">
        <Skeleton circle width={32} />
        <Skeleton width={120} textStyle="body-sm" />
      </div>
    ),
    attachments: <Skeleton width={56} textStyle="body-sm" />,
    dateAdded: <Skeleton width={72} textStyle="body-sm" />,
  };
  const placeholders: ManualRow[] = Array.from({ length: 8 }, (_, i) => ({
    id: `loading-${i}`,
    name: '',
    uploadedBy: { name: '', email: '' },
    attachmentCount: 0,
    dateAdded: '',
  }));

  return (
    <div
      className={cn('flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span role="status" className="sr-only">
          Loading manuals
        </span>
      )}
      <DataTable
        caption={caption}
        className="rounded-none border-0"
        columns={loading ? columns.map((column) => ({ ...column, render: () => LOADING_CELL[column.key] })) : columns}
        rows={loading ? placeholders : rows}
        sort={sort}
        onSortChange={onSortChange}
        empty={empty ?? <EmptyState icon={<Icon name="database" />} title="No items." />}
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
ManualsTable.displayName = 'ManualsTable';
