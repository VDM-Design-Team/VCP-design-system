import * as React from 'react';
import { IconButton } from '../../atoms/icon-button';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { Skeleton } from '../../atoms/skeleton';
import { TableCard } from '../../components/table-card';
import { DataTable, type DataTableColumn } from '../../components/data-table';
import { TableEmpty } from '../../components/table-empty';

/**
 * ContactsTable — the Contact List page: the messages people have sent through the contact form, one row each — who, what about,
 * and what they said — with a delete button on every row and the pages beneath. Built to Figma's `Contact_List` (`_Contact_List_Table_Item_*`,
 * `Contact_List_Row`).
 *
 * It is `DataTable` specialised, as `AccountsTable` is: the generic table keeps the `<table>` semantics; this adds the four columns and
 * the pagination.
 *
 * - **Email** — who wrote (`text.primary`). **Subject** and **Message** — what they wrote (`text.tertiary`).
 * - **A long message wraps** and is shown whole: an admin has to be able to read what was sent, and nothing here can open it.
 * - **Actions** — delete, named for the row ("Delete message from john@vdm.technology").
 *
 * **It is controlled and does nothing itself.** The caller pages by `page`; `onDelete` only *asks* — confirming the delete
 * (`ConfirmDeleteModal`) and telling the person it worked (a toast) are the page's. The page story shows the flow.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export interface ContactRow {
  id: string | number;
  /** Who wrote. */
  email: string;
  subject: string;
  message: string;
}

export interface ContactsTableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>,
    Pick<PaginationProps, 'page' | 'pageCount' | 'itemCount' | 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange'> {
  rows: readonly ContactRow[];
  /** The delete button was pressed. Confirming, and doing it, are the page's. */
  onDelete?: (row: ContactRow) => void;
  onPageChange?: (page: number) => void;
  /** Placeholder rows instead of `rows`, while the messages load. The headers stay. */
  loading?: boolean;
  /** What an empty table says. */
  empty?: React.ReactNode;
  /** The table's accessible name. */
  caption?: string;
}

/* As the Accounts table's bin is: the plain glyph-only `IconButton`, with the critical red for the glyph. */
const DELETE_GLYPH = 'text-accent-critical-outline-content-default hover:text-accent-critical-outline-content-hover';

export function ContactsTable({
  className,
  rows,
  onDelete,
  page,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  loading,
  empty = <TableEmpty noun="messages" icon="chat-centered-text" />,
  caption = 'Contact messages',
  ...props
}: ContactsTableProps) {
  const columns: DataTableColumn<ContactRow>[] = [
    {
      key: 'email',
      label: 'Email',
      width: '22%',
      render: (row) => <span className="text-body-sm-medium text-text-primary">{row.email}</span>,
    },
    {
      key: 'subject',
      label: 'Subject',
      width: '22%',
      render: (row) => <span className="text-body-sm-medium text-text-tertiary">{row.subject}</span>,
    },
    {
      key: 'message',
      label: 'Message',
      width: '46%',
      render: (row) => <span className="text-body-sm-medium text-text-tertiary">{row.message}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      fit: true,
      width: '10%',
      render: (row) => (
        <IconButton
          icon="trash"
          label={`Delete message from ${row.email}`}
          className={DELETE_GLYPH}
          onClick={() => onDelete?.(row)}
        />
      ),
    },
  ];

  /* Loading: the same columns and headers, a placeholder in each cell. The skeletons are hidden from assistive tech, so one
     status says what is happening. */
  const LOADING_CELL: Record<string, React.ReactNode> = {
    email: <Skeleton width={160} textStyle="body-sm" />,
    subject: <Skeleton width={120} textStyle="body-sm" />,
    message: <Skeleton textStyle="body-sm" />,
    actions: <Skeleton width={40} height={40} />,
  };
  const placeholders: ContactRow[] = Array.from({ length: 8 }, (_, i) => ({
    id: `loading-${i}`,
    email: '',
    subject: '',
    message: '',
  }));

  return (
    <TableCard
      className={className}
      aria-busy={loading || undefined}
      {...props}
      footer={
        <Pagination
          page={page}
          pageCount={pageCount}
          onChange={onPageChange}
          itemCount={itemCount}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
        />
      }
    >
      {loading && (
        <span role="status" className="sr-only">
          Loading messages
        </span>
      )}
      <DataTable
        bare
        caption={caption}
        columns={loading ? columns.map((column) => ({ ...column, render: () => LOADING_CELL[column.key] })) : columns}
        rows={loading ? placeholders : rows}
        empty={empty}
      />
    </TableCard>
  );
}
ContactsTable.displayName = 'ContactsTable';
