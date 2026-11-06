import * as React from 'react';
import { cn } from '../../lib/cn';
import { CHART_SERIES, type ChartSeries } from '../../lib/chart-series';
import { niceTicks, useElementWidth } from '../../lib/chart-scale';
import { LegendItem } from '../../atoms/legend-item';
import { Skeleton } from '../../atoms/skeleton';

/**
 * BarChart — grouped bars over a category axis: one group per category (a cycle, a sprint), one bar per series in it. The
 * chart inside Figma's `Cycle_Performance` and `Sprint_Metrics`.
 *
 * - **It is data, not a picture.** Pass `data` (a `label` and a `values` map of series to numbers per category) and `series` (which
 *   to draw, in order). The axis is worked out from the data (0 up to a readable top: 0, 25, 50 … 175), the bars are sized to
 *   it, and the legend follows the series. `yMax` pins the top when two charts must be read side by side.
 * - **It is responsive.** It draws to the width it is given, in real pixels (so type never scales): bars narrow, then give up
 *   their value label; category labels thin out to every other, third … one when they would collide; nothing overflows.
 * - **It is SVG, tokens only.** Colours are the series' (`src/lib/chart-series.ts`), grid and text are tokens, so dark comes free.
 * - **The legend is under the chart**, always (Figma draws Sprint Metrics' on top; the system keeps every chart's at the bottom).
 * - **Values** are written on the bars (`valueLabels="inside"`, Cycle Performance), over them (`"above"`, Sprint Metrics) or
 *   not at all. A bar too small to hold its number drops it; the number is still in the tooltip and the table.
 * - **Hover** a group for a tooltip with every value in it. The tooltip is for the pointer; every value is also in the text alternative.
 * - **While the data loads** pass `loading`; with nothing to draw it says `empty`.
 *
 * It is not a real image: the picture is `aria-hidden` and the same numbers are in a visually hidden table (named by `caption`), so a
 * screen reader gets the data, row by row, not "graphic".
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface BarChartDatum {
  key: string | number;
  /** The category's name on the axis: "Jan C23", "Mar 1 - Mar 15". */
  label: string;
  /** Series → value. A series left out is not drawn in this group. */
  values: Partial<Record<ChartSeries, number>>;
}

export interface BarChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  data: readonly BarChartDatum[];
  /** Which series to draw, in order. */
  series: readonly ChartSeries[];
  /** A different word for a series in this chart (Sprint Metrics calls Available "Capacity"). */
  seriesLabels?: Partial<Record<ChartSeries, string>>;
  /** The chart's name: the table's caption for assistive tech ("Cycle Performance"). */
  caption: string;
  /** The value axis' title, turned on its side: "Development Points". */
  yLabel?: string;
  /** After a number in the tooltip and the table. */
  unit?: string;
  /** The height of the plot and its axes, in px. */
  height?: number;
  /** About how many gridlines; they round to readable numbers. */
  yTickCount?: number;
  /** Pin the top of the axis. By default it is the next tick above the largest value. */
  yMax?: number;
  valueLabels?: 'inside' | 'above' | 'none';
  grid?: 'solid' | 'dashed';
  /** Under the chart, always: every VCP chart has its legend at the bottom. `none` leaves it out (a card that draws its own). */
  legend?: 'bottom' | 'none';
  /** The widest a bar gets (px). */
  maxBarWidth?: number;
  loading?: boolean;
  /** What it says when there is nothing to draw. */
  empty?: React.ReactNode;
}

const MARGIN = { top: 16, right: 8, bottom: 28 } as const;
const AXIS_LABEL_WIDTH = 32;
const Y_TITLE_WIDTH = 24;
const MIN_BAR = 4;
const GAP = 2;

