import * as React from 'react';
import { Icon } from '../../atoms/icon';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { Skeleton } from '../../atoms/skeleton';
import { TableCard } from '../../components/table-card';
import { DataTable, type DataTableColumn } from '../../components/data-table';
import { EmptyState } from '../../components/empty-state';
import { SourceTag } from '../../components/source-tag';
import { StatusTag, type StatusTagProps } from '../../components/status-tag';
import { Tag } from '../../atoms/tag';

/**
 * TaskLogTrail — the log of changes made to Added Values: one row per change — **ID**, **Task**, **Change** ("In Progress → Design Review (Status)"), **Source**,
 * **Changed At** and **Changed By** — with the pages beneath. Built to Figma's `Task_Log_Trail` (`Table`, `Task_Log_Trail_Row`).
 *
 * It is `DataTable` specialised, as `AccountsTable` is:
 *
 * - **ID** — the AV's reference, quiet (`text.tertiary`).
 * - **Task** — its title, in full: **it wraps** (Figma draws three lines) rather than ending in "…", since the log is for reading what changed.
 * - **Change** — the old value, an arrow, the new value, then which field changed in brackets: "(Status)". The values are `StatusTag`s, so a spine status
 *   and a domain step ("Design Review") each keep their own colour; `field` says what was changed ("Status", "Urgency", …).
 * - **Source** — a `SourceTag`. **Changed At** and **Changed By** are plain text, **already formatted** ("Jun 10, 2026 2:37 PM"): this table does not do dates.
 *
 * **It does nothing itself.** Filtering is the page's: pass the filter row as `filters` and it sits inside the card above the table (there is no filters pattern); paging is
 * `page`, `pageCount` and `onPageChange`.
 * `loading` shows placeholder rows and one status says so; an empty trail is an `EmptyState`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
/** The two things a log entry can be about, in brackets after the change. */
export type TaskLogField = 'Status' | 'Workflow';

/**
 * One side of a change: a status (`{ status }` for a spine status, `{ custom }` for a domain step's own words), or an **event** that stands in for one —
 * `{ event: 'Initial Creation' }` (the AV was just created, so there is nothing before it) or `{ event: 'Handoff' }`.
 */
export type TaskLogValue = StatusTagProps | { event: 'Initial Creation' | 'Handoff' };

const isEvent = (value: TaskLogValue): value is { event: 'Initial Creation' | 'Handoff' } => 'event' in value;

function ValueTag({ value }: { value: TaskLogValue }) {
  return isEvent(value) ? <Tag size="md">{value.event}</Tag> : <StatusTag {...value} />;
}

export interface TaskLogRow {
  id: string | number;
  /** The Added Value's reference: "VCP-1234". */
  ref: string;
  /** Its title, in full. */
  task: string;
  change: {
    /** What it was. */
    from: TaskLogValue;
    /** What it became. */
    to: TaskLogValue;
    /** Which field changed, as it reads in brackets: "Status" or "Workflow". */
    field: TaskLogField;
  };
  /** Where the change came from, as it should read inside the tag: "VCP". */
  source: string;
  /** Already formatted: "Jun 10, 2026 2:37 PM". */
  changedAt: string;
  /** Who made it. */
  changedBy: string;
}

export interface TaskLogTrailProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    Pick<PaginationProps, 'page' | 'pageCount' | 'itemCount' | 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange'> {
  rows: readonly TaskLogRow[];
  onPageChange?: (page: number) => void;
  /** Placeholder rows instead of `rows`, while the log loads. The headers stay. */
  loading?: boolean;
  /**
   * The page's filters (a search box, selects, dates, Reset…), drawn **inside the card, above the table** — as `AccountsTable` and `ContactsTable` carry
   * their search. There is no filters pattern: build the row from the system's own fields.
   */
  filters?: React.ReactNode;
  /** Filters are narrowing the trail: an empty table then says "No changes match these filters." instead of "No changes yet." */
  filtered?: boolean;
  /** What an empty trail says. Defaults to words that depend on `filtered`. */
  empty?: React.ReactNode;
  /** The table's accessible name. */
  caption?: string;
}

