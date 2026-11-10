import * as React from 'react';
import { cn } from '../../lib/cn';
import { CHART_SERIES, type ChartSeries } from '../../lib/chart-series';
import { LegendItem } from '../../atoms/legend-item';

/**
 * ChartLegend — the row of series under a chart: a colour and the word for each, from `CHART_SERIES`, so every chart's legend is the
 * same. With `onToggleSeries` each entry is a button that shows or hides its series (the chart redraws without it and its axis follows);
 * without it the entries are plain text.
 *
 * - **A toggle is a real button** with `aria-pressed` (true while the series is drawn), a 24 high target with a 40 press area, and the
 *   word struck through while it is hidden. Colour is never the only signal.
 * - **It owns no state.** `hiddenSeries` and `onToggleSeries` are the chart's; the chart stops the last visible series from being hidden.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface ChartLegendProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  series: readonly ChartSeries[];
  /** A different word for a series in this chart ("Capacity" for Available). */
  labels?: Partial<Record<ChartSeries, string>>;
  /** The series not drawn right now (they read as off). */
  hiddenSeries?: readonly ChartSeries[];
  /** Makes each entry a toggle button. */
  onToggleSeries?: (series: ChartSeries) => void;
}

export const ChartLegend = React.forwardRef<HTMLUListElement, ChartLegendProps>(({ className, series, labels, hiddenSeries = [], onToggleSeries, ...props }, ref) => (
  <ul ref={ref} aria-label="Legend" className={cn('m-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-1 p-0', className)} {...props}>
    {series.map((s) => {
      const text = labels?.[s] ?? CHART_SERIES[s].label;
      const off = hiddenSeries.includes(s);
      return (
        <li key={s}>
          {onToggleSeries ? (
            <button
              type="button"
              aria-pressed={!off}
              onClick={() => onToggleSeries(s)}
              className={cn(
                'relative inline-flex h-6 items-center rounded-sm before:absolute before:inset-x-0 before:-inset-y-2',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                off && 'line-through opacity-60',
              )}
            >
              <LegendItem label={text} swatchClassName={off ? 'bg-surface-neutral-medium' : CHART_SERIES[s].fill} />
            </button>
          ) : (
            <LegendItem label={text} swatchClassName={CHART_SERIES[s].fill} />
          )}
        </li>
      );
    })}
  </ul>
));
ChartLegend.displayName = 'ChartLegend';
