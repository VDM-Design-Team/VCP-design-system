import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';

/**
 * RemoveButton — the small critical ✕ that takes one item out of a list: a card in a
 * description, a file in a gallery. Icon only, so it has a required name.
 *
 * Two looks, one family. `plain` is just the glyph, a ✕ in a ring, changing colour through its
 * states: for an item on a plain surface. `tonal` is a ✕ on a filled disc: for an item that
 * sits on top of a picture, where a bare glyph could vanish into the image. Both use the
 * critical outline content colour (default, hover, pressed); `tonal` adds the critical tonal fill.
 *
 * It does not decide when it shows. Whoever places it positions it and reveals it (on hover or
 * focus of the item, always on a touch screen): pass those classes in `className`. Both looks are 20
 * to look at and 40 to press: the click area is invisible padding, much bigger than the drawing.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const removeButton = cva(
  [
    'relative grid shrink-0 place-items-center rounded-full outline-none',
    'transition-colors motion-reduce:transition-none',
    'text-accent-critical-outline-content-default',
    'hover:text-accent-critical-outline-content-hover active:text-accent-critical-outline-content-pressed',
    /* The 40 target: 10 past the 20 button on every side. */
    'before:absolute before:-inset-2.5',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    'disabled:pointer-events-none disabled:text-accent-critical-outline-content-disabled',
  ],
  {
    variants: {
      tone: {
        /* The glyph alone: 20. */
        plain: 'size-5',
        /* On a filled disc, also 20: for use over an image. */
        tonal: [
          'size-5',
          'bg-accent-critical-tonal-surface-default',
          'hover:bg-accent-critical-tonal-surface-hover active:bg-accent-critical-tonal-surface-pressed',
        ],
      },
    },
    defaultVariants: { tone: 'plain' },
  },
);

export interface RemoveButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label' | 'aria-labelledby'>,
    VariantProps<typeof removeButton> {
  /** The accessible name. **Required.** Say which item: "Remove problem 2", "Remove report.pdf". */
  label: string;
}

export const RemoveButton = React.forwardRef<HTMLButtonElement, RemoveButtonProps>(
  ({ className, tone, label, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(removeButton({ tone }), className)}
      {...props}
    >
      {tone === 'tonal' ? (
        <Icon name="x" aria-hidden="true" className="size-3" />
      ) : (
        <Icon name="x-circle" size="md" aria-hidden="true" />
      )}
    </button>
  ),
);
RemoveButton.displayName = 'RemoveButton';