export function TaskLogTrail({
  className,
  rows,
  page,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  loading,
  filters,
  filtered,
  empty,
  caption = 'Task log trail',
  ...props
}: TaskLogTrailProps) {
  /* Figma's rows are roomy: 16 above and below every cell, so a three-line task makes a row of about 95. */
  const roomy = () => ({ className: 'py-4' });
  const columns: DataTableColumn<TaskLogRow>[] = [
    {
      key: 'ref',
      cellProps: roomy,
      label: 'ID',
      fit: true,
      width: '11%',
      render: (row) => <span className="whitespace-nowrap text-body-sm-regular text-text-tertiary">{row.ref}</span>,
    },
    {
      key: 'task',
      label: 'Task',
      width: '21%',
      /* At least 40 characters wide, and at most three lines before the title is cut with "…" (the whole of it is still the hover title). */
      cellProps: () => ({ className: 'min-w-88 py-4' }),
      render: (row) => (
        <span className="line-clamp-3 text-body-sm-medium text-text-primary" title={row.task}>
          {row.task}
        </span>
      ),
    },
    {
      key: 'change',
      cellProps: roomy,
      label: 'Change',
      fit: true,
      width: '27%',
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <ValueTag value={row.change.from} />
          <Icon name="arrow-right" size="sm" label="changed to" className="shrink-0 text-text-secondary" />
          <ValueTag value={row.change.to} />
          <span className="text-body-sm-regular text-text-tertiary">({row.change.field})</span>
        </div>
      ),
    },
    {
      key: 'source',
      cellProps: roomy,
      label: 'Source',
      fit: true,
      width: '11%',
      render: (row) => <SourceTag source={row.source} />,
    },
    {
      key: 'changedAt',
      cellProps: roomy,
      label: 'Changed At',
      fit: true,
      width: '16%',
      render: (row) => <span className="whitespace-nowrap text-body-sm-regular text-text-secondary">{row.changedAt}</span>,
    },
    {
      key: 'changedBy',
      cellProps: roomy,
      label: 'Changed By',
      fit: true,
      width: '14%',
      render: (row) => <span className="whitespace-nowrap text-body-sm-regular text-text-secondary">{row.changedBy}</span>,
    },
  ];

  const LOADING_CELL: Record<string, React.ReactNode> = {
    ref: <Skeleton width={64} textStyle="body-sm" />,
    task: <Skeleton width={200} textStyle="body-sm" />,
    change: <Skeleton width={260} height={28} />,
    source: <Skeleton width={96} height={28} />,
    changedAt: <Skeleton width={140} textStyle="body-sm" />,
    changedBy: <Skeleton width={90} textStyle="body-sm" />,
  };
  const placeholders: TaskLogRow[] = Array.from({ length: 6 }, (_, i) => ({
    id: `loading-${i}`,
    ref: '',
    task: '',
    change: { from: { status: 'Draft' }, to: { status: 'Draft' }, field: 'Status' },
    source: '',
    changedAt: '',
    changedBy: '',
  }));

  return (
    <TableCard
      className={className}
      aria-busy={loading || undefined}
      {...props}
      filters={filters}
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
          Loading the task log trail
        </span>
      )}
      <DataTable
        bare
        caption={caption}
        columns={loading ? columns.map((column) => ({ ...column, render: () => LOADING_CELL[column.key] })) : columns}
        rows={loading ? placeholders : rows}
        empty={
          empty ??
          (filtered ? (
            <EmptyState
              icon={<Icon name="magnifying-glass" size="lg" />}
              title="No changes match these filters."
              description="Try widening the dates, or reset the filters."
            />
          ) : (
            <EmptyState icon={<Icon name="list-bullets" size="lg" />} title="No changes yet." />
          ))
        }
      />
    </TableCard>
  );
}
TaskLogTrail.displayName = 'TaskLogTrail';
