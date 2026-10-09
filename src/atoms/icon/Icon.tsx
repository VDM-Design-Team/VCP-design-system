import * as React from 'react';
import { cn } from '../../lib/cn';
import { ICON_PATHS, CUSTOM_ICONS } from './icons';

export type IconName = keyof typeof ICON_PATHS;

/** Every glyph this system ships, sorted. Useful for pickers and for tests. */
export const ICON_NAMES = Object.keys(ICON_PATHS).sort() as IconName[];

/** The subset drawn in-house because Phosphor has no equivalent. */
export const CUSTOM_ICON_NAMES = Object.keys(CUSTOM_ICONS).sort() as IconName[];

/**
 * Icon — a Phosphor glyph at `regular` weight.
 *
 * Colour is never set here: the glyph is filled with `currentColor`, so it takes
 * the text colour of whatever it sits in. That is what keeps it themable — set
 * the colour on the parent with a text token and the icon follows into dark.
 *
 * Phosphor glyphs are filled paths, not stroked outlines. Do not add a `stroke`.
 */
/**
 * The sizes the Figma icon library draws every glyph at, in px. Each is a
 * whole box with the glyph scaled inside it, so a 24 icon is a 24 box and the
 * glyph sits centred within it, a little in from the edges — that breathing
 * room is Phosphor's own 256-unit artboard, not extra padding.
 */
export const ICON_SIZES = [10, 12, 16, 20, 24, 28, 32, 40, 48] as const;
export type IconPixelSize = (typeof ICON_SIZES)[number];

/* The sizes on Tailwind's numeric scale (one step is a quarter of a rem). Written out in full so the
   class scanner sees every one. */
const SIZE_CLASS: Record<IconPixelSize, string> = {
  10: 'size-2.5',
  12: 'size-3',
  16: 'size-4',
  20: 'size-5',
  24: 'size-6',
  28: 'size-7',
  32: 'size-8',
  40: 'size-10',
  48: 'size-12',
};

/** The original three names, kept as aliases: 16 in dense cells, 20 inline, 24 for nav. */
const SIZE_ALIAS = { sm: 16, md: 20, lg: 24 } as const;
export type IconSize = IconPixelSize | keyof typeof SIZE_ALIAS;

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'dangerouslySetInnerHTML' | 'size'> {
  name: IconName;
  /**
   * Box size in px — 10, 12, 16, 20, 24, 28, 32, 40 or 48, the sizes Figma
   * draws. `sm` / `md` / `lg` are the old names for 16 / 20 / 24. Defaults to 20.
   */
  size?: IconSize;
  /**
   * Give the glyph an accessible name. Provide this ONLY when the icon is the
   * sole carrier of the meaning — an icon-only button, or a status glyph with no
   * text beside it. When there is a visible label next to the icon, leave this
   * off: the icon is decorative and repeating the label is noise.
   */
  label?: string;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', label, className, ...props }, ref) => {
    const markup = ICON_PATHS[name];
    if (!markup) return null;

    return (
      <svg
        ref={ref}
        viewBox="0 0 256 256"
        fill="currentColor"
        className={cn('inline-block shrink-0', SIZE_CLASS[typeof size === 'number' ? size : SIZE_ALIAS[size]], className)}
        /* Decorative unless named. An unnamed <svg> with no role is skipped by
           assistive tech, which is the right default — most icons sit beside a
           visible label that already says the same thing. */
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        focusable="false"
        {...props}
        /* The glyph data is a build-time constant from this module, never caller
           input, so there is nothing here for a caller to inject. */
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  },
);
Icon.displayName = 'Icon';
