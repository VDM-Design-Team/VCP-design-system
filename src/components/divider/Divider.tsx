import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Divider — a hairline rule that separates content.
 *
 * The rule colour is `stroke.default`. A divider is decoration, not a control
 * boundary, so the 3:1 of WCAG 1.4.11 does not apply to it; what does matter is
 * that it stays visible on every surface it is drawn on. `stroke.subtle`
 * (slate.200) all but vanishes on `surface.canvas` (slate.50), so `stroke.default`
 * (slate.300) is the token that holds up on canvas, base and elevated alike —
 * and it is the general-purpose rule token the naming scheme already reserves.
 *
 * Geometry only lives here. The vertical rule takes its length from its parent:
 * `self-stretch` fills a flex row, and `min-h-4` stops it collapsing to nothing
 * anywhere else. See docs/divider.md — a zero-height vertical divider is the
 * bug this component exists to prevent.
 */
const divider = cva('shrink-0 border-0 bg-stroke-default', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px min-h-4 self-stretch',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'style'> {
  orientation?: 'horizontal' | 'vertical';
  /**
   * Centred caption sitting inside the rule. Horizontal only — a vertical rule
   * has no room for it, and `label` is ignored when `orientation="vertical"`.
   *
   * A string, not a `ReactNode`: when the divider is semantic the caption is
   * what names it, and `aria-label` only takes text.
   */
  label?: string;
  /**
   * `true` (the default) renders the rule as decoration: `role="presentation"`,
   * so assistive tech skips it entirely.
   *
   * Set `decorative={false}` when the rule is the *only* thing saying a new
   * section starts — a menu group with no heading, a toolbar's segment break.
   * That renders `role="separator"` (plus `aria-orientation` when vertical),
   * which is announced.
   */
  decorative?: boolean;
}

export const Divider = React.forwardRef<HTMLElement, DividerProps>(
  ({ orientation = 'horizontal', label, decorative = true, className, ...props }, ref) => {
    /* Decorative dividers must not be announced. `<hr>` carries an implicit
       `separator` role, so silencing one takes an explicit `role="presentation"` —
       leaving the element bare is not the same thing. */
    const semantics: React.AriaAttributes & { role: string } = decorative
      ? { role: 'presentation' }
      : {
          role: 'separator',
          /* `separator` defaults to horizontal, so only the vertical case needs
             stating. */
          'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
        };

    /* With a caption the element has real text content, and `<hr>` is a void
       element — it cannot legally hold any. So the labelled form is a flex row:
       two rails with the caption between them. */
    if (label && orientation === 'horizontal') {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn('flex w-full items-center gap-3', className)}
          {...semantics}
          /* `separator` takes its name from the author, never from its contents,
             so a semantic labelled divider names itself with `aria-label` and
             hides the painted text — one announcement, "Or, separator", instead
             of the role and the text arriving separately.
             A decorative one does the opposite: `role="presentation"` is not
             inherited by children, so the caption stays readable as plain text,
             which is what it is. */
          aria-label={decorative ? undefined : label}
          {...props}
        >
          <span aria-hidden="true" className="h-px flex-1 border-0 bg-stroke-default" />
          <span
            aria-hidden={decorative ? undefined : true}
            className="shrink-0 font-sans text-label-sm uppercase text-text-subtle"
          >
            {label}
          </span>
          <span aria-hidden="true" className="h-px flex-1 border-0 bg-stroke-default" />
        </div>
      );
    }

    /* `<hr>` means "thematic break" and is horizontal by definition; a vertical
       rule is a plain box that happens to be one pixel wide. */
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn(divider({ orientation }), className)}
          {...semantics}
          {...props}
        />
      );
    }

    return (
      <hr
        ref={ref as React.Ref<HTMLHRElement>}
        className={cn(divider({ orientation }), className)}
        {...semantics}
        {...props}
      />
    );
  },
);
Divider.displayName = 'Divider';
