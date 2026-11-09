import * as React from 'react';
import { cn } from '../../lib/cn';
import { Badge } from '../../atoms/badge';
import { Button } from '../../atoms/button';
import { CardHeader } from '../card-header';
import { Divider } from '../../atoms/divider';
import { ProgressBar, type ProgressBarProps } from '../../atoms/progress-bar';
import { Select } from '../../atoms/select';
import { InfoHint } from '../info-hint';

/**
 * DomainBudgetSummary — the admin dashboard's view of one domain's development-point budget for one quarter: what was
 * allocated, what is consumed, what remains, which quarter this is, and a bar of how much of the budget is used. Built to
 * Figma's `Domain_Budget_Admin_View` (the `Domain Budget Dashboard View` page of `VCP Pages & Flows`).
 *
 * - **Points.** Allocated, Consumed and Remaining, each with an info tooltip. Remaining is `allocated − consumed`, green
 *   until it goes negative, then red: the tooltip's own definition, so the card derives it rather than trusting a third number.
 * - **The quarter.** A tag naming it (Current, Past or Upcoming) and its dates. A current quarter shows when it ends and
 *   how many days are left; a past quarter shows when it started and ended, an upcoming one when it starts and ends. Viewing a quarter that is not
 *   the current one adds a "Go to Current Quarter" button beside the pickers.
 * - **The bar.** Usage is `consumed ÷ allocated`, capped at 100%. **This card owns the status once** (`budgetStatus`):
 *   under 75% is fine (brand blue), 75–99% is a warning, 100% and over is over budget. The caller never maps a number to a tone.
 * - **It reflows with the card, not the screen.** Side by side when the card has room (Figma's 55 / 45 split); stacked
 *   with the quarter details beneath the points when it does not (Figma's narrow view).
 *
 * It is controlled: the quarter and year come in as props and `onQuarterChange` / `onYearChange` report a pick. Which
 * quarter is "current", its dates and its days left are the caller's — a date calculation is not this card's to make.
 *
 * Differences from Figma, on purpose: the bar is the `ProgressBar` atom's 8 high (Figma draws 12), and its label row takes the atom's caption type; the warning fill is the
 * atom's accessible `accent.warning.filled` token rather than Figma's bright yellow; the figures sit on the type ramp
 * (`heading-xl-bold`, Figma's 28 has no step), as `StatCard`'s do.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

export type BudgetStatus = 'fine' | 'warning' | 'over';

/** A calendar quarter, 1–4. */
export type Quarter = 1 | 2 | 3 | 4;

/** The share of the budget used, 0–100, capped. No allocation means nothing to measure against: 0, or 100 if anything was consumed. */
export const budgetUsage = (consumed: number, allocated: number): number => {
  if (allocated <= 0) return consumed > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, (consumed / allocated) * 100));
};

/**
 * The share used as it really is, **not capped**: 170 of 120 is 142. The bar stops at full (`budgetUsage`), but the number beside it does not say 100 when it is over. `null` when there is no allocation to measure
 * against (a percentage of nothing).
 */
export const budgetUsagePercent = (consumed: number, allocated: number): number | null => (allocated <= 0 ? null : Math.max(0, Math.round((consumed / allocated) * 100)));

/** Which status the budget is in: under 75% used is `fine`, 75–99% `warning`, 100% and over `over`. */
export const budgetStatus = (consumed: number, allocated: number): BudgetStatus => {
  const usage = budgetUsage(consumed, allocated);
  if (usage >= 100) return 'over';
  if (usage >= 75) return 'warning';
  return 'fine';
};

/** The quarter being viewed, and what to say about its dates. Dates are strings the caller has already formatted ("Mar 31"). */
export type DomainBudgetPeriod =
  | { kind: 'current'; endsOn: string; daysLeft: number; daysTotal: number }
  | { kind: 'past'; startedOn: string; endedOn: string }
  | { kind: 'upcoming'; startsOn: string; endsOn: string };

export interface DomainBudgetSummaryProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** Points assigned to the domain for the quarter. */
  allocated: number;
  /** Points used by planned Added Values. */
  consumed: number;
  /** The quarter shown, 1–4. */
  quarter: Quarter;
  year: number;
  /** The years the year picker offers. */
  years: readonly number[];
  period: DomainBudgetPeriod;
  onQuarterChange?: (quarter: Quarter) => void;
  onYearChange?: (year: number) => void;
  /** Called by "Go to Current Quarter", which only shows while a past or upcoming quarter is being viewed. */
  onGoToCurrent?: () => void;
  /** The card's heading. */
  title?: string;
}

const HINTS = {
  allocated: 'Total development points assigned for the cycle. Unused points do not roll over.',
  consumed: 'Development points used by planned AVs, calculated automatically from their points and active dates.',
  remaining: 'Remaining = Allocated - Consumed points for the cycle. Negative values indicate overspend.',
} as const;

const TONE = { fine: 'brand', warning: 'warning', over: 'critical' } as const satisfies Record<
  BudgetStatus,
  NonNullable<ProgressBarProps['tone']>
>;

const QUARTERS: readonly Quarter[] = [1, 2, 3, 4];
const QUARTER_OPTIONS = QUARTERS.map((q) => ({ value: String(q), label: `Q${q}` }));

/* The one exception to the type ramp — the same one `StatCard` marks: 24 medium has no step (`heading-lg` ships
   bold, semibold and regular only). It is the unit beside a figure and the quarter details' values. */
const MEDIUM_24 = 'text-[24px] font-medium leading-9'; // ds-lint-ignore — no heading-lg-medium in the ramp

