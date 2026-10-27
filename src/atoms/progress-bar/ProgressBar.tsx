import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * ProgressBar — a determinate meter: how much of a known whole is used or done.
 * Budget consumption, upload progress, capacity. For a wait with no known end,
 * use `Spinner`; for a placeholder while content loads, use `Skeleton`.
 *
 * `role="progressbar"` (or `meter`) with real `aria-valuenow/min/max` — this component
 * promises a value, which is exactly what `Spinner` refuses to promise. The
 * visible `label` doubles as the accessible name via `aria-labelledby`; without
 * one, pass `aria-label`, because an unnamed meter announces as "50%… of what?".
 *
 * The export took `height?: number` and free-hex fills; rebuilt as a `size`
 * variant and one token per tone. `tone` is consumption status, not decoration:
 * budget dashboards walk it brand → warning → critical as points run down. The
 * mapping from a number to a tone belongs to the caller (or a future pattern) —
 * thresholds are domain knowledge, and this is `src/components/`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const fill = cva('h-full rounded-full transition-[width] duration-300', {
  variants: {
    tone: {
      /* surface.brand.strong — the resting, nothing-is-wrong fill. */
      brand: 'bg-surface-brand-strong',
      /* accent.<x>.filled.surface — the strong fills, same family Banner uses. */
      success: 'bg-accent-success-filled-surface-default',
      warning: 'bg-accent-warning-filled-surface-default',
      critical: 'bg-accent-critical-filled-surface-default',
      /* accent.pending.outline.border — the orange status family, a step more
         urgent than warning: password strength's Weak. The bright border shade,
         like `caution`: 2.27:1 on the light track, so only beside a written
         value. */
      pending: 'bg-accent-pending-outline-border-default',
      /* accent.warning.outline.border — the bright amber. A deliberate exception
         to the filled family: 1.55:1 on the light track, so use it only where the
         value is also written out (valueLabel), never as the only signal. */
      caution: 'bg-accent-warning-outline-border-default',
      /* accent.info.filled.surface — a level that is neither good nor bad, just
         "further along": password strength's Good. */
      info: 'bg-accent-info-filled-surface-default',
    },
  },
  defaultVariants: { tone: 'brand' },
});

const track = cva(
  /* surface.track — added for this component: the quiet grey that keeps every
     tone's fill ≥3.8:1 against it in BOTH themes. No pre-existing token could;
     the closest (surface.neutral.medium) dropped the critical fill to 1.25:1 in
     dark. The track whispers, the fill carries the boundary. */
  'w-full overflow-hidden rounded-full bg-surface-track',
  {
    variants: {
      /* 4 for dense table rows, 8 as the default the export shipped at. */
      size: { sm: 'h-1', md: 'h-2' },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fill>,
    VariantProps<typeof track> {
  /** How much is used/done. Clamped into `0…max`. */
  value: number;
  /** The whole. Defaults to 100 so `value` reads as a percentage. */
  max?: number;
  /**
   * Visible name above the bar, wired to the meter with `aria-labelledby`.
   * Without it the bar is bare — supply `aria-label` instead.
   */
  label?: string;
  /** Paints the rounded percentage after the label row, in the numeric face. */
  showValue?: boolean;
  /**
   * Words for the value instead of a percentage — "Strong", "34 of 40 used".
   * Painted at the end of the label row in place of `showValue`, and announced
   * as `aria-valuetext`, so a level reads as its name rather than a number.
   */
  valueLabel?: string;
  /**
   * `meter` for a value within a range that is not progress toward finishing —
   * a capacity, a strength. Same look; a different promise to assistive tech.
   */
  role?: 'progressbar' | 'meter';
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      tone,
      size,
      label,
      showValue,
      valueLabel,
      role = 'progressbar',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    const clamped = Math.max(0, Math.min(max, value));
    const pct = max > 0 ? (clamped / max) * 100 : 0;

    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-1.5', className)} {...props}>
        {(label || showValue || valueLabel) && (
          <div className="flex items-baseline justify-between gap-2 font-sans text-caption-md-regular text-text-tertiary">
            {/* The span renders (empty) even without a label so a lone
                percentage still right-aligns. */}
            <span id={label ? labelId : undefined}>{label}</span>
            {valueLabel ? (
              <span aria-hidden="true">{valueLabel}</span>
            ) : (
              showValue && (
                <span className="font-numeric text-caption-md-medium">{Math.round(pct)}%</span>
              )
            )}
          </div>
        )}
        <div
          role={role}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={clamped}
          aria-valuetext={valueLabel}
          /* The name goes on the meter, not the wrapper: a visible `label`
             by reference, else whatever the caller passed. */
          aria-labelledby={label ? labelId : ariaLabelledby}
          aria-label={label ? undefined : ariaLabel}
          className={track({ size })}
        >
          <div className={fill({ tone })} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  },
);
ProgressBar.displayName = 'ProgressBar';
