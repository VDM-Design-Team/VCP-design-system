import * as React from 'react';
import { cn } from '../../lib/cn';
import type { ChartSeries } from '../../lib/chart-series';
import { Select } from '../../atoms/select';
import { BarChart, type BarChartDatum, type BarChartProps } from '../../components/bar-chart';
import { CardHeader } from '../../components/card-header';

/**
 * CyclePerformance — how each cycle went, as grouped bars: for every cycle, the points Available, Overdue and Completed,
 * with filters (whose cycles, which quarter, which year) over the chart. Built to Figma's `Cycle_Performance` (`4217:33860`).
 *
 * - **It is data, not a picture.** Pass `data` (a cycle's `label` and its `values`); the axis, bars and legend follow. Which
 *   series, and their order, are `series` (Available, Overdue, Completed by default, as Figma draws them).
 * - **The filters are yours.** Each is `{ key, label, value, options, onChange }` and renders as a small, quiet `Select`; the chart
 *   does no filtering, since which cycles a person, a quarter or a year contains is the product's. Pass as many as the page has (Figma
 *   draws three) or none.
 * - **It is responsive to its card.** The title and the filters share a row and the filters wrap under the title when they run out
 *   of room; the chart narrows, then thins its labels (see `BarChart`).
 * - **While the data loads** pass `loading` (the filters stay); with no cycles it says `empty`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CyclePerformanceFilter {
  key: string;
  /** What the filter is, for assistive tech ("Show", "Quarter", "Year"). */
  label: string;
  value: string;
  options: ReadonlyArray<string | { value: string; label: string }>;
  onChange: (value: string) => void;
  /** The select's width, as a Tailwind width class. */
  className?: string;
}

export interface CyclePerformanceProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    Pick<BarChartProps, 'formatValue' | 'formatTick' | 'onSelectDatum' | 'renderTooltip' | 'toggleSeries' | 'defaultHiddenSeries' | 'onToggleSeries'> {
  data: readonly BarChartDatum[];
  title?: string;
  filters?: readonly CyclePerformanceFilter[];
  series?: readonly ChartSeries[];
  yLabel?: string;
  unit?: string;
  height?: number;
  loading?: boolean;
  empty?: React.ReactNode;
}

export const CyclePerformance = React.forwardRef<HTMLElement, CyclePerformanceProps>(
  (
    { className, data, title = 'Cycle Performance', filters, series = ['available', 'overdue', 'completed'], yLabel = 'Development Points', unit = 'pts', height, loading, empty, formatValue, formatTick, onSelectDatum, renderTooltip, toggleSeries, defaultHiddenSeries, onToggleSeries, ...props },
    ref,
  ) => {
    const headingId = React.useId();
    return (
      <section ref={ref} aria-labelledby={headingId} className={cn('@container flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)} {...props}>
        <CardHeader
          title={title}
          headingId={headingId}
          actions={
            filters && filters.length > 0 ? (
              <>
                {filters.map((f) => (
                  <Select
                    key={f.key}
                    size="sm"
                    emphasis="regular"
                    aria-label={f.label}
                    className={f.className ?? 'w-32'}
                    value={f.value}
                    options={f.options}
                    onChange={f.onChange}
                  />
                ))}
              </>
            ) : undefined
          }
        />
        <BarChart data={data} series={series} caption={title} yLabel={yLabel} unit={unit} height={height} loading={loading} empty={empty} formatValue={formatValue} formatTick={formatTick} onSelectDatum={onSelectDatum} renderTooltip={renderTooltip} toggleSeries={toggleSeries} defaultHiddenSeries={defaultHiddenSeries} onToggleSeries={onToggleSeries} />
      </section>
    );
  },
);
CyclePerformance.displayName = 'CyclePerformance';
