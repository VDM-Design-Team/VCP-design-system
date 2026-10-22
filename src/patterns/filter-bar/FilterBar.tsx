import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { Select, type SelectOption } from '../../atoms/select';
import { DatePicker, type DatePickerPreset } from '../../components/date-picker';
import { MultiSelect, type MultiSelectOption } from '../../components/multi-select';
import { Popover } from '../../components/popover';

/**
 * FilterBar — the row of filters above a list or table: a search field, the
 * filter fields (period, status, priority, tags), "Reset" and a "Filters"
 * button that shows or hides the fields.
 *
 * Built to Figma's `_Filter_Bar` (`3094:8860`) and the filter menus beside it
 * (`Filters` page). Desktop is one row: the search field at the left, the
 * fields, Reset and Filters at the right; a field that grows — Tags, once it
 * holds several tags — wraps the rest onto a second row. Below `md` the bar
 * stacks as Figma's Mobile does: Reset and Filters, then search, then the
 * fields in two columns.
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
 * - **status** — `MultiSelect` with the Clear all / Apply footer, shown as a
 *   summary ("In progress", "3 selected").
 * - **priority** — `Select`. Put an explicit "All priorities" option in the
 *   list if "no filter" should be a choice.
 * - **tags** — `MultiSelect` whose picks are removable tags in the field;
 *   give options a `group` for the Global / Domain-Specific headings.
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
  /** Quick picks beside the calendar ("Last 7 days"…). What they mean is yours. */
  presets?: readonly DatePickerPreset[];
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
  options: ReadonlyArray<string | MultiSelectOption>;
  value?: readonly string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  period?: FilterBarPeriod;
  status?: FilterBarMulti;
  priority?: FilterBarSelect;
  tags?: FilterBarMulti;
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

const pad = (n: number) => String(n).padStart(2, '0');
/* ISO yyyy-mm-dd → dd/mm/yyyy, as a string split: no Date, no time zone. */
const display = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${pad(Number(d))}/${pad(Number(m))}/${y}`;
};

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
    status,
    priority,
    tags,
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

  const hasFields = !!(period || status || priority || tags || children);
  const range = period?.value;
  const periodText = range?.start
    ? range.end
      ? `${display(range.start)}-${display(range.end)}`
      : display(range.start)
    : null;

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 font-sans md:grid md:grid-cols-[auto_1fr_auto] md:items-start',
        className,
      )}
      {...props}
    >
      <Input
        type="search"
        aria-label={searchPlaceholder}
        placeholder={searchPlaceholder}
        value={search ?? ''}
        onChange={(e) => onSearchChange?.(e.target.value)}
        leadingIcon={<Icon name="magnifying-glass" size="sm" />}
        className="order-2 w-full md:order-none md:col-start-1 md:w-75"
      />

      {/* From `md` the bar is three columns — search, fields, buttons — so the
          buttons stay at the top right however the fields wrap in the middle.
          On mobile each takes its place in the stack by `order`. */}
      {hasFields && (
        <div
          id={fieldsId}
          className={cn(
            'order-3 md:order-none md:col-start-2 md:min-w-0 md:flex-wrap md:items-start md:justify-end md:gap-2',
            open ? 'grid grid-cols-2 gap-2 md:flex' : 'hidden',
          )}
        >
          {period && (
            <Popover
              open={periodOpen}
              onOpenChange={setPeriodOpen}
              width="auto"
              align="right"
              panelClassName="p-0"
              className="col-span-2 md:w-60"
              trigger={
                <button
                  type="button"
                  aria-label={periodText ? `Period, ${periodText}` : 'Period'}
                  className={cn(
                    'flex h-10 w-full items-center gap-2 rounded-md border border-stroke-strong bg-surface-elevated px-3 text-left transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  <Icon name="calendar-blank" size="sm" aria-hidden="true" className="shrink-0 text-text-subtle" />
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate',
                      periodText
                        ? 'text-body-sm-medium text-text-primary'
                        : 'text-body-sm-regular text-text-subtle',
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
            />
          )}
          {status && (
            <MultiSelect
              display="summary"
              confirm
              aria-label="Status"
              placeholder="Select status"
              {...status}
              className="md:w-40"
            />
          )}
          {priority && (
            <Select
              aria-label="Priority"
              placeholder="Select priority"
              {...priority}
              className="w-full md:w-40"
            />
          )}
          {tags && (
            <MultiSelect
              aria-label="Tags"
              placeholder="Select tags"
              {...tags}
              className="col-span-2 md:min-w-40 md:max-w-170"
            />
          )}
          {children}
        </div>
      )}

      <div className="order-1 flex items-center justify-end gap-2 md:order-none md:col-start-3">
        <Button variant="tertiary" onClick={onReset}>
          {resetLabel}
        </Button>
        <Button
          variant="secondary"
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
  );
});
FilterBar.displayName = 'FilterBar';
