import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';

/**
 * Carousel — one panel at a time, with an arrow on each side to move between
 * them. The positions themselves are `PaginationDots`, and they are **not**
 * rendered here: the caller places them, because a design does not always put
 * them next to the content. The changelog dialog puts them below its footer
 * buttons, which a self-contained carousel could not have done.
 *
 * That is also why it is **controlled**. `index` and `onIndexChange` are the
 * caller's, so the arrows here and the dots wherever they live are reading one
 * number rather than two that can disagree.
 *
 * **It wraps.** Next on the last panel goes to the first. Decided 11 September
 * 2026 — the alternative was disabling the arrow at each end, and wrapping
 * keeps both arrows live and puts the whole of "where am I" on the dots.
 *
 * **It never moves on its own.** There is no auto-advance and no prop to add
 * one. A panel that changes while it is being read is the single worst thing a
 * carousel does, and every remedy for it — pause on hover, pause on focus, a
 * stop button — is machinery that exists only to undo the original decision.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** How many panels there are. */
  count: number;
  /** Which one is showing, 0-based. Controlled. */
  index: number;
  onIndexChange: (index: number) => void;
  /** The carousel's accessible name. Say what the panels are of. */
  label: string;
  /** The panel at `index`. The caller renders one, not all of them. */
  children: React.ReactNode;
  previousLabel?: string;
  nextLabel?: string;
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      className,
      count,
      index,
      onIndexChange,
      label,
      children,
      previousLabel = 'Previous',
      nextLabel = 'Next',
      ...props
    },
    ref,
  ) => {
    /* Wrapping both ways, so neither arrow is ever a dead end. */
    const go = (delta: number) => onIndexChange((index + delta + count) % count);

    return (
      <div
        ref={ref}
        role="group"
        /* Announced as "carousel" rather than "group", so a screen-reader user
           knows the arrows will change what is underneath them. */
        aria-roledescription="carousel"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.defaultPrevented) return;
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            go(-1);
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            go(1);
          }
        }}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        <IconButton
          icon="caret-left"
          label={previousLabel}
          variant="tertiary"
          onClick={() => go(-1)}
        />

        {/* `aria-live` so moving between panels is announced. Safe here only
            because nothing moves on its own — a live region that changes
            without being asked is what makes carousels unreadable. */}
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
          aria-live="polite"
          className="min-w-0 flex-1"
        >
          {children}
        </div>

        <IconButton icon="caret-right" label={nextLabel} variant="tertiary" onClick={() => go(1)} />
      </div>
    );
  },
);
Carousel.displayName = 'Carousel';
