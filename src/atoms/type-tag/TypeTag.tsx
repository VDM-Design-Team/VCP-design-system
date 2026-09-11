import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../icon';

/**
 * TypeTag — an Added Value's type, as a glyph and a word. The owner of VCP's
 * type vocabulary and its type → glyph/colour mapping: this file is where that
 * mapping lives, and nowhere else.
 *
 * Read off the Figma `Type_Tag` set (`3491:6845`), audit batch 5,
 * 11 September 2026.
 *
 * **Type is a scale, and the glyph is the scale.** Type 1 is the heaviest and
 * wears a triple caret in critical red; Type 2 a double caret in warning
 * amber; Type 3 a single caret in brand blue. Same shape family, one more
 * stroke each step — so the column reads as a ranking rather than three
 * unrelated labels, and it still reads that way in greyscale (WCAG 1.4.1).
 *
 * **The vocabulary is closed, unlike `StatusPill`'s.** Statuses have a
 * per-domain middle that this repo does not own; types do not — the design
 * draws exactly three and the numbering is the meaning. If a fourth is ever
 * defined it gets a row here, which is a deliberate compile error at every
 * call site rather than a silent fall-through.
 *
 * **Four styles exist in Figma; this renders the textual one** — no fill, no
 * border. It is the style the AV table uses. Tonal, faint-fill and outline are
 * drawn but assembled nowhere; when a screen needs one, add a `variant` here
 * rather than a second component.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type AVType = 'Type 1' | 'Type 2' | 'Type 3';

/** Every type, heaviest first — the order the design ranks them in. */
export const AV_TYPES: readonly AVType[] = ['Type 1', 'Type 2', 'Type 3'];

/* THE mapping — every row measured off the Figma `Type_Tag` set, Textual style.

   Figma paints the Type 3 caret with `action.secondary.border.default`, a
   control token used as a decorative foreground. `text.brand.medium` is the
   same value (the brand navy) in the right family, so that is what is used
   here — the pixels are identical. Raised with design, 11 September 2026. */
const TYPE: Record<AVType, { icon: IconName; className: string }> = {
  'Type 1': { icon: 'caret-triple-up', className: 'text-accent-critical-outline-content-default' },
  'Type 2': { icon: 'caret-double-up', className: 'text-accent-warning-outline-content-default' },
  'Type 3': { icon: 'caret-up', className: 'text-text-brand-medium' },
};

export interface TypeTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: AVType;
}

export const TypeTag = React.forwardRef<HTMLSpanElement, TypeTagProps>(
  ({ className, type, ...props }, ref) => {
    const { icon, className: tone } = TYPE[type];
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex h-7 items-center gap-2 px-2 font-sans text-label-lg whitespace-nowrap',
          'text-neutral-outline-content-default',
          className,
        )}
        {...props}
      >
        {/* Decorative: the word beside it already says which type this is. */}
        <Icon name={icon} size="lg" className={cn('shrink-0', tone)} />
        {type}
      </span>
    );
  },
);
TypeTag.displayName = 'TypeTag';
