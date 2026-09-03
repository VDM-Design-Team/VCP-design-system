import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * PaginationDots — position dots for a carousel, an onboarding flow, a small
 * stepper: places, not addresses. When the user might *say* a page number, use
 * `Pagination` instead.
 *
 * The export gave the dots `role="tablist"` — the ARIA these almost never are,
 * because nothing here owns the panels a tablist promises. Rebuilt as a plain
 * group of buttons, each named "Go to page N" with `aria-current` on the
 * active one. Without `onChange` the dots are a passive indicator: no buttons,
 * no tab stops, and a visually-hidden "Page N of M" carrying the fact.
 *
 * The current dot stretches to a pill and takes the brand fill; the rest sit
 * on `surface.neutral.strong` — deliberately darker than the export's
 * slate-300, because an unselected dot is still a control and 3:1 is the bar
 * (measured in docs/pagination-dots.md). The dots are tiny by design and the
 * targets are, too — the pointer-dense exemption, stretched thin; a touch-first
 * surface should swipe, with the dots as read-only confirmation.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface PaginationDotsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  count: number;
  /** 0-based, matching the export. */
  index: number;
  /** Omit to render a passive indicator — no buttons, no tab stops. */
  onChange?: (index: number) => void;
  /** Accessible name of the group. Say what the pages are of. */
  label?: string;
}

const dot = (on: boolean) =>
  cn(
    'h-2 rounded-full transition-all duration-200',
    on ? 'w-5 bg-surface-brand-strong' : 'w-2 bg-surface-neutral-strong',
  );

export const PaginationDots = React.forwardRef<HTMLDivElement, PaginationDotsProps>(
  ({ className, count, index, onChange, label = 'Pages', ...props }, ref) => {
    const dots = Array.from({ length: count });

    if (!onChange) {
      return (
        <div ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...props}>
          {dots.map((_, i) => (
            <span key={i} aria-hidden="true" className={dot(i === index)} />
          ))}
          <span className="sr-only">{`${label}: ${index + 1} of ${count}`}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className={cn('inline-flex items-center gap-1', className)}
        {...props}
      >
        {dots.map((_, i) => {
          const on = i === index;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              aria-current={on ? 'true' : undefined}
              onClick={() => onChange(i)}
              /* The button is the padded hit area; the visible dot is inside,
                 so hover and focus have something bigger than the dot to land on. */
              className={cn(
                'grid h-4 place-items-center rounded-full px-0.5',
                !on && 'hover:[&>span]:bg-surface-neutral-stronger',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
              )}
            >
              <span className={dot(on)} />
            </button>
          );
        })}
      </div>
    );
  },
);
PaginationDots.displayName = 'PaginationDots';
