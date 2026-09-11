import * as React from 'react';
import { cn } from '../../lib/cn';
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from '../../components/data-table';
import { StatusPill, type StatusPillProps } from '../../components/status-pill';
import { DueDatePill, type DueDateProximity } from '../../components/due-date-pill';
import { AvatarGroup, type AvatarGroupEntry } from '../../components/avatar-group';
import { Pagination } from '../../components/pagination';
import { Tooltip } from '../../components/tooltip';
import { UrgencyTag, type AVUrgency } from '../../atoms/urgency-tag';
import { TypeTag, type AVType } from '../../atoms/type-tag';
import { Badge } from '../../atoms/badge';
import { Button } from '../../atoms/button';
import { Divider } from '../../atoms/divider';
import { Icon } from '../../atoms/icon';

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
 * that owns it: `StatusPill` for status, `UrgencyTag` for urgency, `TypeTag`
 * for type, `DueDatePill` for how near a date is. This file decides *which
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
export interface AVTableRow {
  /** The row's identity — used for selection. Give it the AV's real id. */
  id: string;
  /** The human reference, "VCP-12345". Clickable when `onOpen` is given. */
  ref: string;
  title: string;
  /** The domain badge beside the title — "VCP", "Design". */
  domain?: string;
  /** Counts under the title. Omit or pass 0 and the glyph disappears. */
  attachments?: number;
  comments?: number;
  /** The date, already formatted, and how near it is. See `DueDatePill`. */
  due?: { label: string; proximity?: DueDateProximity };
  urgency?: AVUrgency;
  type?: AVType;
  /** `{ status }` for a spine status, `{ custom }` for a domain step. */
  status?: StatusPillProps;
  members?: readonly AvatarGroupEntry[];
  /** "7 days ago". Already formatted — this table does not do relative time. */
  lastUpdated?: string;
}

/**
 * The four columns the design puts an info glyph on. **There is no default
 * copy**, and there will not be: Figma draws the glyphs but writes no tooltip
 * text, and inventing four sentences of product copy is not a design system's
 * job. Pass what the product says; omit one and its glyph does not render.
 */
export interface AVTableHints {
  urgency?: string;
  type?: string;
  status?: string;
  members?: string;
}

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
  /** Adds the trailing Actions column. Figma's Action Column row variant. */
  actions?: (row: AVTableRow) => React.ReactNode;
  /** Shown above the pagination when something is selected. */
  onDeleteSelected?: (ids: readonly string[]) => void;
  deleteSelectedLabel?: (count: number) => string;
  /** Pagination renders only when all three are given. 1-based. */
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** The four info tooltips. No defaults — see `AVTableHints`. */
  hints?: AVTableHints;
  empty?: React.ReactNode;
  caption?: string;
}

/** The info glyph beside a header label, with the product's own copy on it. */
function HeaderHint({ text, column }: { text?: string; column: string }) {
  if (!text) return null;
  return (
    <Tooltip content={text} placement="bottom">
      <button
        type="button"
        aria-label={`About ${column}`}
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded-sm text-text-tertiary',
          'hover:text-text-secondary',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
        )}
      >
        <Icon name="info" size="sm" />
      </button>
    </Tooltip>
  );
}

/** A count under the title: glyph, number, and the word only for screen readers. */
function Count({ icon, value, noun }: { icon: 'paperclip' | 'chat-centered-text'; value: number; noun: string }) {
  if (!value) return null;
  return (
    <span className="flex items-center gap-0.5 text-caption-md text-text-tertiary">
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
  actions,
  onDeleteSelected,
  deleteSelectedLabel = (count) => `Delete Selected (${count})`,
  page,
  pageCount,
  onPageChange,
  hints,
  empty,
  caption = 'Added Values',
  ...props
}: AVTableProps) {
  const columns: Array<DataTableColumn<AVTableRow>> = [
    {
      key: 'title',
      label: 'Task Title',
      sortable: true,
      /* 4fr against six 1fr-ish columns in Figma. As a `<col>` width, 40%
         leaves the rest to share the remainder in the same proportion. */
      width: '40%',
      render: (row) => (
        /* 16 top and bottom, Figma's own cell padding. With the two-line title
             block that makes an 81 row, which is what the canvas draws. */
        <div className="flex flex-col gap-1 py-4">
          <div className="flex items-center gap-2">
            {/* The reference opens the AV. A button, not a whole-row click
                target: `DataTable` refuses those, and rightly — a row-wide
                target hides the real action from keyboards and screen readers. */}
            {onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(row)}
                className={cn(
                  'shrink-0 rounded-sm text-body-md text-text-tertiary transition-colors',
                  'hover:text-text-brand-medium hover:underline',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                )}
              >
                {row.ref}
                <span className="sr-only">: {row.title}</span>
              </button>
            ) : (
              <span className="shrink-0 text-body-md text-text-tertiary">{row.ref}</span>
            )}
            <Divider orientation="vertical" className="h-4 shrink-0" />
            {/* One line, ellipsed. The full title is the `title` attribute so a
                truncated row is still readable on hover. */}
            <span className="truncate text-label-lg text-text-primary" title={row.title}>
              {row.title}
            </span>
          </div>

          {(row.domain || row.attachments || row.comments) && (
            <div className="flex items-center gap-2">
              {row.domain && (
                <Badge tone="brand" size="sm">
                  {row.domain}
                </Badge>
              )}
              <Count icon="paperclip" value={row.attachments ?? 0} noun="attachment" />
              <Count icon="chat-centered-text" value={row.comments ?? 0} noun="comment" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'due',
      label: 'Due Date',
      sortable: true,
      render: (row) =>
        row.due ? (
          <DueDatePill proximity={row.due.proximity}>{row.due.label}</DueDatePill>
        ) : null,
    },
    {
      key: 'urgency',
      label: 'Urgency',
      hint: <HeaderHint text={hints?.urgency} column="urgency" />,
      /* The tag carries Figma's own 8 of padding, so the cell gives it back to
         keep the column's left edge true. */
      render: (row) => (row.urgency ? <UrgencyTag urgency={row.urgency} className="-mx-2" /> : null),
    },
    {
      key: 'type',
      label: 'Type',
      hint: <HeaderHint text={hints?.type} column="type" />,
      render: (row) => (row.type ? <TypeTag type={row.type} className="-mx-2" /> : null),
    },
    {
      key: 'status',
      label: 'Status',
      hint: <HeaderHint text={hints?.status} column="status" />,
      render: (row) => (row.status ? <StatusPill size="sm" {...row.status} /> : null),
    },
    {
      key: 'members',
      label: 'Members',
      hint: <HeaderHint text={hints?.members} column="members" />,
      render: (row) =>
        row.members?.length ? (
          <AvatarGroup people={row.members} size="md" max={3} label="Members" />
        ) : null,
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      render: (row) => <span className="text-label-lg text-text-tertiary">{row.lastUpdated}</span>,
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

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
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
      />

      {(onDeleteSelected || paginated) && (
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
      )}
    </div>
  );
}
AVTable.displayName = 'AVTable';
