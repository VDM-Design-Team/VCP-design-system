import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Skeleton — a content placeholder shown while data loads.
 *
 * It stands in for the *shape* of content that is about to arrive: a block, a
 * circle where an avatar will be, or `n` stacked lines where a paragraph will be.
 * Use it when you know the layout in advance and want to avoid a jump when the
 * data lands. When you don't know the shape, or the wait is short and local (a
 * button saving), use a spinner instead.
 *
 * **It is decorative.** The root is `aria-hidden`, always, and it is never given
 * a role. A screen reader must not hear "image image image" while a list loads.
 * That means the *loading state itself* has to be announced by the caller: wrap
 * the region in `aria-live="polite"` / `aria-busy`, put a visually hidden
 * "Loading …" message inside it, and swap both for the real content when it
 * arrives. See `docs/skeleton.md` — this is the part everyone forgets.
 *
 * **Motion.** The pulse is a genuine vestibular trigger at this size, so it is
 * dropped under `prefers-reduced-motion` and the block falls back to a static
 * fill. The fill alone still reads as a placeholder, so nothing is lost.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */

/**
 * The ramp steps a skeleton line can stand in for.
 *
 * Only the steps whose `lineHeight` is an absolute length are listed. The
 * display and heading steps carry *unitless* line-heights (`1.1`, `1.25`, …),
 * which cannot be referenced as a CSS length, so they cannot drive a row height.
 * They are also not what a multi-line skeleton is for — a heading placeholder is
 * a single block with an explicit `height`.
 */
export type SkeletonTextStyle =
  | 'title-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'label-lg'
  | 'label-md'
  | 'label-sm'
  | 'caption-md'
  | 'caption-sm';

/**
 * A line of real text occupies its full `line-height`; the glyphs inside only
 * occupy the `font-size`, with the leading split above and below. A skeleton
 * line copies that exactly: the row is the ramp's line-height tall, and the bar
 * inside it is the ramp's font-size tall and vertically centred.
 *
 * Both come straight from `type.*` via the variables `dist/theme.css` emits, so
 * three `body-md` lines occupy precisely the height of three lines of body-md
 * text and nothing shifts when the copy arrives. Nothing here is a number.
 */
const ROW_HEIGHT: Record<SkeletonTextStyle, string> = {
  'title-sm': 'h-(--text-title-sm--line-height)',
  'body-lg': 'h-(--text-body-lg--line-height)',
  'body-md': 'h-(--text-body-md--line-height)',
  'body-sm': 'h-(--text-body-sm--line-height)',
  'label-lg': 'h-(--text-label-lg--line-height)',
  'label-md': 'h-(--text-label-md--line-height)',
  'label-sm': 'h-(--text-label-sm--line-height)',
  'caption-md': 'h-(--text-caption-md--line-height)',
  'caption-sm': 'h-(--text-caption-sm--line-height)',
};

/** The bar inside the row — the ramp's font-size, i.e. where the glyphs sit. */
const BAR_HEIGHT: Record<SkeletonTextStyle, string> = {
  'title-sm': 'h-(--text-title-sm)',
  'body-lg': 'h-(--text-body-lg)',
  'body-md': 'h-(--text-body-md)',
  'body-sm': 'h-(--text-body-sm)',
  'label-lg': 'h-(--text-label-lg)',
  'label-md': 'h-(--text-label-md)',
  'label-sm': 'h-(--text-label-sm)',
  'caption-md': 'h-(--text-caption-md)',
  'caption-sm': 'h-(--text-caption-sm)',
};

const skeleton = cva(
  [
    'block',
    /* surface.neutral.medium — the only neutral step that separates from BOTH
       surface.base and surface.canvas in light (1.48:1 / 1.42:1). `subtle` is
       1.05:1 on canvas, i.e. invisible on any page that uses the canvas. */
    'bg-surface-neutral-medium',
    /* Vestibular safety: static fill when the user asks for less motion. */
    'animate-pulse motion-reduce:animate-none',
  ],
  {
    variants: {
      /* shape.radius.* — never a raw corner. `pill` on a square is a circle. */
      radius: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        pill: 'rounded-pill',
      },
    },
    defaultVariants: { radius: 'sm' },
  },
);

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof skeleton> {
  /**
   * Placeholder width. Stays a free `number | string` on purpose: a skeleton's
   * whole job is to match content whose size the token scale does not know —
   * a chart that is 340 wide, a column that is `calc(100% - 3rem)`. Numbers are
   * treated as pixels by React. Defaults to the full width of the parent.
   */
  width?: number | string;
  /**
   * Placeholder height. Free for the same reason as `width`. Leave it off in
   * `lines` mode and for text placeholders — the height then comes from the
   * type ramp via `textStyle`, which is what keeps the layout from shifting.
   */
  height?: number | string;
  /** Squares the block with `width` and rounds it fully — avatar placeholders. */
  circle?: boolean;
  /** Render N stacked lines, the last one short, like the end of a paragraph. */
  lines?: number;
  /**
   * Which step of the type ramp the lines stand in for. Drives both the row
   * height (`line-height`) and the bar height (`font-size`). Ignored when an
   * explicit `height` is given.
   */
  textStyle?: SkeletonTextStyle;
}

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  (
    { className, style, width, height, radius, circle, lines, textStyle = 'body-md', ...props },
    ref,
  ) => {
    /* A circle is a square with a pill radius — the caller never sets both. */
    const shape = circle ? 'pill' : radius;

    if (lines != null && lines > 0) {
      return (
        <span
          ref={ref}
          aria-hidden="true"
          className={cn('block', width === undefined && 'w-full', className)}
          style={{ width, ...style }}
          {...props}
        >
          {Array.from({ length: lines }, (_, i) => (
            /* The row IS the line box: no gap utility, because the ramp's
               leading already provides the space between lines. */
            <span key={i} className={cn('flex items-center', ROW_HEIGHT[textStyle])}>
              <span
                className={cn(
                  skeleton({ radius: shape }),
                  height === undefined && BAR_HEIGHT[textStyle],
                  /* Last line short, the way a paragraph actually ends. */
                  i === lines - 1 ? 'w-3/5' : 'w-full',
                )}
                style={{ height }}
              />
            </span>
          ))}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          skeleton({ radius: shape }),
          /* An avatar-sized default so `circle` alone is never zero-sized. */
          circle && width === undefined && 'size-10',
          !circle && width === undefined && 'w-full',
          !circle && height === undefined && BAR_HEIGHT[textStyle],
          className,
        )}
        style={{ width, height: circle ? width : height, ...style }}
        {...props}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';
