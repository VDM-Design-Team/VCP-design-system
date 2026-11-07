import * as React from 'react';
import { cn } from '../../lib/cn';
import { CHART_SERIES, type ChartSeries } from '../../lib/chart-series';

/**
 * CapacityBar — one stacked bar of how a capacity is spent: Completed, Committed, Overdue, Available, Leave. Built to the
 * bars of Figma's `Team_Capacity` and `User_Capacity`.
 *
 * - **It is data, not a picture.** Give it `segments` (a series and a value each) and it sizes them by value, so a bar of
 *   60 / 30 / 30 / 60 and one of 6 / 3 / 3 / 6 draw the same. It fills the width it is given, so it is as responsive as
 *   its parent; it has no fixed width.
 * - **Each segment's number is written on it** in the series' own content colour (`CHART_SERIES`), unless the segment is so
 *   thin (under 5% of the bar) that the number would not fit; it is still in the bar's text alternative.
 * - **A series is a colour from one place** (`src/lib/chart-series.ts`), so the legend beside it, and every other chart,
 *   reads the same.
 * - A segment of 0 (or less, or not a number) is not drawn. A bar with nothing in it is just its empty track.
 *
 * It is a single image to assistive tech: `role="img"` named by its own series and values ("Completed 60, Committed 30,
 * total 180 pts"), not twenty loose numbers. A tooltip per segment is left out on purpose: it would be a hover-only reading
 * of what is already text, and a row of 5 pointer-only targets on every user.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CapacitySegment {
  series: ChartSeries;
  value: number;
}

export interface CapacityBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  segments: readonly CapacitySegment[];
  /** What the bar is a bar of, for the text alternative: "Team capacity", "John". Optional. */
  label?: string;
  /** The unit in the text alternative. */
  unit?: string;
  /** `md` (28) is the team bar; `sm` (24) is a row in a list of people. */
  size?: 'sm' | 'md';
}

const HEIGHT = { sm: 'h-6', md: 'h-7' } as const;

/** The sum of the drawn segments: what the bar is a bar *of*. */
export const capacityTotal = (segments: readonly CapacitySegment[]): number =>
  segments.reduce((sum, s) => (Number.isFinite(s.value) && s.value > 0 ? sum + s.value : sum), 0);

/** The text alternative: "John: Completed 15, Committed 15, total 30 pts". */
export const capacityDescription = (segments: readonly CapacitySegment[], unit = 'pts', label?: string): string => {
  const drawn = segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
  const parts = drawn.map((s) => `${CHART_SERIES[s.series].label} ${s.value}`);
  const text = drawn.length ? `${parts.join(', ')}, total ${capacityTotal(segments)} ${unit}` : `none, total 0 ${unit}`;
  return label ? `${label}: ${text}` : text;
};

const MIN_SHARE_FOR_NUMBER = 0.05;

export const CapacityBar = React.forwardRef<HTMLDivElement, CapacityBarProps>(
  ({ className, segments, label, unit = 'pts', size = 'md', ...props }, ref) => {
    const total = capacityTotal(segments);
    const drawn = segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
    return (
      <div
        ref={ref}
        role="img"
        aria-label={capacityDescription(segments, unit, label)}
        className={cn('flex min-w-0 flex-1 gap-px overflow-hidden rounded-xs bg-surface-track font-sans', HEIGHT[size], className)}
        {...props}
      >
        {drawn.map((s, i) => {
          const style = CHART_SERIES[s.series];
          return (
            <div
              key={`${s.series}-${i}`}
              aria-hidden="true"
              style={{ flexGrow: s.value }}
              className={cn('flex min-w-0 basis-0 items-center justify-center overflow-hidden', style.fill, style.content)}
            >
              {s.value / total >= MIN_SHARE_FOR_NUMBER && <span className="text-label-sm-semibold">{s.value}</span>}
            </div>
          );
        })}
      </div>
    );
  },
);
CapacityBar.displayName = 'CapacityBar';
