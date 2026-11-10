import * as React from 'react';
import { cn } from '../../lib/cn';
import {
  DataTable,
  ColumnHint,
  type DataTableColumn,
  type DataTableSort,
} from '../../components/data-table';
import { StatusTag, STATUS_COLUMN_HINT, type StatusTagProps } from '../../components/status-tag';
import { DueDateTag, type DueDateProximity } from '../../components/due-date-tag';
import { AvatarGroup, type AvatarGroupEntry } from '../../components/avatar-group';
import { Pagination } from '../../atoms/pagination';
import { UrgencyTag, URGENCY_COLUMN_HINT, type AVUrgency } from '../../components/urgency-tag';
import { TruncatedText } from '../../components/truncated-text';
import { TypeTag, TYPE_COLUMN_HINT, type AVType } from '../../components/type-tag';
import { Tag } from '../../atoms/tag';
import { Button } from '../../atoms/button';
import { Divider } from '../../atoms/divider';
import { Icon } from '../../atoms/icon';
import { MultipartParentChip } from '../../components/multipart-parent-chip';
import { MultipartTableTag } from '../../components/multipart-table-tag';
import { TableCard } from '../../components/table-card';

/**
 * AVTable — the Added Value table: the list every VCP workspace is built
 * around. `DataTable` specialised, exactly as `docs/data-table.md` says the
 * VCP tables should be — the generic table keeps the `<table>` semantics, the
 * sorting contract and the selection contract, and this adds the nine columns
 * and nothing else.
 *
 * Read off the Figma `AV_Table` (`6785:35414`) and the `_AV_Table_Header_Item`
 * (nine types) and `_AV_Table_Row` (four variants) sets on the Added Value
 * Table page, audit batch 5, 11 September 2026.
 *
 * **It owns no mapping.** Every cell that has a vocabulary defers to the piece
 * that owns it: `StatusTag` for status, `UrgencyTag` for urgency, `TypeTag`
 * for type, `DueDateTag` for how near a date is. This file decides *which
 * columns exist and in what order*, and that is all — which is the difference
 * between a pattern and a second copy of the system.
 *
 * **Three columns are optional, and they are the design's own four row
 * variants.** Default draws seven columns; `selectable` adds the leading
 * checkbox; `actions` adds the trailing menu column. Figma draws Default,
 * Checkbox, Checkbox Selected and Action Column; those are the same two
 * booleans, so they are booleans here rather than a `variant` prop.
 *
 * **It does not sort, filter or paginate.** `rows` renders in the order given
 * and `page` is whatever the caller says — same contract as `DataTable`,
 * because the order of a thousand Added Values is the server's business.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
/**
 * A multipart Added Value is split into parts. In the table, **a child** says which part it is and links to its parent, and **a parent** says how
 * many of its parts are done. Figma's `_AV_Table_Item_AV_Title_Multipart` (`Multipart Parent=No` / `=Yes`).
 */
export type AVMultipart =
  | { kind: 'child'; /** Which part: 1 of `total`. */ position: number; total: number; /** The parent's reference, "VCP-4321". */ parentRef: string }
  | { kind: 'parent'; /** How many parts are completed. */ completed: number; total: number };

export interface AVTableRow {
  /** The row's identity — used for selection. Give it the AV's real id. */
  id: string;
  /** The human reference, "VCP-12345". Clickable when `onOpen` is given. */
  ref: string;
  title: string;
  /**
   * Makes it a multipart row: a tag under the reference (the child's "1/3" or the parent's progress ring), a **Parent: VCP-4321** chip on a child, and a
   * coloured edge on a parent. See `AVMultipart`.
   */
  multipart?: AVMultipart;
  /** The domain badge beside the title — "VCP", "Design". */
  domain?: string;
  /** Counts under the title. Omit or pass 0 and the glyph disappears. */
  attachments?: number;
  comments?: number;
  /** The date, already formatted, and how near it is. See `DueDateTag`. */
  due?: { label: string; proximity?: DueDateProximity };
  urgency?: AVUrgency;
  type?: AVType;
  /** `{ status }` for a spine status, `{ custom }` for a domain step. */
  status?: StatusTagProps;
  members?: readonly AvatarGroupEntry[];
  /** "7 days ago". Already formatted — this table does not do relative time. */
  lastUpdated?: string;
}

/**
 * The four columns the design puts an info glyph on. Urgency, Type and Status default to the product's
 * copy — each piece owns its own (`URGENCY_COLUMN_HINT`, `TYPE_COLUMN_HINT`, `STATUS_COLUMN_HINT`).
 * **Members has none**: Figma draws the glyph and writes nothing, so it stays silent until you pass
 * a line. Pass a string (or node) to change a column's copy, or `''` to drop its glyph.
 */
