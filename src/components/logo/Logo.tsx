import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import {
  LOGO_FULL_PATHS,
  LOGO_FULL_VIEWBOX,
  LOGO_MARK_PATHS,
  LOGO_MARK_VIEWBOX,
} from './logo-paths';

/**
 * Logo — the Value Chain Plus mark: the full lockup, or the diamond alone for
 * the collapsed rail (`collapsed`). Inline SVG straight from the Figma
 * "VCP logo" component set, not an image file — which is what un-blocked this
 * component: the export pointed at `/assets/…` files nobody ever had.
 *
 * **Two tokens replace the export's dark hack.** It inverted a PNG with a CSS
 * filter; here the wordmark rides `text.logo` (brand navy → white in dark,
 * exactly the Figma dark variant) and the diamond rides `text.logo-accent`
 * (the brand blue, deliberately identical in both themes). New tokens — they
 * need pushing into the Figma variables with the rest of the debt.
 *
 * Sizes map the Figma variants (Small/Medium/Big ≈ 17/29/44 tall) onto the
 * spacing scale as 16/28/44; width follows the aspect ratio.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
const logo = cva('block w-auto', {
  variants: {
    /* The Figma Small / Medium / Big variants, on the spacing scale. */
    size: {
      sm: 'h-4',
      md: 'h-7',
      lg: 'h-11',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface LogoProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'dangerouslySetInnerHTML'>,
    VariantProps<typeof logo> {
  /** The diamond alone — for the collapsed navigation rail. */
  collapsed?: boolean;
  /**
   * Mark as pure decoration (`aria-hidden`). Use when a wrapping link already
   * carries the name — a home link should say "Value Chain Plus — home"
   * itself, not stack two announcements.
   */
  decorative?: boolean;
}

export const Logo = React.forwardRef<SVGSVGElement, LogoProps>(
  ({ className, size, collapsed, decorative, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox={collapsed ? LOGO_MARK_VIEWBOX : LOGO_FULL_VIEWBOX}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Value Chain Plus'}
      aria-hidden={decorative || undefined}
      className={cn(logo({ size }), className)}
      dangerouslySetInnerHTML={{
        __html: collapsed ? LOGO_MARK_PATHS : LOGO_FULL_PATHS,
      }}
      {...props}
    />
  ),
);
Logo.displayName = 'Logo';
