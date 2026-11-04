import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { IconButton } from '../../atoms/icon-button';
import { Pagination } from '../../atoms/pagination';
import { Badge } from '../../atoms/badge';
import { Tag } from '../../atoms/tag';
import { Tooltip } from '../../atoms/tooltip';
import { AvatarGroup, type AvatarGroupEntry } from '../../components/avatar-group';
import { DateField } from '../../components/date-field';
import { DataTable, type DataTableColumn, type DataTableSort } from '../../components/data-table';
import type { DatePickerPreset } from '../../components/date-picker';
import { EmptyState } from '../../components/empty-state';
import { HOLIDAY_TYPES, HolidayTypeTag, holidayTypeLabel, type HolidayType } from '../../components/holiday-type-tag';
import { HolidaySourceBadge, type HolidaySource } from '../../components/holiday-source-badge';
import { TruncatedText } from '../../components/truncated-text';
import { SearchSelect, type SearchSelectOption } from '../../components/search-select';
import { formatDayMonthYear } from '../../lib/format-date';

/**
 * HolidayTable — the Holiday Registry: the filter row (holiday type, period, who it applies to) with **Add Holiday** and **Import from Hubstaff** for an admin, the table of holidays,
 * and the pagination beneath. Built to Figma's `_Holiday_Registry_Table` (`8056:126395`: with rows, and `Empty Table = Yes`) and `Holiday_Registry_Row` (`8048:120056`: Admin and Normal user).
 *
 * It is `DataTable` specialised, as `AVTable` is. **It owns no mapping** — `HolidayTypeTag` and `HolidaySourceBadge` own their vocabularies, `AvatarGroup` the stack of people — and it does not
 * sort, filter, fetch or paginate: `rows` are rendered in the order given, `filters` and `sort` are the caller's, and so is the paging.
 *
 * **The row**, left to right: **Name** (a flagged one wears a warning glyph whose tooltip says Hubstaff already has the entry), **Date** (one day, or a range, then a blue pill with how many days),
 * **Holiday Type**, **Applies to** (a stack of people, "+2" for the rest), **All Day** (or Partial Day), **Recurring** (Yearly / One-Time), **Added By** ("System", or the person) and **Source**.
 * An **admin** also has **Actions**: edit and delete. A holiday the system added can be deleted but not edited, as Figma draws it (no pencil on those rows).
 *
 * - **An empty table** says "No holidays have been added yet." under its headers; the filters and the paging stay.
 * - **Dates are `dd/mm/yyyy`.** A range reads "01/05/2026 – 03/05/2026" with an en dash.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface HolidayRow {
  id: string;
  name: string;
  /** Hubstaff already has this entry: the name wears a warning glyph and its tooltip says so. */
  duplicateOfHubstaff?: boolean;
  /** ISO `yyyy-mm-dd`. */
  start: string;
  /** ISO end, inclusive. The same as `start` (or omitted) for one day. */
  end?: string;
  type: HolidayType;
  /** Who it applies to. */
  appliesTo: readonly AvatarGroupEntry[];
  /** `false` is a Partial Day. */
  allDay: boolean;
  /** Repeats every year (Yearly) or happens once (One-Time). */
  recurring: boolean;
  /** `'system'`, or the person who added it. */
  addedBy: 'system' | { name: string; src?: string };
  source: HolidaySource;
}

/** A period the Period filter holds: ISO start and end (inclusive). A month is its first and last day. */
export interface HolidayPeriod {
  start: string;
  end: string;
}

export interface HolidayFilters {
  /** `''` is all types. */
  type: HolidayType | '';
  period: HolidayPeriod | null;
  /** The picked user's `value`; `'all'` is everyone. */
  user: string;
}

export interface HolidayTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  rows: readonly HolidayRow[];
  filters: HolidayFilters;
  onFiltersChange: (filters: HolidayFilters) => void;
  /** The users the Applies to filter offers, after "All Users". */
  users: readonly SearchSelectOption[];
  /** The named periods down the left of the Period filter (sprints). */
  periodPresets?: readonly DatePickerPreset[];
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** An admin sees Add Holiday, Import from Hubstaff and the Actions column. */
  admin?: boolean;
  onAdd?: () => void;
  onImport?: () => void;
  onEdit?: (row: HolidayRow) => void;
  onDelete?: (row: HolidayRow) => void;
  /** 1-based. Pagination shows when `pageCount` is given. */
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** With `pageSize` and `onPageSizeChange`, the readout ("1-50 of 1,250") and the Items select. */
  itemCount?: number;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  caption?: string;
}

const DUPLICATE_TIP = 'Hubstaff already includes this entry. Remove it from VCP to avoid duplicate coverage.';
const ALL_USERS = 'all';

