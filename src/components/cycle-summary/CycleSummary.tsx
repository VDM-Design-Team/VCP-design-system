import * as React from 'react';
import { cn } from '../../lib/cn';
import { DonutChart } from '../../atoms/donut-chart';

/**
 * CycleSummary — how a cycle went, in one card: the points committed, the points completed, the points carried over, and a
 * half-ring gauge of the completion rate. Built to Figma's `Cycle_Summary` (`7498:5354`), `_Cycle_Summary_Card_Base` and
 * `_Cycle_Summary_Half_Donut_Chart`.
 *
 * - **The three figures** each have a title, a coloured dot (blue committed, green completed, brown carried over) and a value.
 * - **The gauge** is `DonutChart` in its flat-ended, gapped half-ring form, 200 across with an 8 stroke. Its colour is the
 *   *completion band*, which this card owns, once (`completionBand`): 90% and above is green (100% included), 70–89% amber,
 *   below 70% red, and no rate yet a grey ring over "-%".
 * - **It reflows with the card, not the screen.** Four across when the card has room (a divider before each figure and the
 *   gauge), two by two when it narrows (dividers only before the second column), and stacked when it is narrower still, with
 *   no dividers. A container query, so the card does the right thing in a sidebar or a modal as well as full width.
 *
 * It does no arithmetic: the completion rate is the caller's, because what it is a rate *of* (points, Added Values, by
 * weight) is the product's to say.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type CompletionBand = 'complete' | 'high' | 'medium' | 'low' | 'none';

/**
 * Which band a completion rate falls in: 100 `complete`, 90–99 `high`, 70–89 `medium`, under 70 `low`, and `none` when
 * there is no rate. The thresholds live here and nowhere else. **The rate is rounded first**, as the gauge shows it: 89.5
 * reads "90%" and is `high` (green), 69.5 reads "70%" and is `medium` (amber) — the colour never disagrees with the number.
 */
export const completionBand = (rate: number | null | undefined): CompletionBand => {
  if (rate === null || rate === undefined || Number.isNaN(rate)) return 'none';
  const shown = Math.round(rate);
  if (shown >= 100) return 'complete';
  if (shown >= 90) return 'high';
  if (shown >= 70) return 'medium';
  return 'low';
};

const BAND: Record<CompletionBand, { tone: 'success' | 'warning' | 'critical' | 'brand'; text: string }> = {
  complete: { tone: 'success', text: 'text-accent-success-outline-content-default' },
  high: { tone: 'success', text: 'text-accent-success-outline-content-default' },
  medium: { tone: 'warning', text: 'text-accent-warning-outline-content-default' },
  low: { tone: 'critical', text: 'text-accent-critical-outline-content-default' },
  none: { tone: 'brand', text: 'text-text-tertiary' },
};

export interface CycleSummaryProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The card's heading. */
  title?: string;
  /** Points committed to the cycle. */
  committed: number;
  /** Points completed. */
  completed: number;
  /** Points carried over to the next cycle. */
  carriedOver: number;
  /** The completion rate, 0–100. Leave it out (or `null`) before there is one: the gauge shows an empty ring and "-%". */
  completion?: number | null;
  /** The word under the percentage. */
  completionLabel?: string;
}

/* One figure: a title with its dot, and the value. */
function Figure({
  label,
  dotClassName,
  value,
}: {
  label: string;
  dotClassName: string;
  value: number;
}) {
  return (
    <div className="flex flex-col justify-center px-6 py-4">
      <span className="flex items-center gap-1 text-label-sm-medium text-text-secondary">
        {label}
        <span aria-hidden="true" className={cn('size-3 shrink-0 rounded-pill', dotClassName)} />
      </span>
      <span className="text-heading-xl-bold text-text-primary">{value}</span>
    </div>
  );
}

export const CycleSummary = React.forwardRef<HTMLElement, CycleSummaryProps>(
  (
    {
      className,
      title = 'Cycle Summary',
      committed,
      completed,
      carriedOver,
      completion,
      completionLabel = 'Completion',
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();
    const band = completionBand(completion);
    const style = BAND[band];
    const has = band !== 'none';
    const rate = has ? Math.round(Math.max(0, Math.min(100, completion as number))) : 0;
    /* The divider before a column, per layout: 4 across (before every column but the first), 2 by 2 (before the
       second column), stacked (none). */
    const divide = 'border-stroke-default';

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('@container rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        <h2 id={headingId} className="m-0 mb-3 text-title-sm-semibold text-text-primary">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @4xl:grid-cols-4">
          <div className="h-25 min-w-50">
            <Figure label="Points Committed" dotClassName="bg-action-primary-surface-default" value={committed} />
          </div>
          <div className={cn('h-25 min-w-50 @md:border-l', divide)}>
            <Figure label="Points Completed" dotClassName="bg-accent-success-outline-border-default" value={completed} />
          </div>
          <div className={cn('h-25 min-w-50 @4xl:border-l', divide)}>
            <Figure label="Carried Over" dotClassName="bg-accent-warning-outline-content-default" value={carriedOver} />
          </div>
          <div className={cn('flex h-25 min-w-50 items-center justify-center px-6 @md:border-l', divide)}>
            <DonutChart
              half
              segmented
              size={200}
              thickness={8}
              value={rate}
              tone={style.tone}
              /* Named by its caption ("Completion") and valued by its own number, so a screen reader hears "Completion, 90" once. With no rate the 0 is not announced: it says so instead. */
              aria-valuetext={has ? undefined : 'No rate yet'}
              label={
                <span className={style.text}>{has ? `${rate}%` : '-%'}</span>
              }
              caption={completionLabel}
            />
          </div>
        </div>
      </section>
    );
  },
);
CycleSummary.displayName = 'CycleSummary';
