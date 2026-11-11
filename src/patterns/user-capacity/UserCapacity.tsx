import * as React from 'react';
import { cn } from '../../lib/cn';
import { CHART_SERIES, seriesIn } from '../../lib/chart-series';
import { LegendItem } from '../../atoms/legend-item';
import { Skeleton } from '../../atoms/skeleton';
import { CardHeader } from '../../components/card-header';
import { CapacityBar, capacityTotal, type CapacitySegment } from '../../components/capacity-bar';
import { TruncatedText } from '../../components/truncated-text';

/**
 * UserCapacity — how each person's capacity for a cycle is spent: a title (with an optional hint), then one row per
 * person — their name, a stacked bar, their total — and one legend for the lot. Built to Figma's `User_Capacity`
 * (`4217:32697`) and `_User_Capacity_Member_Row`.
 *
 * - **It is data, not a picture.** Pass `members` (an `id`, a `name` and their `segments`); each row's bar is a
 *   `CapacityBar` and its total the sum of its segments. The legend is the series across *all* the rows (so "Leave" shows
 *   only when somebody has some), in the system's order. Colours come from `src/lib/chart-series.ts`, shared with
 *   `TeamCapacity` and every other chart.
 * - **Bars are scaled to each other, not to themselves, when you say so.** By default every row fills its track, so two
 *   people with 30 and 15 points both read as full. Pass `scale="shared"` to draw each bar as its share of the largest
 *   total, so a part-timer's row is visibly shorter.
 * - **It is responsive to its card.** With room, the name (124 wide, truncating with a tooltip when cut), the bar and the
 *   total sit on one row; when the card narrows the name takes a line of its own over the bar and its total.
 * - **Many people** just make a longer list: nothing here scrolls or paginates, so cap or page `members` in the caller if
 *   the team is large.
 * - **While the data loads**, pass `loading`; with no members, `empty` says so.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface UserCapacityMember {
  id: string | number;
  name: string;
  segments: readonly CapacitySegment[];
}

export interface UserCapacityProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  members: readonly UserCapacityMember[];
  title?: string;
  /** Explains the card, behind an info glyph after the title. Omit it and there is no glyph. */
  hint?: string;
  unit?: string;
  /** `row` (default): each bar fills its track. `shared`: each bar is its share of the largest total. */
  scale?: 'row' | 'shared';
  /** What the card says with no members. */
  empty?: React.ReactNode;
  /** The data is on its way. */
  loading?: boolean;
}

export const UserCapacity = React.forwardRef<HTMLElement, UserCapacityProps>(
  (
    { className, members, title = 'User Capacity', hint, unit = 'pts', scale = 'row', empty = 'No one has capacity in this cycle.', loading, ...props },
    ref,
  ) => {
    const headingId = React.useId();
    const legend = seriesIn(...members.map((m) => m.segments));
    const largest = Math.max(0, ...members.map((m) => capacityTotal(m.segments)));

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        aria-busy={loading || undefined}
        className={cn('@container flex flex-col gap-4 rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        <CardHeader title={title} headingId={headingId} hint={hint} />

        {loading ? (
          <>
            <span role="status" className="sr-only">
              Loading {title}
            </span>
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton width={124} textStyle="label-sm" />
                  <Skeleton height={24} className="min-w-0 flex-1" />
                  <Skeleton width={50} textStyle="label-sm" />
                </div>
              ))}
            </div>
          </>
        ) : members.length === 0 ? (
          <p className="m-0 text-body-sm-regular text-text-secondary">{empty}</p>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {members.map((member) => {
                const total = capacityTotal(member.segments);
                return (
                  <li key={member.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 @md:flex-nowrap">
                    <span className="w-full shrink-0 @md:w-31">
                      <TruncatedText className="text-label-sm-medium text-text-primary">{member.name}</TruncatedText>
                    </span>
                    {/* The row's bar, and (when shared) the part of the track it leaves empty. */}
                    <div className="flex min-w-0 flex-1 items-center">
                      <CapacityBar
                        segments={member.segments}
                        size="sm"
                        unit={unit}
                        style={scale === 'shared' && largest > 0 ? { flexGrow: 0, flexBasis: `${(total / largest) * 100}%` } : undefined}
                      />
                    </div>
                    <span className="w-12.5 shrink-0 text-right text-label-sm-semibold text-text-primary">
                      {total} {unit}
                    </span>
                  </li>
                );
              })}
            </ul>
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
UserCapacity.displayName = 'UserCapacity';
