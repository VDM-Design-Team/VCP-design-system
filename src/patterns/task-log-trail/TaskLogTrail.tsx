import * as React from 'react';
import { useDateFormat } from '../../lib/format-date';
import { Icon } from '../../atoms/icon';
import { Pagination, type PaginationProps } from '../../atoms/pagination';
import { Skeleton } from '../../atoms/skeleton';
import { TableCard } from '../../components/table-card';
import { DataTable, type DataTableColumn } from '../../components/data-table';
import { SourceTag } from '../../components/source-tag';
import { StatusTag, type StatusTagProps } from '../../components/status-tag';
import { TableEmpty } from '../../components/table-empty';
import { Tag } from '../../atoms/tag';

/**
 * TaskLogTrail — the log of changes made to Added Values: one row per change — **ID**, **Task**, **Change** ("In Progress → Design Review (Status)"), **Source**,
 * **Changed At** and **Changed By** — with the pages beneath. Built to Figma's `Task_Log_Trail` (`Table`, `Task_Log_Trail_Row`).
 *
 * It is `DataTable` specialised, as `AccountsTable` is:
 *
 * - **ID** — the AV's reference, quiet (`text.tertiary`).
 * - **Task** — its title, **in full**: it wraps, at least 40 characters wide, and is never cut or reduced to a `title`, since the log is read for what changed (and a
 *   hover-only title is out of a keyboard's reach).
 * - **Change** — the old value, an arrow, the new value, then which field changed in brackets: "(Status)". **The new value is the one that is coloured**: a status is a
 *   `StatusTag` (the owner of the status mapping), so a spine status and a domain step ("Design Review") each keep their own colour. **The old value is a quiet grey tag** — as
 *   `StatusHistory` draws it — whatever it was, and so are "Initial Creation" and "Handoff", which stand in for a first value. `field` says what changed: **Status, Workflow,
 *   Assignee, Start Date or Due Date**; an assignee is a person's name and a date is ISO, shown the system's way.
 * - **Source** — a `SourceTag`. **Changed At** is an ISO date and time, shown the system's way, **"10/06/2026 14:37"** (dd/mm/yyyy, or the person's locale's order, then a 24-hour time: `useDateFormat().dateTime`) in a `<time>`. **Changed By** is plain text.
 *
 * **It does nothing itself.** Filtering is the page's: pass the filter row as `filters` and it sits inside the card above the table (there is no filters pattern); paging is
 * `page`, `pageCount` and `onPageChange`.
 * `loading` shows placeholder rows and one status says so; an empty trail is a `TableEmpty`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
/** What a log entry can be about, in brackets after the change: the AV's status or workflow step, who it is assigned to, and its two dates. */
export type TaskLogField = 'Status' | 'Workflow' | 'Assignee' | 'Start Date' | 'Due Date';

/**
 * A value in a change: a status (`{ status }` for a spine status, `{ custom }` for a domain step's own words), a person (`{ person: 'Eve Chen' }`, an assignee)
 * or a date (`{ date: '2026-06-10' }`, ISO).
 */
export type TaskLogValue = StatusTagProps | { person: string } | { date: string };

/** What stands in for the old value when there was none: `{ event: 'Initial Creation' }` (the AV was just created) or `{ event: 'Handoff' }`. Only ever the old side. */
export type TaskLogEvent = { event: 'Initial Creation' | 'Handoff' };

/** A value as words, for the grey old-value tag. */
function useValueText() {
  const dates = useDateFormat();
  return (value: TaskLogValue | TaskLogEvent): string => {
    if ('event' in value) return value.event;
    if ('person' in value) return value.person;
    if ('date' in value) return dates.format(value.date);
    return value.custom ?? value.status ?? '';
  };
}

/** The new value: a status in its own colour (`StatusTag` owns the mapping), anything else a quiet tag. */
function NewValue({ value, text }: { value: TaskLogValue; text: string }) {
  return 'status' in value || 'custom' in value ? <StatusTag {...value} /> : <Tag size="md">{text}</Tag>;
}

export interface TaskLogRow {
  id: string | number;
  /** The Added Value's reference: "VCP-1234". */
  ref: string;
  /** Its title, shown in full. */
  task: string;
  change: {
    /** What it was: a quiet grey tag, or an event when there was nothing before. */
    from: TaskLogValue | TaskLogEvent;
    /** What it became: a status is coloured. */
    to: TaskLogValue;
    /** Which field changed, as it reads in brackets: "Status", "Workflow", "Assignee", "Start Date" or "Due Date". */
    field: TaskLogField;
  };
  /** Where the change came from, as it should read inside the tag: "VCP". */
  source: string;
  /** An ISO date and time: "2026-06-10T14:37:00" (no zone: the clock reads as written) or "2026-06-10T14:37:00Z" (an instant, shown in the provider's time zone, else the person's own). */
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
   * The page's filters: pass a `FilterBar` (search, the period, a select for the kind of change, **Reset**), drawn **inside the card, above the table** — as `AccountsTable` and
   * `ContactsTable` carry their search.
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
  const dates = useDateFormat();
  const valueText = useValueText();
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
      /* At least 40 characters wide, and the whole title: it wraps. Nothing cuts it, so nothing is left to a hover title. */
      cellProps: () => ({ className: 'min-w-88 py-4' }),
      render: (row) => <span className="text-body-sm-medium text-text-primary">{row.task}</span>,
    },
    {
      key: 'change',
      cellProps: roomy,
      label: 'Change',
      fit: true,
      width: '27%',
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Tag size="md">{valueText(row.change.from)}</Tag>
          <Icon name="arrow-right" size="sm" label="changed to" className="shrink-0 text-text-secondary" />
          <NewValue value={row.change.to} text={valueText(row.change.to)} />
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
      render: (row) => (
        <time dateTime={row.changedAt} className="whitespace-nowrap text-body-sm-regular text-text-secondary">
          {dates.dateTime(row.changedAt)}
        </time>
      ),
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
          empty ?? <TableEmpty noun="changes" icon="list-bullets" filtered={filtered} hint="Try widening the dates, or reset the filters." />
        }
      />
    </TableCard>
  );
}
TaskLogTrail.displayName = 'TaskLogTrail';
