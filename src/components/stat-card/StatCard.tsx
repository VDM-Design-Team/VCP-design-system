import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * StatCard — one number that matters, on a card: open claims, points
 * consumed, suppliers active. Label, the value in the numeric face, optional
 * unit, delta and footer. Dashboards tile these.
 *
 * `deltaTone` is **judgment, not direction** — the export's `up`/`down`
 * painted up green, but "costs +12%" going up is bad news. The caller says
 * `positive`/`negative`/`neutral` and the colour follows the meaning; the
 * sign in the delta text carries the direction. (The export's green was a
 * raw literal with no token behind it, too.)
 *
 * The label is a `<span>`, not a heading — a wall of stat tiles with eight
 * `<h3>`s turns the outline into noise; the surrounding dashboard section
 * owns the heading. Not built on `Card` for the same reason: Card renders a
 * real heading, which is exactly what this must not do.
 *
 * The value is set in `font.family.numeric` at `heading-lg` — the ramp has no
 * display-size numeric step, and 24/semibold in Inter is the nearest honest
 * fit for the export's 28/600.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What the number is — "Open claims". */
  label: React.ReactNode;
  value: React.ReactNode;
  /** Small unit beside the value — "pts", "of 40". */
  unit?: React.ReactNode;
  /** The change — "+12%". Keep the sign in the text; colour is not direction. */
  delta?: React.ReactNode;
  /** Whether the change is good, bad, or neither — the caller's judgment. */
  deltaTone?: 'positive' | 'negative' | 'neutral';
  /** Decorative glyph in the corner — an `<Icon />`. */
  icon?: React.ReactNode;
  /** Context line — "vs last cycle". */
  footer?: React.ReactNode;
}

const DELTA: Record<NonNullable<StatCardProps['deltaTone']>, string> = {
  positive: 'text-accent-success-tonal-content-default',
  negative: 'text-accent-critical-tonal-content-default',
  neutral: 'text-text-tertiary',
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, unit, delta, deltaTone = 'neutral', icon, footer, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 rounded-md border border-stroke-subtle bg-surface-elevated p-4 font-sans shadow-card',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm text-text-tertiary">{label}</span>
        {icon && (
          <span aria-hidden="true" className="grid shrink-0 place-items-center text-text-subtle">
            {icon}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="font-numeric text-heading-lg text-text-primary">{value}</span>
        {unit && <span className="text-body-sm text-text-tertiary">{unit}</span>}
        {delta != null && (
          <span className={cn('font-numeric text-caption-md', DELTA[deltaTone])}>{delta}</span>
        )}
      </div>
      {footer && <span className="text-body-sm text-text-tertiary">{footer}</span>}
    </div>
  ),
);
StatCard.displayName = 'StatCard';
