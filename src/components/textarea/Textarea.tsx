import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Textarea — multi-line free text entry.
 *
 * Deliberately shares Input's shell language (radius.md, border.default,
 * surface.elevated, the same horizontal padding and the same focus ring) so the
 * two read as one family when stacked in a form.
 *
 * Every class below resolves to a semantic token. If you need a value that isn't
 * here, add the token in `tokens/` first — never hardcode a hex, a raw pixel
 * value, or an arbitrary Tailwind class.
 */
const textarea = cva(
  [
    'block font-sans text-body-md',
    'px-3 py-2.5 rounded-md border',
    'bg-surface-elevated text-text-primary',
    'placeholder:text-text-subtle',
    'transition-colors',
    /* Text fields always match :focus-visible, so the ring shows on click and on tab. */
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    /* Vertical only: horizontal resize breaks form column alignment. */
    'resize-y',
    'disabled:cursor-not-allowed disabled:resize-none',
    'disabled:bg-surface-neutral-faint disabled:text-text-disabled',
    'disabled:border-stroke-subtle disabled:placeholder:text-text-disabled',
  ],
  {
    variants: {
      invalid: {
        /* accent.critical.outline.border — the error boundary, kept while focused. */
        true: 'border-accent-critical-outline-border-default',
        false: 'border-stroke-stronger enabled:hover:border-stroke-focused',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { invalid: false, fullWidth: true },
  },
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'>,
    VariantProps<typeof textarea> {
  /**
   * Paints the critical border and sets `aria-invalid`. Pair with the field's
   * error message and wire that message up with `aria-describedby`.
   */
  invalid?: boolean;
  /** Spans its container. Defaults to `true` — form fields fill their column. */
  fullWidth?: boolean;
  /** Visible rows before the field scrolls. Passed straight to the element. */
  rows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, fullWidth, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(textarea({ invalid, fullWidth }), className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
