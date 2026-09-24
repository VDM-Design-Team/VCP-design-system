import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';
import { Tooltip } from '../tooltip';

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
 * **`accent` is a coloured left edge**, and **the header row and value row
 * are centred** — both corrected against Figma's `SuperAdmin_Dashboard_Metrics`
 * (design audit, 24 Sep 2026). The export centred nothing and drew no edge.
 * The edge is a decorative `span`, not a `border-l`, so its colour can never
 * fight the card's own `border` over which one wins the left side.
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
  /** Decorative glyph beside the label — an `<Icon />`. */
  icon?: React.ReactNode;
  /** The card's left edge. `neutral` (the default) reads as "no category". */
  accent?: 'neutral' | 'info' | 'success' | 'critical' | 'warning';
  /**
   * A short explanation behind an info glyph after the label — what the
   * number means, not a restatement of the label. Omit it and there is no
   * glyph: a label that already explains itself has nothing to add.
   */
  hint?: string;
  /** Context line — "vs last cycle". */
  footer?: React.ReactNode;
}

const DELTA: Record<NonNullable<StatCardProps['deltaTone']>, string> = {
  positive: 'text-accent-success-tonal-content-default',
  negative: 'text-accent-critical-tonal-content-default',
  neutral: 'text-text-tertiary',
};

/* The five edges Figma draws — four categories plus the uncategorised
   default. Reused from the accent/neutral *border* tokens as a fill colour:
   same pixel Figma's edge is, just painted as a background rather than a
   border so it can never lose a cascade fight with the card's own border. */
const ACCENT: Record<NonNullable<StatCardProps['accent']>, string> = {
  neutral: 'bg-neutral-outline-border-default',
  info: 'bg-accent-info-outline-border-default',
  success: 'bg-accent-success-outline-border-default',
  critical: 'bg-accent-critical-outline-border-default',
  warning: 'bg-accent-warning-outline-border-default',
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      unit,
      delta,
      deltaTone = 'neutral',
      icon,
      accent = 'neutral',
      hint,
      footer,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col gap-2 overflow-hidden rounded-md border border-stroke-subtle bg-surface-elevated p-4 font-sans shadow-card',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-1', ACCENT[accent])} />
      <div className="flex items-center justify-center gap-1.5">
        {icon && (
          <span aria-hidden="true" className="grid shrink-0 place-items-center text-text-subtle">
            {icon}
          </span>
        )}
        <span className="text-body-sm text-text-tertiary">{label}</span>
        {hint && (
          <Tooltip content={hint}>
            <button
              type="button"
              aria-label={`About ${typeof label === 'string' ? label : 'this metric'}`}
              className={cn(
                'grid size-4 shrink-0 place-items-center rounded-sm text-text-subtle',
                'hover:text-text-secondary',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
              )}
            >
              <Icon name="info" size="sm" />
            </button>
          </Tooltip>
        )}
      </div>
      <div className="flex flex-wrap items-baseline justify-center gap-1.5">
        <span className="font-numeric text-heading-lg text-text-primary">{value}</span>
        {unit && <span className="text-body-sm text-text-tertiary">{unit}</span>}
        {delta != null && (
          <span className={cn('font-numeric text-caption-md', DELTA[deltaTone])}>{delta}</span>
        )}
      </div>
      {footer && <span className="text-center text-body-sm text-text-tertiary">{footer}</span>}
    </div>
  ),
);
StatCard.displayName = 'StatCard';
