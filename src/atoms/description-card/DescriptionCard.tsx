import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * DescriptionCard — one numbered entry in an Added Value's description: the
 * problem, the solution, the deliverable, the outcome the requester wants. A
 * coloured number block on the left, the paragraph in a quiet panel beside it.
 * Read off the Figma `Description_Card` set, four types, one row each.
 *
 * The colour is the type's, and the type is the whole of what it says: the number
 * block is a label, not a status, so the paragraph is always the content and the
 * number is always the position in its list. A card is one row; the list is the
 * caller's (a `ul` of these, or a column).
 *
 * Three of the four colours are status tokens used as plain fills (`critical`,
 * `success`, `info`); the fourth is the strong neutral. Figma's Deliverable colour is
 * a cyan that is on no ramp, and its annotation says so; `info` stands in for it
 * until design picks one.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const number = cva(
  [
    'flex min-w-5 shrink-0 items-center justify-center rounded-l-sm px-1 py-2',
    'font-sans text-label-sm-bold text-text-inverted-primary',
  ],
  {
    variants: {
      type: {
        problem: 'bg-accent-critical-filled-surface-default',
        solution: 'bg-accent-success-filled-surface-default',
        /* Figma's cyan is on no ramp; `info` until design picks a tone. */
        deliverable: 'bg-accent-info-filled-surface-default',
        'desired-outcome': 'bg-surface-neutral-stronger',
      },
    },
    defaultVariants: { type: 'problem' },
  },
);

export type DescriptionCardType = NonNullable<VariantProps<typeof number>['type']>;

export interface DescriptionCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof number> {
  /** What the entry is — decides the number block's colour. */
  type?: DescriptionCardType;
  /** Its place in the list. Defaults to 1. */
  position?: number;
  /** The paragraph. Text or light markup. */
  children: React.ReactNode;
}

export const DescriptionCard = React.forwardRef<HTMLDivElement, DescriptionCardProps>(
  ({ className, type, position = 1, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-stretch font-sans', className)} {...props}>
      {/* The number is a visual marker; a list of these is numbered by its own `ol` when it matters. */}
      <span aria-hidden="true" className={number({ type })}>
        {position}
      </span>
      <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-center rounded-r-sm border border-stroke-subtle bg-surface-neutral-subtle p-3 text-body-sm-regular text-text-primary">
        {children}
      </div>
    </div>
  ),
);
DescriptionCard.displayName = 'DescriptionCard';
