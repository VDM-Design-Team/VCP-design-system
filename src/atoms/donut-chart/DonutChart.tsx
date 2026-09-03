import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * DonutChart — one fraction of one whole, as a ring (or a half-ring gauge):
 * capacity consumed, points used, cycle progress. The circular sibling of
 * `ProgressBar`, and deliberately its twin: same `role="progressbar"`, same
 * four tones on the same tokens, same track.
 *
 * Two things from the export did not survive:
 *
 * - **Auto-escalation is gone.** It turned amber at 75% and red at 90% on its
 *   own — but thresholds are domain knowledge (docs/progress-bar.md already
 *   rules on this); the caller sets `tone`, brand by default.
 * - **`tone` no longer takes arbitrary colour strings.** Tokens only.
 *
 * `size` and `thickness` are SVG geometry (numbers, not CSS) — a chart is
 * measured, not stepped, which is also why the centre numeral scales with the
 * ring instead of sitting on the type ramp. It is set in the numeric face.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const fill = cva('transition-[stroke-dasharray] duration-500', {
  variants: {
    /* ProgressBar's fills, stroke-flavoured. */
    tone: {
      brand: 'stroke-surface-brand-strong',
      success: 'stroke-accent-success-filled-surface-default',
      warning: 'stroke-accent-warning-filled-surface-default',
      danger: 'stroke-accent-critical-filled-surface-default',
    },
  },
  defaultVariants: { tone: 'brand' },
});

export interface DonutChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof fill> {
  value: number;
  /** The whole. The announced value stays in real units. */
  max?: number;
  /** Outer diameter in SVG units. */
  size?: number;
  /** Ring thickness in SVG units. */
  thickness?: number;
  /** Half-donut gauge — the Cycle Summary treatment. */
  half?: boolean;
  /** Replaces the centred percentage. Visual only — the meter announces numbers. */
  label?: React.ReactNode;
  /** Small line under the number — "of 40 pts". */
  caption?: React.ReactNode;
}

export const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 140,
      thickness = 16,
      half,
      label,
      caption,
      tone,
      ...props
    },
    ref,
  ) => {
    const clamped = Math.max(0, Math.min(max, value));
    const pct = max > 0 ? clamped / max : 0;

    const r = (size - thickness) / 2;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    const sweep = half ? circumference / 2 : circumference;
    const height = half ? c + thickness / 2 : size;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        /* An unnamed meter announces as a number of nothing — pass aria-label
           (or aria-labelledby) unless `caption` is plain text, which is used. */
        aria-label={typeof caption === 'string' ? caption : undefined}
        className={cn('relative inline-block', className)}
        {...props}
      >
        <svg
          width={size}
          height={height}
          viewBox={`0 0 ${size} ${height}`}
          aria-hidden="true"
          className="block"
        >
          {/* surface.track — ProgressBar's track, bent into a ring. */}
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={half ? `${sweep} ${circumference}` : undefined}
            transform={half ? `rotate(180 ${c} ${c})` : undefined}
            className="stroke-surface-track"
          />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${sweep * pct} ${circumference}`}
            transform={`rotate(${half ? 180 : -90} ${c} ${c})`}
            className={fill({ tone })}
          />
        </svg>
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 flex flex-col items-center',
            half ? 'justify-end pb-1' : 'justify-center',
          )}
        >
          <span
            className="font-numeric font-semibold text-text-primary"
            /* Scales with the ring — geometry, not the type ramp. */
            style={{ fontSize: Math.round(size * 0.2), lineHeight: 1 }}
          >
            {label ?? `${Math.round(pct * 100)}%`}
          </span>
          {caption && (
            <span className="mt-1 font-sans text-label-sm text-text-tertiary">{caption}</span>
          )}
        </div>
      </div>
    );
  },
);
DonutChart.displayName = 'DonutChart';
