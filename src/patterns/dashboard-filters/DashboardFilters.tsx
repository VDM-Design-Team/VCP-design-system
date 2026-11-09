import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Select } from '../../atoms/select';
import { Menu } from '../../components/menu';
import { SearchSelect } from '../../components/search-select';

/**
 * DashboardFilters — the global filter bar at the top of a dashboard: the filters (the cycle, the year, the
 * team), then **Reset** and an **Export** button together at the end (as `FilterBar` ends with Reset and its button), in one row on the right of the page title. Built to Figma's `Dashboard_Global_Filters_And_Export`
 * (`7577:107312`).
 *
 * - **It is data, not a layout.** Pass `filters` (each a `{ key, label, value, options, onChange }`, drawn as a quiet `Select`, or as a searchable `SearchSelect` when `searchable`: the cycle's list is long)
 *   and the bar lays them out. A dashboard with two filters passes two; the superadmin's has its own, so it has none of these.
 * - **Reset and Export are optional.** `onReset` shows the Reset button (tertiary, "Reset", next to Export); `exportLabel` shows the export button
 *   (secondary, with a caret). Give it `exportOptions` and the button opens a menu of them (the formats, or which report), reported
 *   to `onExport(key)`; without options it is one button, and `onExport()` hears the press.
 * - **It does no filtering.** It reports each choice, and the page changes what the charts and cards are given.
 * - **The selects hug their longest option**, so none carries empty space and the whole row stays short (at 1440 wide it fits beside the title on one line).
 * - **Every control is 36 high**: the selects are `compact`, the buttons `sm` and the view switch beside the title `md`, the three sizes that are 36 (a plain
 *   small select is 32), as Figma draws the row.
 * - **It wraps**, right-aligned: in a narrow page the row breaks onto a second line instead of overflowing.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface DashboardFilter {
  key: string;
  /** What the filter is, for assistive tech ("Cycle", "Year", "Team"). */
  label: string;
  value: string;
  options: ReadonlyArray<string | { value: string; label: string }>;
  onChange: (value: string) => void;
  /** A search box in the list: "C39" or "Aug 2026" finds a cycle. For a long list (the cycles); a short one (years, teams) stays a plain select. */
  searchable?: boolean;
  /** The search box's placeholder and name. */
  searchPlaceholder?: string;
  /** The filter's width, as a Tailwind width class. A plain select hugs its longest option (capped at 20rem); a searchable one is 19.5rem (the longest cycle label and its caret). */
  className?: string;
}

export interface DashboardFiltersProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  filters: readonly DashboardFilter[];
  /** Resets every filter. Shows the reset button when given. */
  onReset?: () => void;
  resetLabel?: string;
  /** The export button's words ("Export Cycle Report"). Shows the button when given. */
  exportLabel?: string;
  /** What the export button offers. Without it the button is one press. */
  exportOptions?: ReadonlyArray<{ key: string; label: string }>;
  /** The export was chosen: with the option's `key` when there are options. */
  onExport?: (key?: string) => void;
}

export const DashboardFilters = React.forwardRef<HTMLDivElement, DashboardFiltersProps>(
  ({ className, filters, onReset, resetLabel = 'Reset', exportLabel, exportOptions, onExport, ...props }, ref) => {
    const exportButton = exportLabel ? (
      <Button
        variant="secondary"
        size="sm"
        iconLeft={<Icon name="caret-down" size="sm" aria-hidden="true" />}
        onClick={exportOptions ? undefined : () => onExport?.()}
      >
        {exportLabel}
      </Button>
    ) : null;

    return (
      <div ref={ref} role="group" aria-label="Dashboard filters" className={cn('flex flex-wrap items-center justify-end gap-2 font-sans', className)} {...props}>
        {filters.map((f) =>
          f.searchable ? (
            <SearchSelect
              key={f.key}
              size="compact"
              edge="neutral"
              emphasis="regular"
              aria-label={f.label}
              searchPlaceholder={f.searchPlaceholder ?? 'Search...'}
              className={f.className ?? 'w-78'}
              value={f.value}
              options={f.options}
              onChange={f.onChange}
            />
          ) : (
            <Select key={f.key} size="compact" edge="neutral" emphasis="regular" aria-label={f.label} className={f.className ?? 'max-w-80'} value={f.value} options={f.options} onChange={f.onChange} />
          ),
        )}
        {onReset && (
          <Button variant="tertiary" size="sm" onClick={onReset}>
            {resetLabel}
          </Button>
        )}
        {exportButton && exportOptions ? (
          <Menu trigger={exportButton} items={exportOptions.map((o) => ({ key: o.key, label: o.label }))} onSelect={(key) => onExport?.(key)} />
        ) : (
          exportButton
        )}
      </div>
    );
  },
);
DashboardFilters.displayName = 'DashboardFilters';
