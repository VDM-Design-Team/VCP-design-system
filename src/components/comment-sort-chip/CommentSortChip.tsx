import * as React from 'react';
import { Chip, type ChipProps } from '../chip';
import { Icon } from '../../atoms/icon';

/**
 * CommentSortChip — the comments' sort switch: "Newest First" or "Oldest First",
 * with a glyph that points the way. One click flips it to the other.
 *
 * Read off the Figma `_Comment_Filter_chip` (Sort = Newest, Oldest) and **built on
 * `Chip`**, so it looks like every other chip: the rounded pill, the tonal fill and its
 * hover step. The frame draws a squarer neutral rectangle; that is an older look and the
 * chip family's is the one used. The words are fixed ("Newest First", "Oldest First"), not
 * props: the only choice is which order it is in.
 *
 * It shows the **current** order, as drawn, so its accessible name spells out what it is
 * ("Sort comments: Newest First") while still containing the visible words. The glyph is
 * decoration.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type CommentSort = 'newest' | 'oldest';

const LABEL: Record<CommentSort, string> = { newest: 'Newest First', oldest: 'Oldest First' };

/* Phosphor names the glyphs by the order of the bars, and `sort-descending` is the one
   whose arrow points up — which is what the design draws for Newest First. */
const ICON = { newest: 'sort-descending', oldest: 'sort-ascending' } as const;

export interface CommentSortChipProps
  extends Omit<ChipProps, 'label' | 'description' | 'avatar' | 'count' | 'variant' | 'onRemove' | 'onEdit' | 'actions' | 'onClick' | 'selected' | 'removeLabel' | 'editLabel' | 'children'> {
  /** The current order. Controlled; leave it off for an uncontrolled chip. */
  sort?: CommentSort;
  /** The order the uncontrolled chip starts in. Default `newest`. */
  defaultSort?: CommentSort;
  /** Fires with the order the click switches to. */
  onSortChange?: (sort: CommentSort) => void;
}

export const CommentSortChip = React.forwardRef<HTMLElement, CommentSortChipProps>(
  ({ className, sort, defaultSort = 'newest', onSortChange, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = React.useState<CommentSort>(defaultSort);
    const current = sort ?? uncontrolled;
    return (
      <Chip
        ref={ref}
        aria-label={`Sort comments: ${LABEL[current]}`}
        className={className ? `pointer-coarse:min-h-10 ${className}` : 'pointer-coarse:min-h-10'}
        label={
          <span className="inline-flex items-center gap-2">
            {LABEL[current]}
            <Icon name={ICON[current]} size="sm" aria-hidden="true" className="shrink-0" />
          </span>
        }
        onClick={() => {
          const next: CommentSort = current === 'newest' ? 'oldest' : 'newest';
          if (sort === undefined) setUncontrolled(next);
          onSortChange?.(next);
        }}
        {...props}
      />
    );
  },
);
CommentSortChip.displayName = 'CommentSortChip';
