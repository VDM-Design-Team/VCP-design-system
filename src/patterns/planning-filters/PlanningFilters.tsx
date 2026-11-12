import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Input } from '../../atoms/input';
import { SearchSelect, type SearchSelectOption } from '../../components/search-select';

/**
 * PlanningFilters — the row above the Planning list: a search box, a status filter, a priority filter, Reset, and
 * the View Cycle button. Built to Figma's `_Planning_Filters` (`4617:56260`) and the Planning Page frame.
 *
 * It is only what that page needs. The Filters page of the library draws a much bigger bar — tags, a period, user
 * filters, a Filters toggle, a mobile layout — and that is a separate piece (`FilterBar`); nothing of it is here.
 *
 * - **Search** — "Search by title or ID". `onChange` fires on every keystroke; debounce it on your side if the
 *   list is on a server.
 * - **Status and priority** — single-pick `SearchSelect`s. The options are yours, because status differs by
 *   domain (Design and Development have different steps); priority defaults to Low, Normal, High, Urgent.
 *   Picking is immediate. They read **regular** weight (`emphasis="regular"`) — a filter sits quietly. The placeholders follow the system's: "Select status", "Select priority" (a picker says
 *   *Select*; only a search box says *Search*).
 * - **Reset** — a ghost button that hands the page `onReset`; the page clears its filters. The bar holds no
 *   state of its own: `value` in, `onChange` out.
 * - **View Cycle** — the filled button with the calendar glyph, `onViewCycle`. What it opens is the page's.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface PlanningFiltersValue {
  /** The search text. */
  search: string;
  /** The picked status option's `value`; `''` is none. */
  status: string;
  /** The picked priority option's `value`; `''` is none. */
  priority: string;
}

export interface PlanningFiltersProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  value: PlanningFiltersValue;
  onChange: (value: PlanningFiltersValue) => void;
  /** The status choices for the domain — strings, or `{ value, label, group? }`. */
  statusOptions: ReadonlyArray<string | SearchSelectOption>;
  /** The priority choices. Defaults to Low, Normal, High, Urgent. */
  priorityOptions?: ReadonlyArray<string | SearchSelectOption>;
  /** Clear the filters. */
  onReset: () => void;
  /** Open the cycle view. Omit it and the button is not drawn. */
  onViewCycle?: () => void;
  statusPlaceholder?: string;
  priorityPlaceholder?: string;
  searchPlaceholder?: string;
  resetLabel?: string;
  viewCycleLabel?: string;
}

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;

export const PlanningFilters = React.forwardRef<HTMLDivElement, PlanningFiltersProps>(
  (
    {
      className,
      value,
      onChange,
      statusOptions,
      priorityOptions = PRIORITIES,
      onReset,
      onViewCycle,
      statusPlaceholder = 'Select status',
      priorityPlaceholder = 'Select priority',
      searchPlaceholder = 'Search by title or ID',
      resetLabel = 'Reset',
      viewCycleLabel = 'View Cycle',
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      role="search"
      aria-label="Filter the planning list"
      className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-3 font-sans', className)}
      {...props}
    >
      <Input
        type="search"
        edge="neutral"
        aria-label={searchPlaceholder}
        placeholder={searchPlaceholder}
        leadingIcon={<Icon name="magnifying-glass" size="sm" />}
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        className="w-full max-w-75 min-w-56"
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchSelect
          edge="neutral"
          aria-label="Status"
          emphasis="regular"
          placeholder={statusPlaceholder}
          searchable={false}
          options={statusOptions}
          value={value.status}
          onChange={(status) => onChange({ ...value, status })}
          className="w-40"
        />
        <SearchSelect
          edge="neutral"
          aria-label="Priority"
          emphasis="regular"
          placeholder={priorityPlaceholder}
          searchable={false}
          options={priorityOptions}
          value={value.priority}
          onChange={(priority) => onChange({ ...value, priority })}
          className="w-44"
        />
        <Button variant="tertiary" type="button" onClick={onReset}>
          {resetLabel}
        </Button>
        {onViewCycle && (
          <Button
            type="button"
            onClick={onViewCycle}
            iconLeft={<Icon name="calendar-dots" size="md" aria-hidden="true" />}
          >
            {viewCycleLabel}
          </Button>
        )}
      </div>
    </div>
  ),
);
PlanningFilters.displayName = 'PlanningFilters';
