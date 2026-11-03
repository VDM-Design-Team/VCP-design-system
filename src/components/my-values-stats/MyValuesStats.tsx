import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Divider } from '../../atoms/divider';

/**
 * MyValuesStats — the strip across the top of the My Values page: who you are, how many Added Values are yours and how
 * many are completed, and a breakdown of the rest by status as one segmented bar. Built to Figma's `My_AVs_Stats` (the
 * `My Values Page` of `VCP Pages & Flows`).
 *
 * - **Who.** The person's avatar over their name, then a divider.
 * - **The two headline figures.** Total AVs, and Completed with its green dot.
 * - **The breakdown.** One segment per status, **as wide as its count** (never narrower than 100, so a status with nothing
 *   in it is still a visible, labelled stop), a count under it and the status's name under that. A segment with a count
 *   is filled in its tone; one with none is drawn as an **empty outline** in the same tone.
 *
 * **It owns one mapping: a segment's tone → its colour.** Which statuses there are, what they are called and which tone
 * each wears are the page's — the breakdown is not the `AVStatus` vocabulary (Figma's has *Active* and *Overdue*, which are
 * groupings and a derived state, not statuses), so the segments come in as data. It does no arithmetic: the totals are the
 * caller's (Total is not the sum of the segments — it includes what is completed).
 *
 * **It reflows with the card, not the screen.** Everything on one row when there is room; the breakdown drops to its own
 * line, full width, when there is not.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/** The tones a segment can wear. */
export type StatsSegmentTone = 'neutral' | 'yellow' | 'blue' | 'brand' | 'critical';

export interface MyValuesStatsSegment {
  id: string | number;
  /** The status's name, as it should read: "Draft", "Accepted". */
  label: string;
  /** How many. A segment is as wide as this; 0 draws an empty outline. */
  count: number;
  tone: StatsSegmentTone;
}

export interface MyValuesStatsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Whose values these are. */
  user: { name: string; src?: string };
  /** Every AV that is theirs. */
  total: number;
  completed: number;
  /** The status breakdown, in the order it should read. */
  segments: readonly MyValuesStatsSegment[];
  totalLabel?: string;
  completedLabel?: string;
}

/* The one place a tone becomes a colour: filled for a segment with a count, an outline for one with none. */
const FILL: Record<StatsSegmentTone, string> = {
  neutral: 'bg-neutral-outline-border-default',
  yellow: 'bg-accent-yellow-medium',
  blue: 'bg-accent-blue-medium',
  brand: 'bg-surface-brand-strong',
  critical: 'bg-accent-critical-outline-border-default',
};
const OUTLINE: Record<StatsSegmentTone, string> = {
  neutral: 'border-neutral-outline-border-default',
  yellow: 'border-accent-yellow-medium',
  blue: 'border-accent-blue-medium',
  brand: 'border-surface-brand-strong',
  critical: 'border-accent-critical-outline-border-default',
};

/* The one exception to the type ramp — the same one `StatCard` marks: 24 medium has no step (`heading-lg` ships bold,
   semibold and regular). */
const MEDIUM_24 = 'text-[24px] font-medium leading-9'; // ds-lint-ignore — no heading-lg-medium in the ramp

/* A figure over its label. */
function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-body-sm-medium text-text-tertiary">{label}</span>
      <span className={cn('flex items-center gap-1.5 text-text-primary', MEDIUM_24)}>{children}</span>
    </div>
  );
}

export const MyValuesStats = React.forwardRef<HTMLElement, MyValuesStatsProps>(
  (
    {
      className,
      user,
      total,
      completed,
      segments,
      totalLabel = 'Total AVs',
      completedLabel = 'Completed',
      'aria-label': ariaLabel = 'My Values statistics',
      ...props
    },
    ref,
  ) => (
    <section
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        '@container flex flex-wrap items-center gap-x-6 gap-y-4 rounded-md border border-stroke-subtle bg-surface-elevated p-4 font-sans',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-6">
        {/* The name is right there, so the avatar is decoration. */}
        <div className="flex flex-col items-center gap-2">
          <Avatar size="lg" name={user.name} src={user.src} />
          <span className="text-body-sm-medium text-text-primary">{user.name}</span>
        </div>
        <Divider orientation="vertical" className="self-stretch" />
        <div className="flex items-center gap-6">
          <Figure label={totalLabel}>{total}</Figure>
          <Figure label={completedLabel}>
            {completed}
            <span aria-hidden="true" className="size-3 rounded-pill bg-accent-success-outline-border-default" />
          </Figure>
        </div>
      </div>

      <ul aria-label="Status breakdown" className="m-0 flex min-w-96 flex-1 list-none gap-1 p-0">
        {segments.map((segment) => {
          const filled = segment.count > 0;
          return (
            <li
              key={segment.id}
              /* As wide as its count, never narrower than 100. The width is data, so it is the one inline style. */
              style={{ flexGrow: Math.max(segment.count, 0) }}
              className="flex min-w-25 basis-0 flex-col gap-2"
            >
              <span
                aria-hidden="true"
                className={cn('block h-2 rounded-pill', filled ? FILL[segment.tone] : cn('border', OUTLINE[segment.tone]))}
              />
              <div className="flex flex-col">
                <span className="text-body-lg-medium text-text-primary">{segment.count}</span>
                <span className="text-body-sm-medium text-text-tertiary">{segment.label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  ),
);
MyValuesStats.displayName = 'MyValuesStats';
