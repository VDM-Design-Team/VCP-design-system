import * as React from 'react';
import { cn } from '../../lib/cn';
import { CHART_SERIES, seriesIn } from '../../lib/chart-series';
import { Icon } from '../../atoms/icon';
import { LegendItem } from '../../atoms/legend-item';
import { Skeleton } from '../../atoms/skeleton';
import { Tooltip } from '../../atoms/tooltip';
import { CapacityBar, capacityTotal, type CapacitySegment } from '../../components/capacity-bar';

/**
 * TeamCapacity — how a team's capacity for a cycle is spent, as one stacked bar: a title (with an optional "what is this"
 * hint), a line saying what is left, the bar with its total beside it, and a legend. Built to Figma's `Team_Capacity`
 * (`4213:31447`).
 *
 * - **It is data, not a picture.** Pass `segments` and the bar, the total ("180 pts") and the legend all follow. The total is
 *   the sum of the segments, so the three can never disagree; the legend lists the series the data has, in the system's
 *   order (`CHART_SERIES_ORDER`), and the colours come from the one place that owns them (`src/lib/chart-series.ts`).
 * - **It fills its card, and the card is the caller's.** The bar takes the width it is given; the legend wraps; the title
 *   truncates before it pushes the total out. A container query, so it is right in a sidebar as well as full width.
 * - **While the data loads**, pass `loading`: the bar and the legend become placeholders, and one status says so.
 * - It does no arithmetic of its own beyond the sum: what "remaining" is (capacity less committed, say) is the product's, so
 *   `remaining` is passed in.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface TeamCapacityProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  segments: readonly CapacitySegment[];
  /** The card's heading. */
  title?: string;
  /** Explains the card, behind an info glyph after the title. Omit it and there is no glyph. */
  hint?: string;
  /** Points of capacity left, for the line under the title ("40 points of capacity remaining this cycle."). Leave it out and there is no line. */
  remaining?: number;
  /** Replaces the line under the title (a sentence of your own). Wins over `remaining`. */
  description?: React.ReactNode;
  /** The unit after the total. */
  unit?: string;
  /** The data is on its way. */
  loading?: boolean;
}

export const TeamCapacity = React.forwardRef<HTMLElement, TeamCapacityProps>(
  ({ className, segments, title = 'Team Capacity', hint, remaining, description, unit = 'pts', loading, ...props }, ref) => {
    const headingId = React.useId();
    const total = capacityTotal(segments);
    const line =
      description ?? (remaining !== undefined ? `${remaining} ${remaining === 1 ? 'point' : 'points'} of capacity remaining this cycle.` : undefined);
    const legend = seriesIn(segments);

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        aria-busy={loading || undefined}
        className={cn('@container flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        <header className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <h2 id={headingId} className="m-0 min-w-0 truncate text-title-sm-semibold text-text-primary">
              {title}
            </h2>
            {hint && (
              <Tooltip content={hint}>
                <button
                  type="button"
                  aria-label={`About ${title}`}
                  className="grid size-5 shrink-0 place-items-center rounded-sm text-text-tertiary hover:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused"
                >
                  <Icon name="info" size="md" />
                </button>
              </Tooltip>
            )}
          </div>
          {line && <p className="m-0 text-body-sm-regular text-text-primary">{line}</p>}
        </header>

        {loading ? (
          <>
            <span role="status" className="sr-only">
              Loading {title}
            </span>
            <div className="flex items-center gap-2">
              <Skeleton height={28} className="min-w-0 flex-1" />
              <Skeleton width={48} textStyle="body-sm" />
            </div>
            <div className="flex justify-center gap-4">
              <Skeleton width={72} textStyle="caption-md" />
              <Skeleton width={72} textStyle="caption-md" />
              <Skeleton width={72} textStyle="caption-md" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <CapacityBar segments={segments} label={title} unit={unit} />
              <span className="shrink-0 text-label-sm-semibold text-text-primary">
                {total} {unit}
              </span>
            </div>
            {legend.length > 0 && (
              <ul aria-label="Legend" className="m-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-1 p-0">
                {legend.map((series) => (
                  <li key={series}>
                    <LegendItem label={CHART_SERIES[series].label} swatchClassName={CHART_SERIES[series].fill} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    );
  },
);
TeamCapacity.displayName = 'TeamCapacity';
