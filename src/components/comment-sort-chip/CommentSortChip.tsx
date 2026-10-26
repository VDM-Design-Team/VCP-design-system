import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon } from '../../atoms/icon';

/**
 * CommentSortChip — the comments' sort switch: "Newest First" or "Oldest First",
 * with a glyph that points the way. One click flips it to the other.
 *
 * Read off the Figma `_Comment_Filter_chip` (Sort = Newest, Oldest): a tonal
 * neutral rectangle, 32 tall with `radius.sm`, 14 medium in
 * `neutral.tonal.content.default`, with the trailing sort glyph. It is not
 * `Chip`: that one is a fully rounded pill for filters and removable tags, and
 * this is a rectangle that says which way the list runs.
 *
 * It shows the **current** order, as drawn, so its accessible name spells out
 * what it is ("Sort comments: Newest First") while still containing the visible
 * words. The glyph is decoration.
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
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> {
  /** The current order. Controlled; leave it off for an uncontrolled chip. */
  sort?: CommentSort;
  /** The order the uncontrolled chip starts in. Default `newest`. */
  defaultSort?: CommentSort;
  /** Fires with the order the click switches to. */
  onSortChange?: (sort: CommentSort) => void;
}

export const CommentSortChip = React.forwardRef<HTMLButtonElement, CommentSortChipProps>(
  ({ className, sort, defaultSort = 'newest', onSortChange, onClick, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = React.useState<CommentSort>(defaultSort);
    const current = sort ?? uncontrolled;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={`Sort comments: ${LABEL[current]}`}
        className={cn(
          'inline-flex h-8 items-center gap-2 rounded-sm py-1.5 pr-2 pl-4',
          'bg-neutral-tonal-surface-default font-sans text-label-sm-medium text-neutral-tonal-content-default',
          'cursor-pointer whitespace-nowrap transition-colors',
          'hover:bg-neutral-tonal-surface-hover hover:text-neutral-tonal-content-hover',
          'active:bg-neutral-tonal-surface-pressed active:text-neutral-tonal-content-pressed',
          'pointer-coarse:min-h-10',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const next: CommentSort = current === 'newest' ? 'oldest' : 'newest';
          if (sort === undefined) setUncontrolled(next);
          onSortChange?.(next);
        }}
        {...props}
      >
        {LABEL[current]}
        <Icon name={ICON[current]} size="md" aria-hidden="true" className="shrink-0" />
      </button>
    );
  },
);
CommentSortChip.displayName = 'CommentSortChip';
