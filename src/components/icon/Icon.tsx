import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { ICON_PATHS } from './icons';

export type IconName = keyof typeof ICON_PATHS;

/** Every glyph this system ships, sorted. Useful for pickers and for tests. */
export const ICON_NAMES = Object.keys(ICON_PATHS).sort() as IconName[];

/**
 * Icon — a Heroicons v2 outline glyph.
 *
 * Colour is never set here: the glyph is stroked with `currentColor`, so it
 * takes the text colour of whatever it sits in. That is what keeps it themable —
 * set the colour on the parent with a text token (`text-text-tertiary`) and the
 * icon follows in both light and dark.
 */
const icon = cva('inline-block shrink-0', {
  variants: {
    /* Box sizes from the export: 24 for nav, 20 inline, 16 in dense cells. */
    size: {
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-6',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'ref'>,
    VariantProps<typeof icon> {
  name: IconName;
  /**
   * Give the glyph an accessible name. Provide this ONLY when the icon is the
   * sole carrier of the meaning — an icon-only button, or a status glyph with no
   * text beside it. When there is a visible label next to the icon, leave this
   * off: the icon is decorative and repeating the label is noise.
   */
  label?: string;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size, label, className, ...props }, ref) => {
    const d = ICON_PATHS[name];
    if (!d) return null;

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(icon({ size }), className)}
        /* Decorative unless named. An unnamed <svg> with no role is skipped by
           assistive tech, which is the right default — most icons sit beside a
           visible label that already says the same thing. */
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        focusable="false"
        {...props}
      >
        <path d={d} />
      </svg>
    );
  },
);
Icon.displayName = 'Icon';
