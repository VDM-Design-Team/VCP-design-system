import * as React from 'react';
import { cn } from '../../lib/cn';
import { CHART_SERIES, type ChartSeries } from '../../lib/chart-series';
import { niceTicks, useElementWidth } from '../../lib/chart-scale';
import { LegendItem } from '../../atoms/legend-item';
import { Skeleton } from '../../atoms/skeleton';

/**
 * LineChart — one line per series across an ordered axis (days, sprints), a dot at every point. The chart inside Figma's
 * `Cycle_Burndown`.
 *
 * - **It is data, not a picture.** Pass `data` (one entry per point: a `label` for the axis and a `values` map of series to
 *   numbers) and `series` (which lines to draw, in order). The axis (0 up to a readable top), the lines, the dots, the
 *   tooltip and the legend follow. The points are **evenly spaced in the order given**, so a burndown over working days has no
 *   gap where the weekend was; the labels are yours to format.
 * - **A point with no value breaks the line** (a gap, not a drop to 0): a series that starts late or ends early is just shorter.
 * - **It is responsive.** It draws to the width it is given, in real pixels, and thins its axis labels out when they would collide.
 * - **Lines differ by more than colour**: Committed is dashed and Available dotted, Completed and Overdue solid, so the lines can
 *   be told apart without the colours (the legend and the tooltip name them too).
 * - **SVG, tokens only.** Colours are the series' (`src/lib/chart-series.ts`); grid and text are tokens, so dark comes free.
 * - **Hover** the plot for a tooltip with every series' value at the nearest point.
 * - **Keyboard:** the plot is one tab stop; the arrow keys move from point to point (Home and End jump, Escape clears), the tooltip
 *   follows, and the point is announced ("June 20: Completed 0, Committed 145 pts").
 *
 * It is not a real image: the picture is `aria-hidden` and the same numbers are in a visually hidden table (named by `caption`).
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface LineChartDatum {
  key: string | number;
  /** The point's name on the axis: "June 20". */
  label: string;
  /** The heading of the tooltip, when it should say more than the axis does ("Fri 20 June 2025"). Defaults to `label`. */
  title?: string;
  /** Series → value. A series left out (or `null`) has no point here, and its line breaks. */
  values: Partial<Record<ChartSeries, number | null>>;
}

export interface LineChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  data: readonly LineChartDatum[];
  /** Which lines to draw, in order. */
  series: readonly ChartSeries[];
  /** A different word for a series in this chart. */
  seriesLabels?: Partial<Record<ChartSeries, string>>;
  /** The chart's name: the table's caption for assistive tech ("Cycle Burndown"). */
  caption: string;
  /** What a point is called in the tooltip's heading: "Date" gives "Date: 06.20.2025". Without it the heading is just the point's title. */
  pointLabel?: string;
  /** The value axis' title, turned on its side. */
  yLabel?: string;
  /** After a number in the tooltip, the table and the announcement. */
  unit?: string;
  /** The plot and its axes, in px. */
  height?: number;
  yTickCount?: number;
  /** Pin the top of the axis. By default it is the next tick above the largest value. */
  yMax?: number;
  legend?: 'bottom' | 'none';
  loading?: boolean;
  empty?: React.ReactNode;
}

const MARGIN = { top: 16, right: 12, bottom: 28 } as const;
const AXIS_LABEL_WIDTH = 28;
const Y_TITLE_WIDTH = 24;
const EDGE = 12;

/* Not just colour: Committed (the plan) is dashed, Available dotted. */
const DASH: Partial<Record<ChartSeries, string>> = { committed: '6 4', available: '1 5' };

const label = (series: ChartSeries, labels?: Partial<Record<ChartSeries, string>>) => labels?.[series] ?? CHART_SERIES[series].label;
const has = (v: number | null | undefined): v is number => v !== null && v !== undefined && Number.isFinite(v);