const pad = (n: number) => String(n).padStart(2, '0');
/** The last day of the month `iso` is in. */
const lastDayOf = (iso: string) => {
  const [year, month] = iso.split('-').map(Number);
  return `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
};

const dayCount = (start: string, end: string) => {
  const ms = Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
};

export function HolidayTable({
  className,
  rows,
  filters,
  onFiltersChange,
  users,
  periodPresets,
  sort,
  onSortChange,
  admin,
  onAdd,
  onImport,
  onEdit,
  onDelete,
  page = 1,
  pageCount,
  onPageChange,
  itemCount,
  pageSize,
  onPageSizeChange,
  caption = 'Holidays',
  ...props
}: HolidayTableProps) {
  const columns: DataTableColumn<HolidayRow>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '20%',
      /* 184: a name is not squeezed into three lines before the table scrolls. */
      minWidth: '11.5rem',
      render: (row) => (
        <span className="flex items-center gap-2 text-label-sm-medium text-text-primary">
          {row.duplicateOfHubstaff && (
            <Tooltip content={DUPLICATE_TIP} placement="bottom">
              {/* Focusable, so the keyboard reaches what the tooltip says. */}
              <span role="img" aria-label="Duplicate of a Hubstaff entry" tabIndex={0} className="grid shrink-0 place-items-center rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused">
                <Icon name="warning-circle-fill" size="md" className="text-accent-warning-outline-content-default" />
              </span>
            </Tooltip>
          )}
          <TruncatedText>{row.name}</TruncatedText>
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      fit: true,
      sortable: true,
      render: (row) => {
        const end = row.end && row.end !== row.start ? row.end : undefined;
        const days = end ? dayCount(row.start, end) : 1;
        return (
          <span className="flex items-center gap-2 text-label-sm-medium text-text-primary">
            {formatDayMonthYear(row.start)}
            {end && ` – ${formatDayMonthYear(end)}`}
            {/* The info tonal fill with the info outline around it (as `SourceTag`): the outline-only style falls under 4.5:1 in dark at this size. */}
            <Badge variant="tonal" tone="info" size="md" className="border border-accent-info-outline-border-default">
              {days === 1 ? '1 day' : `${days} days`}
            </Badge>
          </span>
        );
      },
    },
    { key: 'type', label: 'Holiday Type', fit: true, render: (row) => <HolidayTypeTag type={row.type} /> },
    {
      key: 'appliesTo',
      label: 'Applies to',
      fit: true,
      render: (row) => <AvatarGroup people={row.appliesTo} size="md" max={1} label={`Applies to, ${row.name}`} />,
    },
    {
      key: 'allDay',
      label: 'All Day',
      fit: true,
      render: (row) => (
        <Tag variant="tonal" tone={row.allDay ? 'success' : 'neutral'} size="sm">
          {row.allDay ? 'All Day' : 'Partial Day'}
        </Tag>
      ),
    },
    {
      key: 'recurring',
      label: 'Recurring',
      fit: true,
      render: (row) => <span className="text-label-sm-medium text-text-primary">{row.recurring ? 'Yearly' : 'One-Time'}</span>,
    },
    {
      key: 'addedBy',
      label: 'Added By',
      fit: true,
      render: (row) =>
        row.addedBy === 'system' ? (
          <span className="text-label-sm-medium text-text-tertiary">System</span>
        ) : (
          <Avatar name={row.addedBy.name} src={row.addedBy.src} size="md" standalone />
        ),
    },
    { key: 'source', label: 'Source', fit: true, render: (row) => <HolidaySourceBadge source={row.source} /> },
  ];

  if (admin) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      fit: true,
      render: (row) => (
        <span className="flex items-center gap-2">
          {/* The system's own entries can be removed but not changed. */}
          {row.addedBy !== 'system' && (
            <IconButton icon="note-pencil" variant="tonal" size="xs" shape="round" label={`Edit ${row.name}`} onClick={() => onEdit?.(row)} />
          )}
          <IconButton
            icon="trash"
            variant="tonal"
            size="xs"
            shape="round"
            label={`Delete ${row.name}`}
            onClick={() => onDelete?.(row)}
            className="text-accent-critical-tonal-content-default bg-accent-critical-tonal-surface-default hover:bg-accent-critical-tonal-surface-hover active:bg-accent-critical-tonal-surface-pressed"
          />
        </span>
      ),
    });
  }

  const typeOptions: SearchSelectOption[] = [
    { value: '', label: 'All Holiday Types' },
    ...HOLIDAY_TYPES.map((type) => ({ value: type, label: `${holidayTypeLabel(type)} Holiday` })),
  ];
  const userOptions: SearchSelectOption[] = [{ value: ALL_USERS, label: 'All Users' }, ...users];

  const paginated = pageCount !== undefined && onPageChange !== undefined;

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <SearchSelect
            className="w-60"
            emphasis="regular"
            searchable={false}
            placeholder="All Holiday Types"
            aria-label="Holiday type"
            options={typeOptions}
            value={filters.type}
            onChange={(type) => onFiltersChange({ ...filters, type: type as HolidayType | '' })}
          />
          {/* The existing month picker with the sprints passed in as its presets: a month picks the month, a sprint its own dates, Clear empties the filter. */}
          <DateField
            className="w-60"
            mode="month"
            emphasis="regular"
            placeholder="Select Period"
            aria-label="Period"
            value={filters.period?.start}
            rangeEnd={filters.period?.end}
            picker={{ presets: periodPresets }}
            onChange={(first) => onFiltersChange({ ...filters, period: { start: first, end: lastDayOf(first) } })}
            onRangeChange={(start, end) => onFiltersChange({ ...filters, period: { start, end: end ?? lastDayOf(start) } })}
            onClear={() => onFiltersChange({ ...filters, period: null })}
          />
          <SearchSelect
            className="w-60"
            emphasis="regular"
            rows="avatar"
            placeholder="All Users"
            aria-label="Applies to"
            options={userOptions}
            value={filters.user}
            onChange={(user) => onFiltersChange({ ...filters, user })}
          />
        </div>
        {admin && (
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" iconLeft={<Icon name="plus" size="sm" aria-hidden="true" />} onClick={onAdd}>
              Add Holiday
            </Button>
            <Button size="sm" variant="secondary" onClick={onImport}>
              Import from Hubstaff
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        sort={sort}
        onSortChange={onSortChange}
        caption={caption}
        empty={<EmptyState title="No holidays have been added yet." />}
      />

      {paginated && (
        <div className="flex justify-end">
          <Pagination page={page} pageCount={pageCount} onChange={onPageChange} itemCount={itemCount} pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
        </div>
      )}
    </div>
  );
}
HolidayTable.displayName = 'HolidayTable';