export interface AVTableHints {
  urgency?: React.ReactNode;
  type?: React.ReactNode;
  status?: React.ReactNode;
  members?: React.ReactNode;
}

const DEFAULT_HINTS: AVTableHints = {
  urgency: URGENCY_COLUMN_HINT,
  type: TYPE_COLUMN_HINT,
  status: STATUS_COLUMN_HINT,
};

export interface AVTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  rows: readonly AVTableRow[];
  /** Sortable keys: `title`, `due`, `lastUpdated` — the three Figma marks. */
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** Adds the leading checkbox column. Figma's Checkbox row variants. */
  selectable?: boolean;
  selected?: readonly string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Opens an AV. Given, the reference becomes a button; omitted, it is text. */
  onOpen?: (row: AVTableRow) => void;
  /** A child's **Parent: …** chip was pressed. Given, the chip is a button; the page opens the parent. */
  onOpenParent?: (row: AVTableRow) => void;
  /** Adds the trailing Actions column. Figma's Action Column row variant. */
  actions?: (row: AVTableRow) => React.ReactNode;
  /**
   * The page's filters (a `FilterBar`, a search box…). Given, the table is drawn **in a card with its filters above it** (`TableCard`), with the pagination at its foot, and `DataTable` drops its own border. Left out,
   * the table is as it always was and the page places its filters wherever it likes.
   */
  filters?: React.ReactNode;
  /** Shown above the pagination when something is selected. */
  onDeleteSelected?: (ids: readonly string[]) => void;
  deleteSelectedLabel?: (count: number) => string;
  /** Pagination renders only when all three are given. 1-based. */
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** The info tooltips. Urgency, Type and Status default to the product's copy — see `AVTableHints`. */
  hints?: AVTableHints;
  empty?: React.ReactNode;
  caption?: string;
}

/** A count under the title: glyph, number, and the word only for screen readers. */
function Count({ icon, value, noun }: { icon: 'paperclip' | 'chat-centered-text'; value: number; noun: string }) {
  if (!value) return null;
  return (
    <span className="flex items-center gap-0.5 text-caption-md-medium text-text-tertiary">
      <Icon name={icon} size="sm" className="shrink-0" />
      {value}
      <span className="sr-only">{value === 1 ? noun : `${noun}s`}</span>
    </span>
  );
}

