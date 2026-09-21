import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import {
  CLASSIFICATION_STYLE,
  type ClassificationTone,
  type ClassificationVariant,
} from '../../lib/classification-tones';

/**
 * Tag — a small, rounded-rectangle label that classifies the thing beside it.
 *
 * Ported from the Figma `Tag` component in the General Design Library — its
 * own shape, distinct from `Badge`'s pill. GDL's Tag primitive and VCP's
 * measured corner don't have to agree in theory; VCP's own value wins, which
 * is `shape.radius.sm` here, not GDL's raw number (see docs/tag.md for the
 * measured value).
 *
 * Four styles, all VCP's own semantics — GDL's Tag doesn't dictate them:
 * `textual` (no fill, no border — what `TypeTag`/`UrgencyTag` render today),
 * `outline` (bordered, transparent fill), `tonal` (pale fill, the default),
 * `filled` (solid fill).
 *
 * This is the shared shell every contextual tag composes — `TypeTag`,
 * `UrgencyTag`, and whatever comes next — each owning its own vocabulary →
 * tone mapping on top. Introducing a new tag family means composing this,
 * the way `StatusPill`/`DueDatePill` already compose `Badge`, never a new
 * hand-rolled shell.
 *
 * Tag is not a control: it takes no focus and fires no events, same as
 * `Badge`. If it needs to be clickable or removable, it is a `Chip`.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const tag = cva(
  [
    'inline-flex max-w-full items-center justify-center align-middle',
    'font-sans whitespace-nowrap',
    /* shape.radius.sm — VCP's own measured Tag corner. See docs/tag.md. */
    'overflow-hidden rounded-sm',
  ],
  {
    variants: {
      size: {
        /* 24 tall — dense tables, inline beside body text. */
        sm: 'h-6 gap-1 px-2 text-label-md',
        /* 28 tall — the default, and what TypeTag/UrgencyTag already ship at. */
        md: 'h-7 gap-2 px-2 text-label-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type TagVariant = ClassificationVariant;
export type TagTone = ClassificationTone;

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tag> {
  /** Which of the four Figma-drawn styles to render. */
  variant?: TagVariant;
  /** Which of the six generic tones to render. */
  tone?: TagTone;
  /**
   * Decorative glyph before the label. Pass an `Icon` at `size="sm"` next to
   * a `sm` tag and `size="md"` next to an `md` one. Rendered `aria-hidden` —
   * the text is what carries the meaning.
   */
  icon?: React.ReactNode;
  /** Decorative glyph after the label. Same rules as `icon`. */
  trailingIcon?: React.ReactNode;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    { className, variant = 'tonal', tone = 'neutral', size, icon, trailingIcon, children, ...props },
    ref,
  ) => (
    <span
      ref={ref}
      className={cn(tag({ size }), CLASSIFICATION_STYLE[variant][tone], className)}
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
Tag.displayName = 'Tag';

/**
 * Icons in a Tag are decoration — the label already says what the tag means,
 * so announcing the glyph as well is a duplicate. Colour is inherited from
 * the tone's content token via `currentColor`, so nothing is set here.
 */
function Adornment({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center">
      {children}
    </span>
  );
}
