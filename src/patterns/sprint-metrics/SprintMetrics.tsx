import * as React from 'react';
import { cn } from '../../lib/cn';
import type { ChartSeries } from '../../lib/chart-series';
import { BarChart, type BarChartDatum } from '../../components/bar-chart';

/**
 * SprintMetrics — how each sprint's capacity was used, as grouped bars: for every sprint, its Capacity, Commitment, Completed and
 * Overdue points, under a "Current: Mar 1 - Mar 15" line. Built to Figma's `Sprint_Metrics` (`7579:108013`).
 *
 * - **It is data, not a picture.** Pass `data` (a sprint's `label` and its `values`); the axis, bars and legend follow. Capacity is the
 *   system's `available` series and Commitment its `committed` one, so the colours read as they do on every other chart; Figma's own
 *   orange Overdue is the system's red here.
 * - **Numbers sit over the bars**, the gridlines are dashed and the legend is above the chart, as Figma draws it.
 * - **It is responsive to its card**: the chart narrows, then drops a bar's number when it will not fit and thins its labels (see `BarChart`).
 * - **While the data loads** pass `loading`; with no sprints it says `empty`.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const SERIES: readonly ChartSeries[] = ['available', 'committed', 'completed', 'overdue'];
const LABELS = { available: 'Capacity', committed: 'Commitment' } as const;

export interface SprintMetricsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  data: readonly BarChartDatum[];
  title?: string;
  /** The line under the title: "Current: Mar 1 - Mar 15". Yours to write: which sprint is current is the product's. */
  description?: React.ReactNode;
  /** The series to draw, in order. */
  series?: readonly ChartSeries[];
  yLabel?: string;
  unit?: string;
  height?: number;
  loading?: boolean;
  empty?: React.ReactNode;
}

export const SprintMetrics = React.forwardRef<HTMLElement, SprintMetricsProps>(
  ({ className, data, title = 'Sprint Metrics', description, series = SERIES, yLabel = 'Points', unit = 'pts', height, loading, empty, ...props }, ref) => {
    const headingId = React.useId();
    return (
      <section ref={ref} aria-labelledby={headingId} className={cn('@container flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)} {...props}>
        <header className="flex flex-col gap-1">
          <h2 id={headingId} className="m-0 text-title-sm-semibold text-text-primary">
            {title}
          </h2>
          {description && <p className="m-0 text-body-sm-regular text-text-secondary">{description}</p>}
        </header>
        <BarChart
          data={data}
          series={series}
          seriesLabels={LABELS}
          caption={title}
          yLabel={yLabel}
          unit={unit}
          height={height}
          yTickCount={4}
          valueLabels="above"
          grid="dashed"
          legend="top"
          maxBarWidth={64}
          loading={loading}
          empty={empty}
        />
      </section>
    );
  },
);
SprintMetrics.displayName = 'SprintMetrics';