export function AVTable({
  className,
  rows,
  sort,
  onSortChange,
  selectable,
  selected = [],
  onSelectedChange,
  onOpen,
  onOpenParent,
  actions,
  onDeleteSelected,
  deleteSelectedLabel = (count) => `Delete Selected (${count})`,
  page,
  pageCount,
  onPageChange,
  hints: hintOverrides,
  empty,
  caption = 'Added Values',
  filters,
  ...props
}: AVTableProps) {
  const hints = { ...DEFAULT_HINTS, ...hintOverrides };
  const columns: Array<DataTableColumn<AVTableRow>> = [
    {
      key: 'title',
      label: 'Task Title',
      sortable: true,
      grow: true,
      width: '34%',
      /* The metadata (tag, domain, parent chip, counts) never shrinks or is cut, so a multipart row's cell cannot be narrower than that: the
         column's floor rises to fit it, and below it the table scrolls sideways. */
      /* A multipart parent also has a brand edge on its left (Figma's `Multipart Parent=Yes`: a 6 border in surface.brand.medium). It is drawn over this cell,
         not as a border on the row: a border on a row of a collapsed table nudges the whole table (the header too) to make room for it, and a
         pseudo-element on the row itself is taken for an extra cell. With `selectable` it sits at the title's left edge, after the checkbox. */
      cellProps: (row) =>
        row.multipart
          ? {
              className: cn(
                'min-w-md',
                row.multipart.kind === 'parent' && 'relative before:absolute before:inset-y-0 before:start-0 before:w-1.5 before:bg-surface-brand-medium',
              ),
            }
          : undefined,
      render: (row) => {
        const multipart = row.multipart;
        const reference = onOpen ? (
          /* The reference opens the AV. A button, not a whole-row click
             target: `DataTable` refuses those, and rightly — a row-wide
             target hides the real action from keyboards and screen readers. */
          <button
            type="button"
            onClick={() => onOpen(row)}
            className={cn(
              'shrink-0 rounded-sm text-body-sm-regular text-text-tertiary transition-colors',
              'hover:text-text-brand-medium hover:underline',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
            )}
          >
            {row.ref}
            <span className="sr-only">: {row.title}</span>
          </button>
        ) : (
          <span className="shrink-0 text-body-sm-regular text-text-tertiary">{row.ref}</span>
        );
        /* One line, ellipsed. When it is cut, hovering or focusing it says the whole title. */
        const title = <TruncatedText className="text-label-sm-medium text-text-primary">{row.title}</TruncatedText>;
        const details = (multipart || row.domain || row.attachments || row.comments) && (
          <div className="flex w-max items-center gap-2">
            {multipart && (
              <MultipartTableTag
                kind={multipart.kind}
                total={multipart.total}
                position={multipart.kind === 'child' ? multipart.position : undefined}
                parentRef={multipart.kind === 'child' ? multipart.parentRef : undefined}
                completed={multipart.kind === 'parent' ? multipart.completed : undefined}
              />
            )}
            {row.domain && (
              <Tag tone="brand" size="sm">
                {row.domain}
              </Tag>
            )}
            {multipart?.kind === 'child' && (
              <MultipartParentChip parentRef={multipart.parentRef} onOpen={onOpenParent ? () => onOpenParent(row) : undefined} />
            )}
            <Count icon="paperclip" value={row.attachments ?? 0} noun="attachment" />
            <Count icon="chat-centered-text" value={row.comments ?? 0} noun="comment" />
          </div>
        );

        /* 16 top and bottom, Figma's own cell padding. With the two-line title
             block that makes an 81 row, which is what the canvas draws. */
        return (
          <div className="flex flex-col gap-1 py-4">
            <div className="flex items-center gap-2">
              {reference}
              <Divider orientation="vertical" className="h-4 shrink-0" />
              {title}
            </div>
            {details}
          </div>
        );
      },
    },
    {
      key: 'due',
      fit: true,
      width: '12%',
      label: 'Due Date',
      sortable: true,
      render: (row) =>
        row.due ? (
          <DueDateTag proximity={row.due.proximity}>{row.due.label}</DueDateTag>
        ) : null,
    },
    {
      key: 'urgency',
      fit: true,
      width: '11%',
      label: 'Urgency',
      hint: <ColumnHint text={hints.urgency} column="urgency" />,
      /* The tag carries Figma's own 8 of padding, so the cell gives it back to
         keep the column's left edge true. */
      render: (row) => (row.urgency ? <UrgencyTag urgency={row.urgency} className="-mx-2 max-w-none" /> : null),
    },
    {
      key: 'type',
      fit: true,
      width: '10%',
      label: 'Type',
      hint: <ColumnHint text={hints.type} column="type" />,
      render: (row) => (row.type ? <TypeTag type={row.type} className="-mx-2 max-w-none" /> : null),
    },
    {
      key: 'status',
      fit: true,
      width: '11%',
      label: 'Status',
      hint: <ColumnHint text={hints.status} column="status" />,
      render: (row) => (row.status ? <StatusTag size="sm" {...row.status} /> : null),
    },
    {
      key: 'members',
      fit: true,
      width: '11%',
      label: 'Members',
      hint: <ColumnHint text={hints.members} column="members" />,
      render: (row) =>
        row.members?.length ? (
          <AvatarGroup people={row.members} size="md" max={2} label="Members" tooltips />
        ) : null,
    },
    {
      key: 'lastUpdated',
      fit: true,
      width: '12%',
      label: 'Last Updated',
      sortable: true,
      render: (row) => <span className="text-label-sm-medium text-text-tertiary">{row.lastUpdated}</span>,
    },
  ];

  if (actions) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      width: '72px' /* ds-lint-ignore — a `<col>` width, not a utility */,
      render: (row) => actions(row),
    });
  }

  const paginated = page !== undefined && pageCount !== undefined && onPageChange !== undefined;

  const table = (
    <DataTable
      columns={columns}
      rows={rows}
      sort={sort}
      onSortChange={onSortChange}
      selectable={selectable}
      selected={selected}
      onSelectedChange={(ids) => onSelectedChange?.(ids as string[])}
      /* Every checkbox says which AV it selects, not "row 3". */
      selectLabel={(row) => `Select ${row.ref}: ${row.title}`}
      empty={empty}
      caption={caption}
      bare={Boolean(filters)}
    />
  );

  const footer = (onDeleteSelected || paginated) && (
    <div className="flex flex-wrap items-center justify-end gap-6">
      {/* Destructive, so it appears only when it has something to act on
          and says how many — a bare "Delete Selected" is an unanswerable
          question. */}
      {onDeleteSelected && selected.length > 0 && (
        <Button variant="danger" size="sm" onClick={() => onDeleteSelected(selected)}>
          {deleteSelectedLabel(selected.length)}
        </Button>
      )}
      {paginated && <Pagination page={page} pageCount={pageCount} onChange={onPageChange} />}
    </div>
  );

  /* With filters, the table, its filters and its pagination are one card; without, as before. */
  if (filters) {
    return (
      <TableCard className={className} filters={filters} footer={footer || undefined} {...props}>
        {table}
      </TableCard>
    );
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {table}
      {footer}
    </div>
  );
}
AVTable.displayName = 'AVTable';
