import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Card — a surface that groups related content on the canvas.
 *
 * A Card is a *container*, not a control. It deliberately takes no `role`, no
 * `tabIndex` and no `onClick` of its own: a whole-card click target is invisible
 * to screen readers and unreachable by keyboard. Put a real `<a>` or `<Button>`
 * inside instead.
 *
 * The element is a `<section>` with no accessible name, so it maps to `generic`
 * rather than the `region` landmark — a grid of twelve cards must not put twelve
 * entries in the landmark list. Pass `aria-labelledby` yourself on the rare card
 * that genuinely deserves to be a landmark.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const card = cva([
  'flex flex-col',
  /* Clips a full-bleed body and the footer tint to the radius. */
  'overflow-hidden rounded-md',
  /* Decorative boundary — see the note on `stroke.default` in docs/card.md. */
  'border border-stroke-default',
  'bg-surface-elevated shadow-card',
  /* The card owns its body colour so it reads correctly in dark on its own. */
  'font-sans text-text-secondary',
]);

const cardHeader = cva('flex items-center gap-3 px-4 py-3.5', {
  variants: {
    /* With no title the action is the only child, so it hugs the right edge. */
    hasTitle: { true: 'justify-between', false: 'justify-end' },
  },
  defaultVariants: { hasTitle: true },
});

const cardBody = cva('min-w-0', {
  variants: {
    padded: { true: '', false: '' },
    /* Internal only: the header already supplies the body's top padding. */
    hasHeader: { true: '', false: '' },
  },
  compoundVariants: [
    { padded: true, hasHeader: false, class: 'p-4' },
    { padded: true, hasHeader: true, class: 'px-4 pb-4' },
  ],
  defaultVariants: { padded: true, hasHeader: false },
});

/** Heading levels a Card title may take. `h1` is the page's, never a card's. */
export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface CardProps
  /* Native `title` is a tooltip string — ours is the rendered heading. */
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    /* `padded` comes from the body recipe; `hasHeader` is derived, never a prop. */
    Omit<VariantProps<typeof cardBody>, 'hasHeader'> {
  /** Rendered as a real heading in the card header. Omit for a bare surface. */
  title?: React.ReactNode;
  /**
   * Heading level for `title`. Defaults to `3`, which is right for a card sitting
   * under a page `h1` and a section `h2`. Set it so the card lands in the correct
   * place in the document outline — never to change how big the title looks.
   */
  headingLevel?: CardHeadingLevel;
  /** Right-aligned header slot — usually a Button. Icon-only needs `aria-label`. */
  action?: React.ReactNode;
  /** Bottom band, tinted and divided from the body. Usually actions or metadata. */
  footer?: React.ReactNode;
  /** Body padding. `false` for full-bleed content — tables, images, lists. */
  padded?: boolean;
  /** Merged onto the body wrapper. The escape hatch that replaces `bodyStyle`. */
  bodyClassName?: string;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      className,
      bodyClassName,
      title,
      headingLevel = 3,
      action,
      footer,
      padded = true,
      children,
      ...props
    },
    ref,
  ) => {
    const hasTitle = title !== undefined && title !== null && title !== false;
    const hasHeader = hasTitle || Boolean(action);
    const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    return (
      <section ref={ref} className={cn(card(), className)} {...props}>
        {hasHeader && (
          <header className={cardHeader({ hasTitle })}>
            {hasTitle && (
              <Heading className="min-w-0 text-heading-sm text-text-primary">{title}</Heading>
            )}
            {action}
          </header>
        )}

        <div className={cn(cardBody({ padded, hasHeader }), bodyClassName)}>{children}</div>

        {footer && (
          <footer className="border-t border-stroke-default bg-surface-canvas px-4 py-3">
            {footer}
          </footer>
        )}
      </section>
    );
  },
);
Card.displayName = 'Card';
