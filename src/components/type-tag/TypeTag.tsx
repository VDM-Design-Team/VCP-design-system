import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';
import { Tag, type TagProps } from '../../atoms/tag';
import { Tooltip } from '../../atoms/tooltip';

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
 * **The vocabulary is closed, unlike `StatusTag`'s.** Statuses have a
 * per-domain middle that this repo does not own; types do not — the design
 * draws exactly three and the numbering is the meaning. If a fourth is ever
 * defined it gets a row here, which is a deliberate compile error at every
 * call site rather than a silent fall-through.
 *
 * **A `Tag` (`textual`, `neutral`), not a hand-rolled shell.** The label stays
 * neutral for every type — only the glyph carries the scale, set directly on
 * the `Icon` rather than through `Tag`'s own `tone`, since `tone` would colour
 * the label too. This is why the piece lives in `src/components/`, not
 * `src/atoms/`: it composes `Tag`, so the atom-composition rule moves it down
 * a tier — the vocabulary it carries doesn't change that, only the import
 * does (see CLAUDE.md).
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

/** How the tag is drawn: the glyph and word alone (the default), on a pale fill, on a white fill with a light edge, or in a bordered pill in the type's hue. The Figma Type_Tag set's four styles. */
export type TypeTagVariant = 'textual' | 'tonal' | 'faint' | 'outline';

/* The hue each type wears when the tag has a fill or a border, the glyph's own family. */
const TYPE_TONE: Record<AVType, NonNullable<TagProps['tone']>> = {
  'Type 1': 'critical',
  'Type 2': 'warning',
  'Type 3': 'info',
};

/* The glyph follows the tag's size, as the tag docs' table sets it: 20 in the 28 (the default), 16 in the 24, 24 in the 32. */
const GLYPH_SIZE = { xs: 'sm', sm: 'sm', md: 'md', lg: 'lg' } as const;

/* The ⓘ is one step below the glyph, and never below 16: 16 in the 28 default (beside its 20 glyph), 20 in the 32, 16 in the smaller two. A deliberate exception to Figma's 20: ⓘ is 16 everywhere else, and at 20 it took a lot of the tag. See docs/type-tag.md. */
const INFO_SIZE = { xs: 'sm', sm: 'sm', md: 'sm', lg: 'md' } as const;

/** What each type means — the one place this copy lives (Figma's tag tooltips and the column's ⓘ). */
export const AV_TYPE_MEANING: Record<AVType, string> = {
  'Type 1': 'Direct KPI impact with clear ROI',
  'Type 2': 'Indirect impact, enablement/optimization',
  'Type 3': 'Non-critical, no meaningful KPI impact',
};

/**
 * The Type column's header tooltip: the three meanings, one a line, the type in bold. Pass it as a
 * `ColumnHint`'s `text`.
 */
export const TYPE_COLUMN_HINT = (
  <>
    {AV_TYPES.map((t) => (
      <span key={t} className="block">
        <strong className="text-caption-md-semibold">{t}:</strong> {AV_TYPE_MEANING[t]}
      </span>
    ))}
  </>
);

export interface TypeTagProps extends Omit<TagProps, 'tone' | 'variant' | 'icon' | 'trailingIcon' | 'children'> {
  type: AVType;
  /** `textual` (default), `tonal` (a pale fill), `faint` (a white fill with a light grey edge: Figma's "Faint Fill", as the Detail card draws it) or `outline` (a bordered pill in the type's hue). */
  variant?: TypeTagVariant;
  /** The ⓘ after the word, which the design draws on the filled and bordered looks. Decorative: it marks that the type has an explanation, which the page provides. One step below the tag's glyph (16 in the default, 20 in the largest), never below 16: an exception to Figma's 20 (docs/type-tag.md). */
  info?: boolean;
  /**
   * Say what the type means on hover ("Type 3: Non-critical, no meaningful KPI impact"), as the
   * design's tag does. On by default. The tag is not focusable, so this is a pointer nicety: the same
   * three meanings are on the Type column's header ⓘ (`TYPE_COLUMN_HINT`), which keyboards reach.
   * Turn it off where the meaning is already on screen.
   */
  tooltip?: boolean;
}

export const TypeTag = React.forwardRef<HTMLSpanElement, TypeTagProps>(
  ({ className, type, variant = 'textual', info, size = 'md', tooltip = true, ...props }, ref) => {
    const glyphSize = GLYPH_SIZE[size ?? 'md'];
    const { icon, className: tone } = TYPE[type];
    const tag = (
      <Tag
        ref={ref}
        size={size}
        variant={variant === 'faint' ? 'outline' : variant}
        tone={variant === 'textual' || variant === 'faint' ? 'neutral' : TYPE_TONE[type]}
        /* Decorative: the word beside it already says which type this is. */
        icon={<Icon name={icon} size={glyphSize} className={cn('shrink-0', tone)} />}
        trailingIcon={info ? <Icon name="info" size={INFO_SIZE[size ?? 'md']} className="shrink-0 text-text-tertiary" /> : undefined}
        /* The label stays neutral on a fill or a border; the glyph carries the colour. */
        className={cn(
          variant !== 'textual' && 'text-text-secondary',
          /* A tag is not a control, so its edge need not hold 3:1: the lighter `stroke.default`,
             as `CycleTag` uses, rather than the neutral outline border (too dark for a label). */
          variant === 'faint' && 'border-stroke-default bg-surface-elevated',
          className,
        )}
        {...props}
      >
        {type}
      </Tag>
    );
    return tooltip ? (
      <Tooltip
        content={
          <>
            <strong className="text-caption-md-semibold">{type}:</strong> {AV_TYPE_MEANING[type]}
          </>
        }
      >
        {tag}
      </Tooltip>
    ) : (
      tag
    );
  },
);
TypeTag.displayName = 'TypeTag';
