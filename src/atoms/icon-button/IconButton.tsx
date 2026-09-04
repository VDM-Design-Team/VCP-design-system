import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../icon';

/**
 * IconButton — a square button carrying a single icon and no visible text.
 *
 * This is `Button` with the label taken away, and it is deliberately built from
 * the same parts: the same `variant` names off the same `action.*` families, the
 * same `sm` 36 / `md` 40 / `lg` 48 scale, the same `rounded-sm` corner, the same
 * `focus-visible:outline-stroke-focused` ring, and the same `loading` behaviour.
 * If you can use Button, you can use this without reading anything.
 *
 * **The label is required, in the type system.** An icon-only control with no
 * accessible name is an unlabelled button to every screen reader — the single
 * most common failure in this component's category. `label` is a required
 * `string`, and `aria-label` / `aria-labelledby` / `children` are removed from
 * the prop type so there is no way around it. It is not possible to ship an
 * unnamed IconButton from this component.
 *
 * The name lives on the `<button>`. The `Icon` inside stays decorative — it is
 * rendered without a `label`, so `Icon` marks it `aria-hidden`. Naming both
 * makes the control announce itself twice.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const iconButton = cva(
  [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
    'disabled:pointer-events-none',
  ],
  {
    variants: {
      /* Identical to Button's, class for class — same tokens, same states. */
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
        /* action.tertiary — ghost. The default here: an icon-only control is
           almost always a toolbar or table-row affordance, which docs/button.md
           already assigns to the ghost treatment. */
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
      },
      /* Square, on Button's own height scale: 36 / 40 / 48. `md` is the 40
         minimum target; `sm` is pointer-dense contexts only. */
      size: {
        sm: 'size-9',
        md: 'size-10',
        lg: 'size-12',
      },
    },
    defaultVariants: { variant: 'tertiary', size: 'md' },
  },
);

/** Button size → Icon size. 16 in dense cells, 20 inline, 24 for nav. */
const ICON_SIZE = { sm: 'sm', md: 'md', lg: 'lg' } as const;

export interface IconButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      /* All four removed so `label` is the only way to name this control, and
         so no one can smuggle visible text into an icon-only button. */
      'children' | 'aria-label' | 'aria-labelledby' | 'title'
    >,
    VariantProps<typeof iconButton> {
  /** The glyph. Decorative — the name comes from `label`, never from here. */
  icon: IconName;
  /**
   * The accessible name, and the pointer tooltip. **Required.** Say what the
   * button does, not what the picture is: "Delete deliverable", not "Bin".
   */
  label: string;
  /** Renders a spinner and disables the button. The name does not change. */
  loading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, label, loading, disabled, ...props }, ref) => {
    const scale = size ?? 'md';
    /* `title` gives pointer users a hover hint — but a Tooltip wrapping this
       button already draws one, and it associates itself with aria-describedby.
       Leaving `title` on would render both: ours, then the browser's native
       bubble on top of it, which the caller has no way to suppress. */
    const describedBy = (props as { 'aria-describedby'?: string })['aria-describedby'];
    return (
      <button
        ref={ref}
        className={cn(iconButton({ variant, size }), className)}
        /* The name sits here and stays put through the loading state, so the
           control never changes identity mid-announcement. */
        aria-label={label}
        title={describedBy ? undefined : label}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <Spinner size={scale} />
        ) : (
          /* No `label` on the Icon — it renders aria-hidden, as it should. */
          <Icon name={icon} size={ICON_SIZE[scale]} />
        )}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';

/* Same mark as Button's spinner, sized to the glyph it replaces so the button
   does not twitch when loading starts. */
const SPINNER_SIZE = { sm: 'size-4', md: 'size-5', lg: 'size-6' } as const;

function Spinner({ size }: { size: keyof typeof SPINNER_SIZE }) {
  return (
    <svg
      className={cn(SPINNER_SIZE[size], 'animate-spin')}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
