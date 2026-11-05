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
 * **It wraps first, then scrolls.** With room, everything is on one row. When the breakdown no longer fits beside the
 * profile it drops to its own line, full width. Each segment keeps its 100 floor, so once the breakdown alone is as narrow
 * as it can be and cannot wrap any further, the whole strip scrolls sideways.
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
  /* Figma's slate-500 in light, a quiet mid grey in dark: `stroke.strong` is slate-500 / slate-400. It is a *border* token worn as a fill, a deliberate exception: the fill token that matches in light,
     `surface.neutral.strong`, is slate-300 in dark, so Draft (usually the widest segment) would turn nearly white and outweigh Active and Accepted; `neutral.outline.border` is slate-400 in light, lighter than Figma. */
  neutral: 'bg-stroke-strong',
  yellow: 'bg-accent-yellow-medium',
  blue: 'bg-accent-blue-medium',
  brand: 'bg-surface-brand-strong',
  critical: 'bg-accent-critical-outline-border-default',
};
const OUTLINE: Record<StatsSegmentTone, string> = {
  neutral: 'border-stroke-strong',
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
  ) => {
    /* A region that scrolls sideways has to be reachable by keyboard — but only while it actually overflows, so a strip
       that fits adds no tab stop. */
    const own = React.useRef<HTMLElement | null>(null);
    const [overflowing, setOverflowing] = React.useState(false);
    React.useLayoutEffect(() => {
      const el = own.current;
      if (!el) return;
      const measure = () => setOverflowing(el.scrollWidth > el.clientWidth);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, [segments]);
    const setRef = (node: HTMLElement | null) => {
      own.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    /* Nothing yet: every count is 0, so every segment would sit at its 100 floor and bunch up on the left. Equal shares let the outlines span the strip. */
    const nothingYet = segments.every((segment) => segment.count <= 0);

    return (
      <section
        ref={setRef}
        aria-label={ariaLabel}
        tabIndex={overflowing ? 0 : undefined}
        className={cn(
          'flex flex-wrap items-center gap-x-6 gap-y-4 overflow-x-auto rounded-md border border-stroke-subtle bg-surface-elevated p-4 font-sans',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          className,
        )}
        {...props}
      >
        <div className="flex shrink-0 items-center gap-6">
          {/* The name is right there, so the avatar is decoration. */}
          <div className="flex flex-col items-center gap-2">
            <Avatar size="lg" name={user.name} src={user.src} />
            <span className="text-body-sm-regular text-text-primary">{user.name}</span>
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

        <ul aria-label="Status breakdown" className="m-0 flex flex-1 list-none gap-1 p-0">
          {segments.map((segment) => {
            const filled = segment.count > 0;
            return (
              <li
                key={segment.id}
                /* As wide as its count, never narrower than 100 (all equal while every count is 0). The width is data, so it is the one inline style. */
                style={{ flexGrow: nothingYet ? 1 : Math.max(segment.count, 0) }}
                className="flex min-w-25 basis-0 flex-col gap-2"
              >
                <span
                  aria-hidden="true"
                  className={cn('block h-2 rounded-pill', filled ? FILL[segment.tone] : cn('border', OUTLINE[segment.tone]))}
                />
                {/* A light 2 line down the left, 8 from the words, as Figma's status item draws it. */}
                <div className="flex flex-col border-l-2 border-stroke-subtle pl-2">
                  <span className="text-body-lg-medium text-text-primary">{segment.count}</span>
                  <span className="text-body-sm-medium text-text-tertiary">{segment.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);
MyValuesStats.displayName = 'MyValuesStats';
