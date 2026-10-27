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
 * `segmented` is the flat-ended gauge Figma draws for the Cycle Summary: butt
 * caps instead of round ones, and a small gap between the filled arc and the
 * remainder, so a 90% ring reads as two pieces rather than one bar with a
 * darker end. The gap scales with `thickness`. Round-capped rings stay the default.
 *
 * Colour is a `tone` first. For one a tone does not cover, `fillClassName` takes a
semantic `stroke-*` token class (and `trackClassName` the track's) — a token
class, never a hex.

`size="icon"` is the small decorative one from the table rows: a 20 box with
the ring 16 across inside it, thin, and no numeral. `showValue={false}` does the
same for any other size — the ring drawn alone, no numeral, no caption. Either
way it is still a meter, so give it an `aria-label`.

`size` and `thickness` are SVG geometry (numbers, not CSS) — a chart is
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
      critical: 'stroke-accent-critical-filled-surface-default',
      /* accent.yellow.medium — the light yellow Figma draws for "getting
         close". Softer than `warning`, and it does not reach 3:1 on the track,
         so keep the number beside it (or use `warning`). */
      yellow: 'stroke-accent-yellow-medium',
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
  /** Outer diameter in SVG units, or `"icon"`: a 20 box around a 16 ring, no numeral. */
  size?: number | 'icon';
  /** Ring thickness in SVG units. Defaults to 16, or 2 for `size="icon"`. */
  thickness?: number;
  /** Half-donut gauge — the Cycle Summary treatment. */
  half?: boolean;
  /**
   * Flat ends and a gap between the filled arc and the remainder, instead of a
   * round-capped fill over a full track. Pair it with a thin `thickness`.
   */
  segmented?: boolean;
  /** Draw the ring alone: hides the centred number and the caption. Off for `size="icon"`. */
  showValue?: boolean;
  /** Token `stroke-*` class for the filled arc; wins over `tone`. */
  fillClassName?: string;
  /** Token `stroke-*` class for the track. */
  trackClassName?: string;
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
      size: sizeProp = 140,
      thickness: thicknessProp,
      half,
      segmented,
      showValue: showValueProp,
      fillClassName,
      trackClassName,
      label,
      caption,
      tone,
      ...props
    },
    ref,
  ) => {
    const clamped = Math.max(0, Math.min(max, value));
    const pct = max > 0 ? clamped / max : 0;

    const icon = sizeProp === 'icon';
    /* The icon is a 20 box with the ring 16 across inside it; every other
       size is the ring itself. */
    const box = icon ? 20 : sizeProp;
    const size = icon ? 16 : sizeProp;
    const thickness = thicknessProp ?? (icon ? 2 : 16);
    const showValue = showValueProp ?? !icon;

    const r = (size - thickness) / 2;
    const c = box / 2;
    const circumference = 2 * Math.PI * r;
    const sweep = half ? circumference / 2 : circumference;
    const height = half ? c + thickness / 2 : box;

    /* Segmented: the fill and the remainder are separate arcs with a gap
       between them, not a fill laid over a full track. */
    const gap = thickness / 4;
    const filled = sweep * pct;
    const split = segmented && pct > 0 && pct < 1;
    const fillLength = split ? Math.max(0, filled - gap / 2) : filled;
    const trackLength = split ? Math.max(0, sweep - filled - gap / 2) : sweep;
    const trackStart = split ? filled + gap / 2 : 0;
    const turn = half ? 180 : -90;

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
          width={box}
          height={height}
          viewBox={`0 0 ${box} ${height}`}
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
            strokeLinecap={segmented ? 'butt' : 'round'}
            strokeDasharray={
              segmented
                ? `${trackLength} ${circumference}`
                : half
                  ? `${sweep} ${circumference}`
                  : undefined
            }
            strokeDashoffset={segmented ? -trackStart : undefined}
            transform={segmented || half ? `rotate(${turn} ${c} ${c})` : undefined}
            className={cn('stroke-surface-track', trackClassName)}
          />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap={segmented ? 'butt' : 'round'}
            strokeDasharray={`${fillLength} ${circumference}`}
            transform={`rotate(${turn} ${c} ${c})`}
            className={cn(fill({ tone }), fillClassName)}
          />
        </svg>
        {showValue && (
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
              <span className="mt-1 font-sans text-caption-md-medium text-text-tertiary">{caption}</span>
            )}
          </div>
        )}
      </div>
    );
  },
);
DonutChart.displayName = 'DonutChart';
