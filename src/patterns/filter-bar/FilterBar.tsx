import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Select, type SelectOption } from '../../atoms/select';
import { DatePicker, type DatePickerPreset } from '../../components/date-picker';
import {
  SearchSelect,
  type SearchSelectDisplay,
  type SearchSelectOption,
  type SearchSelectProps,
  type SearchSelectRows,
} from '../../components/search-select';
import { Popover } from '../../components/popover';
import { useDateFormat } from '../../lib/format-date';

/**
 * FilterBar — the row of filters above a list or table: a search field, the
 * filter fields (period, status, priority, tags), "Reset" and a "Filters"
 * button that shows or hides the fields.
 *
 * Built to Figma's Manage table (`940:167946`, decided 10 Nov 2026 for every list): the search field
 * at the left with Reset and Filters at the right, then the fields under them, **each with its label
 * above** (Priority, Tags, Status, Date, then the people), six to a row on a wide screen. Below `md`
 * the bar stacks as Figma's Mobile does: Reset and Filters, then search, then the fields in two
 * columns. The filter menus are Figma's `Filters` page.
 *
 * **The filters are yours.** Each one is controlled: you pass its `options`,
 * its `value` and an `onChange`, and filter your own list. The bar draws the
 * fields and reports the wishes; it filters nothing and keeps no values.
 * Which fields show is which props you pass — a page with no priority just
 * leaves `priority` out.
 *
 * - **period** — a field that opens a range calendar (`DatePicker`, two months
 *   and your `presets`). The value is `{ start, end }` in ISO `yyyy-mm-dd`;
 *   the field reads it as `dd/mm/yyyy-dd/mm/yyyy`, as Figma draws it.
 * - **cycle** — `SearchSelect` with search, one pick. Each row reads **C33** (25/05/
 *   2026 - 08/06/2026) as in the AV details card; the field says just the code, so
 *   it stays narrow enough to share a row. Cycles are data: pass `code`, `start` and
 *   `end` (ISO).
 * - **status** — `SearchSelect` (several picks, no search box) with the Clear all /
 *   Apply footer, shown as a summary ("In progress", "3 selected").
 * - **priority** — `Select`. Put an explicit "All priorities" option in the
 *   list if "no filter" should be a choice.
 * - **tags** — `SearchSelect` with search, whose picks are removable tags in the field;
 *   give options a `group` for the Global / Domain-Specific headings.
 * - **users** — one `SearchSelect` per entry (Assignee, Initiator…): a searchable
 *   list of people with avatars. Each is named by its `label`, and once filled it reads "Assignee: Amy Lee" (or "Assignee: 2 selected"), so the field still says which person it filters.
 * - **children** — more fields in the same row (an assignee picker, say),
 *   shown and hidden with the others.
 *
 * "Reset" and "Filters" are always there. `onReset` is what Reset does; the
 * bar cannot clear values it does not hold.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface FilterBarPeriod {
  /** ISO `yyyy-mm-dd` ends. An open range has only `start`. */
  value?: { start?: string; end?: string };
  /** The range changed. `{}` when it was cleared. */
  onChange?: (range: { start?: string; end?: string }) => void;
  /** The field's label. Figma's is "Date". */
  label?: string;
  /** Quick picks beside the calendar ("Last 7 days"…). What they mean is yours. */
  presets?: readonly DatePickerPreset[];
  placeholder?: string;
}

export interface FilterBarCycleOption {
  value: string;
  /** "C33". */
  code: string;
  /** ISO `yyyy-mm-dd`. */
  start: string;
  end: string;
}

