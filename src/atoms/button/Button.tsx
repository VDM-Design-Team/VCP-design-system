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
    'font-sans text-label-sm-medium whitespace-nowrap',
    'rounded-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    'disabled:pointer-events-none aria-disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        /* action.primary — filled */
        primary: [
          'bg-action-primary-surface-default text-action-primary-content-default',
          'hover:bg-action-primary-surface-hover active:bg-action-primary-surface-pressed',
          'disabled:bg-action-primary-surface-disabled disabled:text-action-primary-content-disabled aria-disabled:bg-action-primary-surface-disabled aria-disabled:text-action-primary-content-disabled',
        ],
        /* action.secondary — outlined */
        secondary: [
          'bg-action-secondary-surface-default text-action-secondary-content-default',
          'border border-action-secondary-border-default',
          'hover:bg-action-secondary-surface-hover hover:border-action-secondary-border-hover',
          'active:bg-action-secondary-surface-pressed active:border-action-secondary-border-pressed',
          'disabled:text-action-secondary-content-disabled disabled:border-action-secondary-border-disabled aria-disabled:text-action-secondary-content-disabled aria-disabled:border-action-secondary-border-disabled',
        ],
        /* neutral.outline — outlined, but grey. The Cancel beside a
           destructive answer: an outlined *brand* button reads as a second
           call to action, which is the wrong weight for the way out. */
        neutral: [
          'bg-neutral-outline-surface-default text-neutral-outline-content-default',
          'border border-neutral-outline-border-default',
          'hover:bg-neutral-outline-surface-hover hover:border-neutral-outline-border-hover hover:text-neutral-outline-content-hover',
          'active:bg-neutral-outline-surface-pressed active:border-neutral-outline-border-pressed active:text-neutral-outline-content-pressed',
          'disabled:text-neutral-outline-content-disabled disabled:border-neutral-outline-border-disabled aria-disabled:text-neutral-outline-content-disabled aria-disabled:border-neutral-outline-border-disabled',
        ],
        /* action.tertiary — ghost */
        tertiary: [
          'bg-action-tertiary-surface-default text-action-tertiary-content-default',
          'hover:text-action-tertiary-content-hover active:text-action-tertiary-content-pressed',
          'disabled:text-action-tertiary-content-disabled aria-disabled:text-action-tertiary-content-disabled',
        ],
        /* neutral.textual — a text button that is a control, not a call to action: the ghost button without its brand blue.
           A toolbar's actions (the bulk bar's Status, Urgency…), where blue on every one would read as a row of calls to action. */
        'neutral-text': [
          'bg-transparent text-neutral-textual-content-default',
          'hover:text-neutral-textual-content-hover active:text-neutral-textual-content-pressed',
          'disabled:text-neutral-textual-content-disabled aria-disabled:text-neutral-textual-content-disabled',
        ],
        /* accent.critical.outline — destructive, as text: Delete in a toolbar, where a filled red button would shout. */
        'critical-text': [
          'bg-transparent text-accent-critical-outline-content-default',
          'hover:text-accent-critical-outline-content-hover active:text-accent-critical-outline-content-pressed',
          'disabled:text-accent-critical-outline-content-disabled aria-disabled:text-accent-critical-outline-content-disabled',
        ],
        /* accent.critical.filled — destructive */
        danger: [
          'bg-accent-critical-filled-surface-default text-accent-critical-filled-content-default',
          'hover:bg-accent-critical-filled-surface-hover active:bg-accent-critical-filled-surface-pressed',
          'disabled:bg-accent-critical-filled-surface-disabled aria-disabled:bg-accent-critical-filled-surface-disabled',
        ],
        /* accent.critical.outline.content — a destructive answer drawn as text (Figma's Style=Text with a red
           label: the AV edit page's Discard, 1026:166776). Figma's label is the hover step at rest (red-700),
           darker than the default, so it clears 4.5:1; hover and press go one step on. */
        'danger-tertiary': [
          'bg-action-tertiary-surface-default text-accent-critical-outline-content-hover',
          'hover:text-accent-critical-outline-content-pressed active:text-accent-critical-outline-content-pressed',
          'disabled:text-accent-critical-outline-content-disabled aria-disabled:text-accent-critical-outline-content-disabled',
        ],
        /* text.link */
        link: [
          'bg-transparent text-text-link-default underline underline-offset-4',
          'hover:text-text-link-hover active:text-text-link-pressed hover:no-underline',
          'disabled:text-text-disabled aria-disabled:text-text-disabled',
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
  /**
   * Renders a spinner, looks disabled and ignores presses, but **keeps focus**: it is `aria-disabled`, not `disabled`, so
   * the person pressing Save is not dropped onto the page while it saves. A press (click, Enter, Space, or Enter in a field
   * of the form it submits) does nothing until it stops loading.
   */
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, iconLeft, iconRight, children, disabled, onClick, ...props }, ref) => {
    /* Loading but not disabled: still a tab stop and still focused, just inert. A disabled button keeps `disabled`. */
    const busy = Boolean(loading) && !disabled;
    return (
      <button
        ref={ref}
        className={cn(button({ variant, size, fullWidth }), className)}
        {...props}
        disabled={disabled}
        aria-disabled={busy || props['aria-disabled'] || undefined}
        aria-busy={loading || undefined}
        onClick={(event) => {
          /* Swallowing the click also stops a submit button's form from submitting, implicit submission included. */
          if (busy) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {loading ? <Spinner /> : iconLeft}
        {children}
        {!loading && iconRight}
      </button>
    );
  },
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
