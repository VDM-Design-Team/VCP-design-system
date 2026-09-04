import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Button — VCP's primary interactive control.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const button = cva(
  [
    'inline-flex items-center justify-center gap-1.5',
    'font-sans text-label-lg whitespace-nowrap',
    'rounded-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    'disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        /* action.primary — filled */
        primary: [
          'bg-action-primary-surface-default text-action-primary-content-default',
          'hover:bg-action-primary-surface-hover active:bg-action-primary-surface-pressed',
          'disabled:bg-action-primary-surface-disabled disabled:text-action-primary-content-disabled',
        ],
        /* action.secondary — outlined */
        secondary: [
          'bg-action-secondary-surface-default text-action-secondary-content-default',
          'border border-action-secondary-border-default',
          'hover:bg-action-secondary-surface-hover hover:border-action-secondary-border-hover',
          'active:bg-action-secondary-surface-pressed active:border-action-secondary-border-pressed',
          'disabled:text-action-secondary-content-disabled disabled:border-action-secondary-border-disabled',
        ],
        /* action.tertiary — ghost */
        tertiary: [
          'bg-action-tertiary-surface-default text-action-tertiary-content-default',
          'hover:text-action-tertiary-content-hover active:text-action-tertiary-content-pressed',
          'disabled:text-action-tertiary-content-disabled',
        ],
        /* accent.critical.filled — destructive */
        danger: [
          'bg-accent-critical-filled-surface-default text-accent-critical-filled-content-default',
          'hover:bg-accent-critical-filled-surface-hover active:bg-accent-critical-filled-surface-pressed',
          'disabled:bg-accent-critical-filled-surface-disabled',
        ],
        /* text.link */
        link: [
          'bg-transparent text-text-link-default underline underline-offset-4',
          'hover:text-text-link-hover active:text-text-link-pressed hover:no-underline',
          'disabled:text-text-disabled',
        ],
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-5',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  /** Renders a spinner and disables the button. */
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, iconLeft, iconRight, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  ),
);
Button.displayName = 'Button';

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
