import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { Icon } from '../icon';
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
 * the way `StatusTag`/`DueDateTag` compose it, never a new
 * hand-rolled shell.
 *
 * Tag is not a control by default: it takes no focus and fires no events, same
 * as `Badge`. The one exception is **`onRemove`**, which adds a ✕ button at the
 * end — a value picked into a field (`SearchSelect`'s selections, an AV's tags in
 * edit mode). The button is the only focusable part, a sibling of the label,
 * and the tag itself still never takes a click. A tag that should toggle or
 * open something is a `Chip`.
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
        /* 20 tall, 10 type — the smallest, for very dense lists and counts. */
        xs: 'h-5 gap-1 px-1.5 text-caption-sm-medium',
        /* 24 tall, 12 type — dense tables, inline beside body text. */
        sm: 'h-6 gap-1 px-1.5 text-caption-md-medium',
        /* 28 tall, 14 type — the default, and what TypeTag/UrgencyTag already ship at. */
        md: 'h-7 gap-1.5 px-2 text-label-sm-medium',
        /* 32 tall, 16 type — the largest, for a tag that is the focus of its row. */
        lg: 'h-8 gap-1.5 px-2 text-label-md-medium',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/* The ✕'s hover and pressed look, per style and tone. Each takes the hover and pressed
   tokens of the tag's own colours, which only ever move away from the background (darker
   on light, lighter on dark), so the ✕ never reads worse than at rest. A neutral tag that
   is not filled uses `neutral.textual.content`; a filled tag cannot darken its pale ✕, so
   it shows its tone's hover fill behind it instead. */
const NEUTRAL_REMOVE =
  'text-neutral-textual-content-default hover:text-neutral-textual-content-hover active:text-neutral-textual-content-pressed';
const BRAND_REMOVE = 'hover:text-text-brand-stronger active:text-text-brand-stronger';
const REMOVE_STATES: Record<ClassificationVariant, Record<ClassificationTone, string>> = {
  textual: {
    neutral: NEUTRAL_REMOVE,
    brand: BRAND_REMOVE,
    info: 'hover:text-accent-info-outline-content-hover active:text-accent-info-outline-content-pressed',
    success: 'hover:text-accent-success-outline-content-hover active:text-accent-success-outline-content-pressed',
    warning: 'hover:text-accent-warning-outline-content-hover active:text-accent-warning-outline-content-pressed',
    critical: 'hover:text-accent-critical-outline-content-hover active:text-accent-critical-outline-content-pressed',
  },
  outline: {
    neutral: NEUTRAL_REMOVE,
    brand: BRAND_REMOVE,
    info: 'hover:text-accent-info-outline-content-hover active:text-accent-info-outline-content-pressed',
    success: 'hover:text-accent-success-outline-content-hover active:text-accent-success-outline-content-pressed',
    warning: 'hover:text-accent-warning-outline-content-hover active:text-accent-warning-outline-content-pressed',
    critical: 'hover:text-accent-critical-outline-content-hover active:text-accent-critical-outline-content-pressed',
  },
  tonal: {
    neutral: NEUTRAL_REMOVE,
    brand: BRAND_REMOVE,
    info: 'hover:text-accent-info-tonal-content-hover active:text-accent-info-tonal-content-pressed',
    success: 'hover:text-accent-success-tonal-content-hover active:text-accent-success-tonal-content-pressed',
    warning: 'hover:text-accent-warning-tonal-content-hover active:text-accent-warning-tonal-content-pressed',
    critical: 'hover:text-accent-critical-tonal-content-hover active:text-accent-critical-tonal-content-pressed',
  },
  filled: {
    neutral: 'hover:bg-surface-neutral-strong active:bg-surface-neutral-strong',
    /* Pressed keeps the hover fill: in dark, `action.primary.surface.pressed` behind the
       dark ✕ is 2.23:1. */
    brand: 'hover:bg-action-primary-surface-hover active:bg-action-primary-surface-hover',
    info: 'hover:bg-accent-info-filled-surface-hover active:bg-accent-info-filled-surface-pressed',
    success: 'hover:bg-accent-success-filled-surface-hover active:bg-accent-success-filled-surface-pressed',
    warning: 'hover:bg-accent-warning-filled-surface-hover active:bg-accent-warning-filled-surface-pressed',
    critical: 'hover:bg-accent-critical-filled-surface-hover active:bg-accent-critical-filled-surface-pressed',
  },
};

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
   * Decorative glyph before the label. Pass an `Icon` at the size the design
   * draws for the tag: 12 on `xs`, 16 (`sm`) on `sm`, 20 (`md`) on `md`, 24
   * (`lg`) on `lg`. Rendered `aria-hidden` — the text is what carries the
   * meaning.
   */
  icon?: React.ReactNode;
  /** Decorative glyph after the label. Same rules as `icon`. */
  trailingIcon?: React.ReactNode;
  /**
   * Renders a ✕ button after the label and calls this when it is pressed. The
   * button is the only interactive part of the tag. The ✕ leaves with the tag,
   * so move focus yourself afterwards: to the next tag's ✕, or the field.
   */
  onRemove?: () => void;
  /**
   * Accessible name for the ✕. Defaults to `Remove ${children}` when the
   * label is a plain string; **required in practice** when it is not.
   */
  removeLabel?: string;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      className,
      variant = 'tonal',
      tone = 'neutral',
      size,
      icon,
      trailingIcon,
      onRemove,
      removeLabel,
      children,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      className={cn(
        tag({ size }),
        CLASSIFICATION_STYLE[variant][tone],
        /* The ✕ sits closer to the edge than a label would. */
        onRemove && 'pr-1',
        className,
      )}
      {...props}
    >
      {icon && <Adornment>{icon}</Adornment>}
      {children != null && children !== false && (
        <span className="min-w-0 truncate">{children}</span>
      )}
      {trailingIcon && <Adornment>{trailingIcon}</Adornment>}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')}
          onClick={onRemove}
          className={cn(
            'grid size-5 shrink-0 place-items-center rounded-full transition-colors motion-reduce:transition-none',
            /* Cancels the tag's own gap, so the ✕ sits against the label; a
               leading icon keeps its gap. The button's own room around the
               glyph is all that is left between them. */
            size === 'xs' || size === 'sm' ? '-ml-1' : '-ml-1.5',
            /* A neutral tag that is not filled gives the ✕ `neutral.textual.content`;
               any other keeps the tag's own ink, since a grey ✕ would clash with it.
               Hover and pressed: see `REMOVE_STATES`. */
            REMOVE_STATES[variant][tone],
            /* Drawn inside the button: the tag clips its overflow. */
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
          )}
        >
          <Icon name="x" className="size-3.5" />
        </button>
      )}
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
