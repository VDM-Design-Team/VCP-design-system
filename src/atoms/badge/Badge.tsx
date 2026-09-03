import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Badge — a small, non-interactive label that classifies the thing beside it.
 *
 * Ported from the Figma `Tag` component. The export's pale fill with near-black
 * text is the `tonal` treatment in VCP's token vocabulary, so every coloured tone
 * is one `accent.<name>.tonal` surface/content pair; neutral is the same shape
 * built from `surface.neutral.*` + `text.*`, which has no accent triad.
 *
 * **Generic tones only.** The export's `tone` also accepted VCP status names
 * (`accepted`, `for qa`, `confirmed prod`, …). VCP vocabulary belongs in
 * `src/patterns/`, so those are deliberately absent — `StatusPill` will map the
 * statuses onto these tones. Never reintroduce a status name here.
 *
 * Badge is not a control: it takes no focus and fires no events, so the 40
 * minimum target size does not apply. If it needs to be clickable or removable,
 * it is a `Chip`, not a Badge.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const badge = cva(
  [
    'inline-flex max-w-full items-center justify-center align-middle',
    'font-sans whitespace-nowrap',
    /* shape.radius.md — the Figma Tag's own corner. ds-lint-ignore (8px) */
    'overflow-hidden rounded-md',
  ],
  {
    variants: {
      tone: {
        /* surface.neutral + text.* — there is no `accent.neutral` triad. */
        neutral: 'bg-surface-neutral-subtle text-text-secondary',
        /* surface.brand + text.brand — there is no `accent.brand` triad either. */
        brand: 'bg-surface-brand-faint text-text-brand-strong',
        info: 'bg-accent-info-tonal-surface-default text-accent-info-tonal-content-default',
        success:
          'bg-accent-success-tonal-surface-default text-accent-success-tonal-content-default',
        warning:
          'bg-accent-warning-tonal-surface-default text-accent-warning-tonal-content-default',
        danger:
          'bg-accent-critical-tonal-surface-default text-accent-critical-tonal-content-default',
      },
      size: {
        /* 24 tall — dense tables, inline beside body text. ds-lint-ignore */
        sm: 'h-6 gap-1 px-2 text-label-md',
        /* 28 tall — the default, and what the Figma Tag ships at. ds-lint-ignore */
        md: 'h-7 gap-2 px-2 text-label-lg',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {
  /**
   * Decorative glyph before the label. Pass an `Icon` at `size="sm"` next to a
   * `sm` badge and `size="md"` next to an `md` one. Rendered `aria-hidden` —
   * the text is what carries the meaning.
   */
  icon?: React.ReactNode;
  /** Decorative glyph after the label. Same rules as `icon`. */
  trailingIcon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, size, icon, trailingIcon, children, ...props }, ref) => (
    <span ref={ref} className={cn(badge({ tone, size }), className)} {...props}>
      {icon && <Adornment>{icon}</Adornment>}
      {children != null && children !== false && (
        <span className="min-w-0 truncate">{children}</span>
      )}
      {trailingIcon && <Adornment>{trailingIcon}</Adornment>}
    </span>
  ),
);
Badge.displayName = 'Badge';

/**
 * Icons in a Badge are decoration — the label already says what the badge means,
 * so announcing the glyph as well is a duplicate. Colour is inherited from the
 * tone's content token via `currentColor`, so nothing is set here.
 */
function Adornment({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center">
      {children}
    </span>
  );
}