const TAG_LABEL: Record<DomainBudgetPeriod['kind'], string> = {
  current: 'Current Quarter',
  past: 'Past Quarter',
  upcoming: 'Upcoming Quarter',
};

/* A label over a value, in the quarter details. */
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-body-sm-medium text-text-tertiary">{label}</span>
      <span className={cn('flex items-baseline gap-1 whitespace-nowrap text-text-secondary', MEDIUM_24)}>{children}</span>
    </div>
  );
}

/* One of the three point figures: a label with its info tooltip, then the number and "pts". */
function Points({
  label,
  hint,
  value,
  toneClassName = 'text-text-primary',
}: {
  label: string;
  hint: string;
  value: number;
  toneClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-body-sm-medium text-text-secondary">{label}</span>
        <InfoHint label={label} content={hint} />
      </div>
      <div className={cn('flex items-baseline gap-1.5 whitespace-nowrap', toneClassName)}>
        <span className="text-heading-xl-bold">{value}</span>
        <span className={MEDIUM_24}>pts</span>
      </div>
    </div>
  );
}

export const DomainBudgetSummary = React.forwardRef<HTMLElement, DomainBudgetSummaryProps>(
  (
    {
      className,
      allocated,
      consumed,
      quarter,
      year,
      years,
      period,
      onQuarterChange,
      onYearChange,
      onGoToCurrent,
      title = 'Domain Budget',
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();
    const quarterRef = React.useRef<HTMLSelectElement>(null);
    const remaining = allocated - consumed;
    const status = budgetStatus(consumed, allocated);
    const percent = budgetUsagePercent(consumed, allocated);

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('@container overflow-x-auto rounded-md bg-surface-elevated p-6 font-sans', className)}
        {...props}
      >
        {/* Never squeezed below what its figures need: narrower than this, the whole card scrolls sideways. */}
        <div className="min-w-lg">
          <CardHeader
            className="mb-3"
            title={title}
            headingId={headingId}
            actions={
              <>
                {period.kind !== 'current' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onGoToCurrent?.();
                      /* The button goes away once the current quarter shows, taking focus with it: hand it to the quarter picker. */
                      quarterRef.current?.focus();
                    }}
                  >
                    Go to Current Quarter
                  </Button>
                )}
                <Select
                  size="sm"
                  ref={quarterRef}
                  aria-label="Quarter"
                  value={String(quarter)}
                  options={QUARTER_OPTIONS}
                  onChange={(v) => {
                    const picked = QUARTERS.find((q) => String(q) === v);
                    if (picked) onQuarterChange?.(picked);
                  }}
                />
                <Select
                  size="sm"
                  aria-label="Year"
                  value={String(year)}
                  options={years.map(String)}
                  onChange={(v) => {
                    const picked = years.find((y) => String(y) === v);
                    if (picked !== undefined) onYearChange?.(picked);
                  }}
                />
              </>
            }
          />

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-3 @5xl:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
              <div className="flex min-w-0 items-center gap-9 rounded-md border border-stroke-default px-6 py-3 @5xl:min-w-116">
                <Points label="Allocated" hint={HINTS.allocated} value={allocated} />
                <Divider orientation="vertical" className="self-stretch" />
                <Points label="Consumed" hint={HINTS.consumed} value={consumed} />
                <Divider orientation="vertical" className="self-stretch" />
                <Points
                  label="Remaining"
                  hint={HINTS.remaining}
                  value={remaining}
                  toneClassName={
                    remaining < 0 ? 'text-accent-critical-outline-content-default' : 'text-accent-success-outline-content-default'
                  }
                />
              </div>

              <div className="flex min-w-0 items-center gap-9 px-4 py-3 @5xl:min-w-112">
                <div className="flex min-w-fit flex-1 flex-col gap-2">
                  <Badge size="md" className="self-start">
                    {TAG_LABEL[period.kind]}
                  </Badge>
                  <span className={cn('whitespace-nowrap text-text-secondary', MEDIUM_24)}>
                    Q{quarter} {year}
                  </span>
                </div>
                <Divider orientation="vertical" className="self-stretch" />
                {period.kind === 'current' && (
                  <>
                    <Detail label="Ends on">{period.endsOn}</Detail>
                    <Divider orientation="vertical" className="self-stretch" />
                    <Detail label="Days left">
                      <span>{period.daysLeft}</span>
                      <span aria-hidden="true">/{period.daysTotal}</span>
                      <span className="sr-only">of {period.daysTotal}</span>
                    </Detail>
                  </>
                )}
                {period.kind === 'past' && (
                  <>
                    <Detail label="Started On">{period.startedOn}</Detail>
                    <Divider orientation="vertical" className="self-stretch" />
                    <Detail label="Ended On">{period.endedOn}</Detail>
                  </>
                )}
                {period.kind === 'upcoming' && (
                  <>
                    <Detail label="Starts On">{period.startsOn}</Detail>
                    <Divider orientation="vertical" className="self-stretch" />
                    <Detail label="Ends On">{period.endsOn}</Detail>
                  </>
                )}
              </div>
            </div>

            <ProgressBar
              label="Budget Usage"
              showValue={percent === null}
              /* The bar stops at full; the number is the real one (142%, not 100%), and so is what a screen reader hears. */
              valueLabel={percent === null ? undefined : `${percent}%`}
              labelPlacement="below"
              tone={TONE[status]}
              value={budgetUsage(consumed, allocated)}
            />
          </div>
        </div>
      </section>
    );
  },
);
DomainBudgetSummary.displayName = 'DomainBudgetSummary';