export interface FilterBarCycle {
  options: ReadonlyArray<FilterBarCycleOption>;
  /** The picked cycle's `value`. `''` shows the placeholder. */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface FilterBarSelect {
  options: ReadonlyArray<string | SelectOption>;
  /** `''` shows the placeholder. */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface FilterBarMulti {
  options: ReadonlyArray<string | SearchSelectOption>;
  value?: readonly string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /** The panel's search box. Status has none by default, tags has one. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** What each row looks like: `text` (default), `avatar`, `icon` or `tag`. */
  rows?: SearchSelectRows;
}

export type FilterBarUser = {
  /** Names the field for assistive tech and builds its placeholder ("Select assignee"). */
  label: string;
  options: ReadonlyArray<SearchSelectOption>;
  placeholder?: string;
  /** Row style. People get avatars (`avatar`) unless you say otherwise. */
  rows?: SearchSelectRows;
} & (
  | { multiple?: false; value?: string; onChange?: (value: string) => void; display?: never }
  | {
      /** Several people: the panel stays open and the field summarises the picks. */
      multiple: true;
      value?: readonly string[];
      onChange?: (value: string[]) => void;
      display?: SearchSelectDisplay;
    }
);

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  period?: FilterBarPeriod;
  cycle?: FilterBarCycle;
  status?: FilterBarMulti;
  priority?: FilterBarSelect;
  tags?: FilterBarMulti;
  /** People pickers, after tags: one field per entry. */
  users?: readonly FilterBarUser[];
  /** Fires when "Reset" is pressed. The button is always shown. */
  onReset?: () => void;
  resetLabel?: string;
  /** Whether the filter fields show. Uncontrolled (shown) when omitted. */
  filtersOpen?: boolean;
  onFiltersOpenChange?: (open: boolean) => void;
  filtersLabel?: string;
  /** Extra fields, in the same row as the others. */
  children?: React.ReactNode;
}


/* Below `md` the calendar takes its touch layout, one month wide. */
function useNarrow() {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(max-width: 47.99rem)');
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return narrow;
}

export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  {
    className,
    search,
    onSearchChange,
    searchPlaceholder = 'Search by title or ID',
    period,
    cycle,
    status,
    priority,
    tags,
    users,
    onReset,
    resetLabel = 'Reset',
    filtersOpen,
    onFiltersOpenChange,
    filtersLabel = 'Filters',
    children,
    ...props
  },
  ref,
) {
  const fieldsId = React.useId();
  const narrow = useNarrow();
  const [openState, setOpenState] = React.useState(true);
  const open = filtersOpen ?? openState;
  const [periodOpen, setPeriodOpen] = React.useState(false);
  /* dd/mm/yyyy, or the person's locale when the product sets one — the same as every date in the system. */
  const { format: display, range: dateRange } = useDateFormat();
  /* A cycle's dates read like every date: dd/mm/yyyy, or the person's locale. */
  const cycleRange = (c: FilterBarCycleOption) => dateRange(c.start, c.end);

  const hasFields = !!(period || cycle || status || priority || tags || users?.length || children);
  /* With no fields showing (folded away, or none passed) the search takes the room they leave. */
  const showFields = hasFields && open;
  const range = period?.value;
  const periodText = range?.start
    ? range.end
      ? `${display(range.start)}-${display(range.end)}`
      : display(range.start)
    : null;

  /* One label per field, above it, as Figma's Manage table draws them: the label names the control too. */
  const ids = {
    period: `${fieldsId}-period`,
    cycle: `${fieldsId}-cycle`,
    status: `${fieldsId}-status`,
    priority: `${fieldsId}-priority`,
    tags: `${fieldsId}-tags`,
    user: (i: number) => `${fieldsId}-user-${i}`,
  };
  /* `min-w-0` on every control: a SearchSelect's own minimum (12rem) is wider than a sixth of a 1120 bar. */
  const labelled = (id: string, label: string, control: React.ReactNode, wide = false) => (
    <div key={id} className={cn('flex min-w-0 flex-col gap-1.5', wide && 'col-span-2 md:col-span-1')}>
      <label htmlFor={id} className="text-label-sm-medium text-text-primary">
        {label}
      </label>
      {control}
    </div>
  );
  const periodLabel = period?.label ?? 'Date';

  return (
    <div ref={ref} className={cn('flex flex-col gap-4 font-sans', className)} {...props}>
      {/* The top row: search at the left, Reset and Filters at the right. On a phone the buttons come first. */}
      <div className="flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          type="search"
          edge="neutral"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={search ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          leadingIcon={<Icon name="magnifying-glass" size="sm" />}
          className="w-full md:max-w-80"
        />
        <div className="flex items-center justify-end gap-2">
          <Button variant="tertiary" onClick={onReset}>
            {resetLabel}
          </Button>
          <Button
            /* Figma's Filters is the filled button. */
            variant="primary"
            aria-expanded={hasFields ? open : undefined}
            aria-controls={hasFields ? fieldsId : undefined}
            onClick={() => {
              setOpenState(!open);
              onFiltersOpenChange?.(!open);
            }}
          >
            {filtersLabel}
          </Button>
        </div>
      </div>

      {hasFields && (
        <div
          id={fieldsId}
          className={cn(open ? 'grid grid-cols-2 items-start gap-x-4 gap-y-3 md:grid-cols-3 lg:grid-cols-6' : 'hidden')}
        >
          {priority &&
            labelled(
              ids.priority,
              'Priority',
              <Select edge="neutral" placeholder="Select priority" {...priority} id={ids.priority} className="w-full min-w-0" />,
            )}
          {tags &&
            labelled(
              ids.tags,
              'Tags',
              <SearchSelect
                edge="neutral"
                multiple
                display="tags"
                searchPlaceholder="Search tags"
                placeholder="Select tags"
                {...tags}
                id={ids.tags}
                className="w-full min-w-0"
              />,
              true,
            )}
          {status &&
            labelled(
              ids.status,
              'Status',
              <SearchSelect
                edge="neutral"
                multiple
                display="summary"
                confirm
                searchable={false}
                placeholder="Select status"
                {...status}
                id={ids.status}
                className="w-full min-w-0"
              />,
            )}
          {period &&
            labelled(
              ids.period,
              periodLabel,
              <Popover
                open={periodOpen}
                onOpenChange={setPeriodOpen}
                width="auto"
                align="right"
                panelClassName="p-0"
                className="w-full min-w-0"
                trigger={
                  <button
                    id={ids.period}
                    type="button"
                    /* The visible label first, then the range, so the name starts with what is on screen. */
                    aria-label={periodText ? `${periodLabel}, ${periodText}` : periodLabel}
                    className={cn(
                      'flex h-10 w-full items-center gap-2 rounded-md border border-neutral-outline-border-default bg-surface-elevated px-3 text-left transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                    )}
                  >
                    <Icon name="calendar-blank" size="sm" aria-hidden="true" className="shrink-0 text-text-subtle" />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate',
                        periodText ? 'text-body-sm-medium text-text-primary' : 'text-body-sm-regular text-text-subtle',
                      )}
                    >
                      {periodText ?? period.placeholder ?? 'Select period'}
                    </span>
                  </button>
                }
                content={
                  <DatePicker
                    mode="range"
                    dualView={!narrow}
                    mobile={narrow}
                    presets={period.presets}
                    value={range?.start}
                    rangeEnd={range?.end}
                    onRangeChange={(start, end) => {
                      period.onChange?.(end ? { start, end } : { start });
                      if (end) setPeriodOpen(false);
                    }}
                    onClear={() => {
                      period.onChange?.({});
                      setPeriodOpen(false);
                    }}
                    className="shadow-none"
                  />
                }
              />,
              true,
            )}
          {cycle &&
            labelled(
              ids.cycle,
              'Cycle',
              <SearchSelect
                edge="neutral"
                id={ids.cycle}
                placeholder={cycle.placeholder ?? 'Select cycle'}
                searchPlaceholder="Search cycles"
                value={cycle.value ?? ''}
                onChange={cycle.onChange}
                /* The row says everything (and search matches the dates); the field says the code. */
                options={cycle.options.map((c) => ({
                  value: c.value,
                  label: `${c.code} (${cycleRange(c)})`,
                  shortLabel: c.code,
                }))}
                renderOption={(option) => {
                  const c = cycle.options.find((x) => x.value === option.value);
                  return c ? (
                    <span className="min-w-0 truncate">
                      <span className="text-label-sm-bold text-text-primary">{c.code}</span>
                      {/* The space is its own text node: a leading space inside an inline span is dropped from the accessible name. */}
                      {' '}
                      <span className="text-label-sm-regular">{`(${cycleRange(c)})`}</span>
                    </span>
                  ) : (
                    option.label
                  );
                }}
                className="w-full min-w-0"
              />,
              true,
            )}
          {users?.map(({ label, placeholder, ...rest }, i) =>
            labelled(
              ids.user(i),
              label,
              <SearchSelect
                edge="neutral"
                {...({
                  id: ids.user(i),
                  placeholder: placeholder ?? `Select ${label.toLowerCase()}`,
                  searchPlaceholder: 'Search by name',
                  rows: 'avatar',
                  ...rest,
                  className: 'w-full min-w-0',
                } as SearchSelectProps)}
              />,
            ),
          )}
          {children}
        </div>
      )}
    </div>
  );
});
FilterBar.displayName = 'FilterBar';
