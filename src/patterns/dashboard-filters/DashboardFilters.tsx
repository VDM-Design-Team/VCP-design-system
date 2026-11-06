import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Select } from '../../atoms/select';
import { Menu } from '../../components/menu';

/**
 * DashboardFilters — the global filter bar at the top of a dashboard: a **Reset Filters** link, the filters (the cycle, the year, the
 * team) and an **Export** button, in one row on the right of the page title. Built to Figma's `Dashboard_Global_Filters_And_Export`
 * (`7577:107312`).
 *
 * - **It is data, not a layout.** Pass `filters` (each a `{ key, label, value, options, onChange }`, drawn as a quiet `Select`)
 *   and the bar lays them out. A dashboard with two filters passes two; the superadmin's has its own, so it has none of these.
 * - **Reset and Export are optional.** `onReset` shows the Reset Filters button (tertiary); `exportLabel` shows the export button
 *   (secondary, with a caret). Give it `exportOptions` and the button opens a menu of them (the formats, or which report), reported
 *   to `onExport(key)`; without options it is one button, and `onExport()` hears the press.
 * - **It does no filtering.** It reports each choice, and the page changes what the charts and cards are given.
 * - **Every control is 40 high**: the selects and the buttons are all `md`, the one size they share (a small select is 32 and a small button 36), and the
 *   view switch beside the title is the same 40.
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
  /** The select's width, as a Tailwind width class. */
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
  ({ className, filters, onReset, resetLabel = 'Reset Filters', exportLabel, exportOptions, onExport, ...props }, ref) => {
    const exportButton = exportLabel ? (
      <Button
        variant="secondary"
        iconLeft={<Icon name="caret-down" size="sm" aria-hidden="true" />}
        onClick={exportOptions ? undefined : () => onExport?.()}
      >
        {exportLabel}
      </Button>
    ) : null;

    return (
      <div ref={ref} role="group" aria-label="Dashboard filters" className={cn('flex flex-wrap items-center justify-end gap-2 font-sans', className)} {...props}>
        {onReset && (
          <Button variant="tertiary" onClick={onReset}>
            {resetLabel}
          </Button>
        )}
        {filters.map((f) => (
          <Select key={f.key} emphasis="regular" aria-label={f.label} className={f.className ?? 'w-36'} value={f.value} options={f.options} onChange={f.onChange} />
        ))}
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