const roundedTop = (x: number, y: number, w: number, h: number, r: number) => {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h} V${y + rr} a${rr},${rr} 0 0 1 ${rr},${-rr} H${x + w - rr} a${rr},${rr} 0 0 1 ${rr},${rr} V${y + h} Z`;
};

const label = (series: ChartSeries, labels?: Partial<Record<ChartSeries, string>>) => labels?.[series] ?? CHART_SERIES[series].label;

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      className,
      data,
      series,
      seriesLabels,
      caption,
      yLabel,
      unit = 'pts',
      height = 320,
      yTickCount = 7,
      yMax,
      valueLabels = 'inside',
      grid = 'solid',
      legend = 'bottom',
      maxBarWidth = 32,
      loading,
      empty = 'Nothing to show for this period.',
      ...props
    },
    ref,
  ) => {
    const [plotRef, width] = useElementWidth<HTMLDivElement>();
    const [hover, setHover] = React.useState<number | null>(null);

    const largest = Math.max(0, ...data.flatMap((d) => series.map((s) => d.values[s] ?? 0)).filter(Number.isFinite));
    const ticks = niceTicks(yMax ?? largest, yTickCount, yMax !== undefined);
    const top = yMax ?? ticks[ticks.length - 1]!;
    const hasData = data.length > 0 && largest > 0;

    const left = (yLabel ? Y_TITLE_WIDTH : 0) + AXIS_LABEL_WIDTH + 8;
    const plotW = Math.max(0, width - left - MARGIN.right);
    const plotH = height - MARGIN.top - MARGIN.bottom;
    const y = (v: number) => MARGIN.top + plotH - (Math.max(0, v) / top) * plotH;
    const base = MARGIN.top + plotH;

    const groupW = data.length ? plotW / data.length : 0;
    const k = series.length || 1;
    const barW = Math.max(MIN_BAR, Math.min(maxBarWidth, Math.floor((groupW * 0.8 - (k - 1) * GAP) / k)));
    const innerW = k * barW + (k - 1) * GAP;

    /* Thin the category labels out when they would run into each other (12px type is about 6.6 across a character). */
    const longest = Math.max(0, ...data.map((d) => d.label.length));
    const labelStep = groupW > 0 ? Math.max(1, Math.ceil((longest * 6.6 + 8) / groupW)) : 1;

    const legendEl = legend !== 'none' && series.length > 0 && (
      <ul aria-label="Legend" className="m-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-1 p-0">
        {series.map((s) => (
          <li key={s}>
            <LegendItem label={label(s, seriesLabels)} swatchClassName={CHART_SERIES[s].fill} />
          </li>
        ))}
      </ul>
    );

    const hovered = hover !== null ? data[hover] : undefined;
    const tipLeft = hover !== null ? left + hover * groupW + groupW / 2 : 0;

    return (
      <div ref={ref} className={cn('flex min-w-0 flex-col gap-4 font-sans', className)} aria-busy={loading || undefined} {...props}>
        <div ref={plotRef} className="relative min-w-0" style={{ height }}>
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
                  {/* Gridlines and the value axis. */}
                  {ticks.map((t) => (
                    <g key={t}>
                      <line
                        x1={left}
                        x2={left + plotW}
                        y1={y(t)}
                        y2={y(t)}
                        className="stroke-stroke-subtle"
                        strokeWidth={1}
                        strokeDasharray={grid === 'dashed' ? '4 4' : undefined}
                      />
                      <text x={left - 8} y={y(t)} textAnchor="end" dominantBaseline="central" className="fill-text-secondary text-caption-md-regular">
                        {t}
                      </text>
                    </g>
                  ))}
                  {yLabel && (
                    <text
                      transform={`translate(${Y_TITLE_WIDTH / 2 - 4} ${MARGIN.top + plotH / 2}) rotate(-90)`}
                      textAnchor="middle"
                      className="fill-text-secondary text-caption-md-semibold"
                    >
                      {yLabel}
                    </text>
                  )}

                  {data.map((d, i) => {
                    const gx = left + i * groupW;
                    const x0 = gx + (groupW - innerW) / 2;
                    return (
                      <g key={d.key}>
                        {hover === i && <rect x={gx} y={MARGIN.top} width={groupW} height={plotH} className="fill-surface-neutral-faint" />}
                        {series.map((s, j) => {
                          const v = d.values[s];
                          if (v === undefined || !Number.isFinite(v) || v <= 0) return null;
                          const bx = x0 + j * (barW + GAP);
                          const by = y(v);
                          const bh = base - by;
                          const style = CHART_SERIES[s];
                          return (
                            <g key={s}>
                              <path d={roundedTop(bx, by, barW, bh, 4)} className={style.svgFill} />
                              {valueLabels === 'inside' && bh >= 22 && barW >= 24 && (
                                <text x={bx + barW / 2} y={by + 14} textAnchor="middle" dominantBaseline="central" className={cn(style.svgContent, 'text-caption-md-semibold')}>
                                  {v}
                                </text>
                              )}
                              {valueLabels === 'above' && barW + GAP >= 22 && (
                                <text x={bx + barW / 2} y={by - 6} textAnchor="middle" className="fill-text-primary text-caption-md-regular">
                                  {v}
                                </text>
                              )}
                            </g>
                          );
                        })}
                        {i % labelStep === 0 && (
                          <text x={gx + groupW / 2} y={base + 18} textAnchor="middle" className="fill-text-secondary text-caption-md-regular">
                            {d.label}
                          </text>
                        )}
                        {/* The pointer target for the whole group, so a hairline bar is as easy to read as a wide one. */}
                        <rect
                          x={gx}
                          y={MARGIN.top}
                          width={groupW}
                          height={plotH + MARGIN.bottom}
                          fill="transparent"
                          onPointerEnter={() => setHover(i)}
                          onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                        />
                      </g>
                    );
                  })}
                </svg>

                {hovered && (
                  <div
                    role="presentation"
                    className="pointer-events-none absolute z-10 w-max max-w-60 -translate-x-1/2 rounded-md border border-stroke-subtle bg-surface-elevated px-3 py-2 shadow-md"
                    style={{
                      left: Math.min(Math.max(tipLeft, 80), Math.max(80, width - 80)),
                      top: 0,
                    }}
                  >
                    <p className="m-0 text-caption-md-semibold text-text-primary">{hovered.label}</p>
                    <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
                      {series.map((s) => (
                        <li key={s} className="flex items-center justify-between gap-3 text-caption-md-medium text-text-secondary">
                          <LegendItem size="sm" label={label(s, seriesLabels)} swatchClassName={CHART_SERIES[s].fill} />
                          <span className="text-text-primary">
                            {hovered.values[s] ?? 0} {unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
          )}

          {/* The same numbers, as a table, for assistive tech. */}
          {!loading && hasData && (
            <div className="sr-only">
              <table>
                <caption>{caption}</caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
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
                      <th scope="row">{d.label}</th>
                      {series.map((s) => (
                        <td key={s}>{d.values[s] === undefined ? 'no data' : `${d.values[s]} ${unit}`}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {legend === 'bottom' && legendEl}
      </div>
    );
  },
);
BarChart.displayName = 'BarChart';
