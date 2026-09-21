import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { Tag } from '../../atoms/tag';

/**
 * UrgencyTag — how urgent an Added Value is, as a glyph and a word. The owner
 * of VCP's urgency vocabulary and its urgency → glyph/colour mapping: this
 * file is where that mapping lives, and nowhere else.
 *
 * Read off the Figma `Urgency_Tag` set (`3330:314`), audit batch 5,
 * 11 September 2026.
 *
 * **The label is not the colour.** Every urgency writes its word in the same
 * neutral; only the glyph carries the temperature — a double caret down for
 * Low, an equals bar for Normal, a double caret up for High, a flame for
 * Urgent. That is the design's own decision and it is a good one: four
 * coloured words in a table column read as four unrelated statuses, whereas a
 * column of same-weight words with a rising glyph reads as a scale.
 *
 * It follows that **colour is never the only cue**. Each urgency has a
 * distinct glyph shape as well as a distinct hue, so the scale survives
 * greyscale and every kind of colour blindness (WCAG 1.4.1).
 *
 * **A `Tag` (`textual`, `neutral`), not a hand-rolled shell.** The label stays
 * neutral for every urgency — only the glyph carries the scale, set directly
 * on the `Icon` rather than through `Tag`'s own `tone`, since `tone` would
 * colour the label too. This is why the piece lives in `src/components/`, not
 * `src/atoms/`: it composes `Tag`, so the atom-composition rule moves it down
 * a tier — the vocabulary it carries doesn't change that, only the import
 * does (see CLAUDE.md).
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export type AVUrgency = 'Low' | 'Normal' | 'High' | 'Urgent';

/** Every urgency, least to most. For pickers, filters, legends and tests. */
export const AV_URGENCIES: readonly AVUrgency[] = ['Low', 'Normal', 'High', 'Urgent'];

/* THE mapping — every row measured off the Figma `Urgency_Tag` set, Textual
   style. If you are writing `icon={urgency === 'Urgent' ? …}` at a call site,
   the line you want is already here.

   Figma paints the flame with `accent.critical.filled.surface.default`, a
   background token used as a foreground. `accent.critical.outline.content.default`
   is the same value in the right family, so that is what is used here — the
   pixels are identical. Raised with design, 11 September 2026. */
const URGENCY: Record<AVUrgency, { icon: IconName; className: string }> = {
  Low: { icon: 'caret-double-down', className: 'text-accent-success-outline-content-default' },
  Normal: { icon: 'equals', className: 'text-neutral-outline-content-default' },
  High: { icon: 'caret-double-up', className: 'text-accent-warning-outline-content-default' },
  Urgent: { icon: 'fire', className: 'text-accent-critical-outline-content-default' },
};

export interface UrgencyTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  urgency: AVUrgency;
}

export const UrgencyTag = React.forwardRef<HTMLSpanElement, UrgencyTagProps>(
  ({ className, urgency, ...props }, ref) => {
    const { icon, className: tone } = URGENCY[urgency];
    return (
      <Tag
        ref={ref}
        variant="textual"
        tone="neutral"
        /* Decorative: the word beside it already says which urgency this is,
           so naming the glyph too would make every cell announce twice. */
        icon={<Icon name={icon} size="lg" className={cn('shrink-0', tone)} />}
        className={className}
        {...props}
      >
        {urgency}
      </Tag>
    );
  },
);
UrgencyTag.displayName = 'UrgencyTag';