export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    { className, data, series, seriesLabels, caption, pointLabel, yLabel, unit = 'pts', height = 244, yTickCount = 7, yMax, legend = 'bottom', loading, empty = 'Nothing to show for this period.', ...props },
    ref,
  ) => {
    const [plotRef, width] = useElementWidth<HTMLDivElement>();
    const [active, setActive] = React.useState<number | null>(null);
    const statusId = React.useId();

    const values = data.flatMap((d) => series.map((s) => d.values[s])).filter(has);
    const largest = Math.max(0, ...values);
    const ticks = niceTicks(yMax ?? largest, yTickCount, yMax !== undefined);
    const top = yMax ?? ticks[ticks.length - 1]!;
    const hasData = data.length > 0 && values.length > 0;

    const left = (yLabel ? Y_TITLE_WIDTH : 0) + AXIS_LABEL_WIDTH + 8;
    const plotW = Math.max(0, width - left - MARGIN.right);
    const plotH = height - MARGIN.top - MARGIN.bottom;
    const base = MARGIN.top + plotH;
    const y = (v: number) => MARGIN.top + plotH - (Math.min(Math.max(0, v), top) / top) * plotH;
    const n = data.length;
    const x = (i: number) => (n <= 1 ? left + plotW / 2 : left + EDGE + (i * (plotW - 2 * EDGE)) / (n - 1));
    const step = n > 1 ? (plotW - 2 * EDGE) / (n - 1) : plotW;

    const longest = Math.max(0, ...data.map((d) => d.label.length));
    const labelStep = step > 0 ? Math.max(1, Math.ceil((longest * 5.5 + 8) / step)) : 1;

    /* A series' path, broken wherever a point has no value. */
    const pathFor = (s: ChartSeries) => {
      let d = '';
      let pen = false;
      data.forEach((datum, i) => {
        const v = datum.values[s];
        if (!has(v)) {
          pen = false;
          return;
        }
        d += `${pen ? 'L' : 'M'}${x(i)},${y(v)} `;
        pen = true;
      });
      return d.trim();
    };

    const describe = (d: (typeof data)[number]) =>
      `${pointLabel ? `${pointLabel} ` : ''}${d.title ?? d.label}: ${series
        .filter((s) => has(d.values[s]))
        .map((s) => `${label(s, seriesLabels)} ${d.values[s]} ${unit}`)
        .join(', ')}`;

    const nearest = (clientX: number, el: Element) => {
      /* `el` is the hit area, which starts at the plot's left edge. */
      const px = clientX - el.getBoundingClientRect().left;
      if (n <= 1) return 0;
      return Math.min(n - 1, Math.max(0, Math.round((px - EDGE) / step)));
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      const move = (next: number) => {
        e.preventDefault();
        setActive(Math.min(n - 1, Math.max(0, next)));
      };
      if (e.key === 'ArrowRight') move((active ?? -1) + 1);
      else if (e.key === 'ArrowLeft') move((active ?? n) - 1);
      else if (e.key === 'Home') move(0);
      else if (e.key === 'End') move(n - 1);
      else if (e.key === 'Escape') setActive(null);
    };

    const legendEl = legend !== 'none' && series.length > 0 && (
      <ul aria-label="Legend" className="m-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-1 p-0">
        {series.map((s) => (
          <li key={s}>
            <LegendItem label={label(s, seriesLabels)} swatchClassName={CHART_SERIES[s].fill} />
          </li>
        ))}
      </ul>
    );

    const shown = active !== null ? data[active] : undefined;
    const tipLeft = active !== null ? x(active) : 0;

    return (
      <div ref={ref} className={cn('flex min-w-0 flex-col gap-4 font-sans', className)} aria-busy={loading || undefined} {...props}>
        <div
          ref={plotRef}
          className="relative min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
          style={{ height }}
          tabIndex={!loading && hasData ? 0 : undefined}
          role={!loading && hasData ? 'group' : undefined}
          aria-label={!loading && hasData ? `${caption}. Use the left and right arrow keys to read each point.` : undefined}
          aria-describedby={!loading && hasData ? statusId : undefined}
          onKeyDown={!loading && hasData ? onKeyDown : undefined}
          onBlur={() => setActive(null)}
        >
          {loading ? (
            <>
              <span role="status" className="sr-only">
                Loading {caption}
              </span>
              <Skeleton height={height} />
            </>
          ) : !hasData ? (
            <p className="m-0 grid h-full place-items-center text-body-sm-regular text-text-secondary">{empty}</p>
          ) : (
            width > 0 && (
              <>
                <svg width={width} height={height} aria-hidden="true" focusable="false" className="block overflow-visible">
                  {ticks.map((t) => (
                    <g key={t}>
                      <line x1={left} x2={left + plotW} y1={y(t)} y2={y(t)} className="stroke-stroke-subtle" strokeWidth={1} />
                      <text x={left - 8} y={y(t)} textAnchor="end" dominantBaseline="central" className="fill-text-secondary text-caption-sm-regular">
                        {t}
                      </text>
                    </g>
                  ))}
                  {yLabel && (
                    <text transform={`translate(${Y_TITLE_WIDTH / 2 - 4} ${MARGIN.top + plotH / 2}) rotate(-90)`} textAnchor="middle" className="fill-text-secondary text-caption-md-semibold">
                      {yLabel}
                    </text>
                  )}
                  {data.map((d, i) =>
                    i % labelStep === 0 ? (
                      <text key={d.key} x={x(i)} y={base + 18} textAnchor="middle" className="fill-text-secondary text-caption-sm-regular">
                        {d.label}
                      </text>
                    ) : null,
                  )}

                  {active !== null && <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={base} className="stroke-stroke-default" strokeWidth={1} />}

                  {series.map((s) => (
                    <path key={s} d={pathFor(s)} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={DASH[s]} className={CHART_SERIES[s].svgStroke} />
                  ))}
                  {series.map((s) =>
                    data.map((d, i) => {
                      const v = d.values[s];
                      return has(v) ? <circle key={`${s}-${d.key}`} cx={x(i)} cy={y(v)} r={active === i ? 5 : 3} className={CHART_SERIES[s].svgFill} /> : null;
                    }),
                  )}

                  {/* The pointer target for the whole plot: the nearest point wins. */}
                  <rect
                    x={left}
                    y={MARGIN.top}
                    width={plotW}
                    height={plotH + MARGIN.bottom}
                    fill="transparent"
                    onPointerMove={(e) => setActive(nearest(e.clientX, e.currentTarget))}
                    onPointerLeave={() => setActive(null)}
                  />
                </svg>

                {shown && (
                  <div
                    role="presentation"
                    className="pointer-events-none absolute z-10 w-max max-w-60 -translate-x-1/2 rounded-md border border-stroke-subtle bg-surface-elevated px-3 py-2 shadow-md"
                    style={{ left: Math.min(Math.max(tipLeft, 80), Math.max(80, width - 80)), top: MARGIN.top }}
                  >
                    <p className="m-0 text-caption-md-regular text-text-primary">
                      {pointLabel && <span className="text-caption-md-semibold">{pointLabel}: </span>}
                      <span className={pointLabel ? undefined : 'text-caption-md-semibold'}>{shown.title ?? shown.label}</span>
                    </p>
                    <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
                      {series.map((s) => (
                        <li key={s} className="flex items-center justify-between gap-3 text-caption-md-medium text-text-secondary">
                          <LegendItem size="sm" label={label(s, seriesLabels)} swatchClassName={CHART_SERIES[s].fill} />
                          <span className="text-text-primary">{has(shown.values[s]) ? `${shown.values[s]} ${unit}` : 'no data'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
          )}

          {!loading && hasData && (
            <>
              {/* Announces the point the arrow keys are on. */}
              <p id={statusId} role="status" aria-live="polite" className="sr-only">
                {shown ? describe(shown) : ''}
              </p>
              <div className="sr-only">
                <table>
                  <caption>{caption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Point</th>
                      {series.map((s) => (
                        <th key={s} scope="col">
                          {label(s, seriesLabels)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((d) => (
                      <tr key={d.key}>
                        <th scope="row">{d.title ?? d.label}</th>
                        {series.map((s) => (
                          <td key={s}>{has(d.values[s]) ? `${d.values[s]} ${unit}` : 'no data'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {legend === 'bottom' && legendEl}
      </div>
    );
  },
);
LineChart.displayName = 'LineChart';
