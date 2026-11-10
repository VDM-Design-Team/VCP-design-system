import * as React from 'react';
import { cn } from '../../lib/cn';
import type { ChartSeries } from '../../lib/chart-series';
import { Divider } from '../../atoms/divider';
import { CardHeader } from '../../components/card-header';
import { LineChart, type LineChartDatum, type LineChartProps } from '../../components/line-chart';

/**
 * CycleBurndown — how a cycle's points burned down over its days: a line for each of Completed, Committed, Overdue and Available
 * across the cycle's working days, with a row of totals under the chart and a legend. Built to Figma's `Cycle_Burndown`
 * (`7581:80708`).
 *
 * - **It is data, not a picture.** Pass `data`: **one entry per day**, each with a `label` for the axis ("June 20") and a `values` map of
 *   the series to that day's points. The axis, the four lines, the dots, the tooltip and the legend follow. Days are evenly spaced
 *   in the order given, so leave weekends out and the line does not stretch over them. A day with no value for a series breaks that line.
 * - **The totals are yours.** `stats` is a row of `{ key, label, value, tone }` under the chart (Figma draws Completed, Remaining
 *   and Off-track); the chart works none of them out, since what "remaining" or "off-track" means is the product's.
 * - **It follows the page's filters.** There are none here: when the page's timeframe or team changes, pass the new `data`
 *   (and `loading` while it fetches).
 * - **It is responsive to its card**: the plot takes the card's width and thins its date labels when they would collide; the totals and
 *   the legend wrap.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type CycleBurndownStatTone = 'neutral' | 'success' | 'brand' | 'critical';

export interface CycleBurndownStat {
  key: string;
  label: string;
  value: React.ReactNode;
  tone?: CycleBurndownStatTone;
}

export interface CycleBurndownProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    Pick<LineChartProps, 'formatValue' | 'formatTick' | 'onSelectDatum' | 'renderTooltip' | 'toggleSeries' | 'defaultHiddenSeries' | 'onToggleSeries'> {
  /** One entry per day, in order. */
  data: readonly LineChartDatum[];
  title?: string;
  /** Explains the card, behind an info glyph after the title. Omit it and there is no glyph. */
  hint?: string;
  /** The totals under the chart. */
  stats?: readonly CycleBurndownStat[];
  /** The lines to draw, in order. */
  series?: readonly ChartSeries[];
  /** What a day is called in the hover card's heading: "Date" gives "Date: 06.20.2025". */
  pointLabel?: string;
  /** A different word for a series ("Pts Completed"). */
  seriesLabels?: Partial<Record<ChartSeries, string>>;
  yLabel?: string;
  unit?: string;
  height?: number;
  loading?: boolean;
  empty?: React.ReactNode;
}

const STAT_TONE: Record<CycleBurndownStatTone, string> = {
  neutral: 'text-text-primary',
  success: 'text-accent-success-outline-content-default',
  brand: 'text-text-brand-medium',
  critical: 'text-accent-critical-outline-content-default',
};

const SERIES: readonly ChartSeries[] = ['completed', 'committed', 'overdue', 'available'];

export const CycleBurndown = React.forwardRef<HTMLElement, CycleBurndownProps>(
  ({ className, data, title = 'Cycle Burndown', hint, stats, series = SERIES, seriesLabels, pointLabel = 'Date', yLabel = 'Development Points', unit = 'pts', height, loading, empty, formatValue, formatTick, onSelectDatum, renderTooltip, toggleSeries, defaultHiddenSeries, onToggleSeries, ...props }, ref) => {
    const headingId = React.useId();
    return (
      <section ref={ref} aria-labelledby={headingId} aria-busy={loading || undefined} className={cn('@container flex flex-col gap-6 rounded-md bg-surface-elevated p-6 font-sans', className)} {...props}>
        <CardHeader title={title} headingId={headingId} hint={hint} />

        <LineChart data={data} series={series} seriesLabels={seriesLabels} pointLabel={pointLabel} caption={title} yLabel={yLabel} unit={unit} height={height} loading={loading} empty={empty} formatValue={formatValue} formatTick={formatTick} onSelectDatum={onSelectDatum} renderTooltip={renderTooltip} toggleSeries={toggleSeries} defaultHiddenSeries={defaultHiddenSeries} onToggleSeries={onToggleSeries} />

        {stats && stats.length > 0 && !loading && (
          <div className="flex flex-col gap-4">
            <Divider />
            <dl className="m-0 flex flex-wrap items-start justify-center gap-x-12 gap-y-3">
              {stats.map((s) => (
                <div key={s.key} className="flex flex-col items-center gap-1">
                  <dt className="text-caption-md-medium text-text-secondary">{s.label}</dt>
                  <dd className={cn('m-0 text-label-sm-semibold', STAT_TONE[s.tone ?? 'neutral'])}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>
    );
  },
);
CycleBurndown.displayName = 'CycleBurndown';
