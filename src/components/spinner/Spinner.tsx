import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner — an indeterminate loading indicator.
 *
 * Colour is never set here. Both the ring and the caption inherit `currentColor`,
 * exactly as `Icon` does, so the caller sets it with a text token
 * (`className="text-text-tertiary"`) and dark comes for free.
 *
 * Motion: under `prefers-reduced-motion` the rotation is swapped for a pulse
 * rather than stopped. The setting does not ask for "no animation" — it asks for
 * no large or vestibular motion, and continuous rotation is exactly that. A slow
 * opacity fade on a 16–24 box is not, and it still says "still working"; a frozen
 * spinner reads as a hang, which is worse than no spinner at all.
 *
 * `Skeleton` drops its pulse outright under the same setting, and that is not a
 * contradiction: a skeleton fading across a whole block is a large luminance
 * change, and a *static* skeleton still reads as a placeholder. Neither is true
 * here — the fallback has to keep moving or it stops meaning anything.
 */
const indicator = cva('animate-spin motion-reduce:animate-pulse', {
  variants: {
    /* 16 inside a control, 20 inline, 24 for a panel. Same ramp as `Icon`. */
    size: { sm: 'size-4', md: 'size-5', lg: 'size-6' },
  },
  defaultVariants: { size: 'md' },
});

/**
 * Ring thickness in units of the 24-wide viewBox, derived from the rendered size
 * as `48 / renderedSize` so the ring keeps the same optical weight at every size
 * instead of thickening with the box. `sm` works out at 3, which is exactly what
 * `Button`'s private inline spinner already draws.
 */
const STROKE_WIDTH: Record<SpinnerSize, number> = { sm: 3, md: 2.4, lg: 2 };

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'style'> {
  /** 16 inside a control, 20 inline, 24 for a panel. */
  size?: SpinnerSize;
  /**
   * What the wait is called. Always the accessible name; also the visible text
   * when `showLabel` is set. Defaults to "Loading" — a spinner with no name at
   * all is invisible to a screen reader.
   */
  label?: string;
  /** Paint `label` beside the ring. Do this for waits long enough to explain. */
  showLabel?: boolean;
  /**
   * Render silently: no `role`, and `aria-hidden` on the whole thing.
   *
   * Use this inside a control that already announces its own state — `Button`
   * sets `aria-busy` on itself, so a spinner in its label would be a second
   * announcement of the same fact.
   */
  decorative?: boolean;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    { size = 'md', label = 'Loading', showLabel = false, decorative = false, className, ...props },
    ref,
  ) => {
    const strokeWidth = STROKE_WIDTH[size];

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center gap-2', className)}
        /* `status` is a polite live region: reported without stealing focus.
           Never `progressbar` — that role is for *determinate* progress and
           promises a value this component does not have. */
        role={decorative ? undefined : 'status'}
        aria-hidden={decorative ? true : undefined}
        {...props}
      >
        <svg
          className={cn(indicator({ size }))}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* The full ring, dimmed, is the track the arc travels around. */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="opacity-25"
          />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>

        {/* A live region is announced from its *contents*. An empty one carrying
            only `aria-label` is silent in several screen readers — the classic
            invisible spinner. So the text is always in the DOM, and `showLabel`
            only decides whether it is painted. */}
        {showLabel ? (
          <span className="font-sans text-label-md">{label}</span>
        ) : decorative ? null : (
          <span className="sr-only">{label}</span>
        )}
      </span>
    );
  },
);
Spinner.displayName = 'Spinner';
