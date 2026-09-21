import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import {
  CLASSIFICATION_STYLE,
  type ClassificationTone,
  type ClassificationVariant,
} from '../../lib/classification-tones';

/**
 * Badge — a small, non-interactive label that classifies the thing beside it.
 *
 * Ported from the Figma `Badge` component (General Design Library) — fully
 * rounded, and a different shape from `Tag`'s rounded-rectangle. The two were
 * previously conflated: this component's corner was measured against Figma's
 * `Tag` node by mistake (docs/figma-audit.md, 3 Sep 2026) and shipped as
 * `rounded-sm`. Corrected here to `shape.radius.pill`, Badge's own shape.
 * `Tag` (a separate atom) keeps `rounded-sm` — that was always the right
 * value, just for the wrong component.
 *
 * The four styles and six tones (`../../lib/classification-tones`) are shared
 * with `Tag` — one owned colour mapping, not two. The export's pale fill with
 * near-black text is the `tonal` treatment here; `textual` and `outline`
 * exist alongside it for the rare case a badge needs one of Tag's other
 * styles.
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
    /* shape.radius.pill — Badge's own shape, distinct from Tag's rounded-sm.
       See the note above. ds-lint-ignore */
    'overflow-hidden rounded-pill',
  ],
  {
    variants: {
      size: {
        /* 24 tall — dense tables, inline beside body text. ds-lint-ignore */
        sm: 'h-6 gap-1 px-2 text-label-md',
        /* 28 tall — the default, and what the Figma Badge ships at. ds-lint-ignore */
        md: 'h-7 gap-2 px-2 text-label-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type BadgeVariant = ClassificationVariant;
export type BadgeTone = ClassificationTone;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {
  /** Which of the four Figma-drawn styles to render. */
  variant?: BadgeVariant;
  /** Which of the six generic tones to render. */
  tone?: BadgeTone;
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
  (
    { className, variant = 'tonal', tone = 'neutral', size, icon, trailingIcon, children, ...props },
    ref,
  ) => (
    <span
      ref={ref}
      className={cn(badge({ size }), CLASSIFICATION_STYLE[variant][tone], className)}
      {...props}
    >
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
