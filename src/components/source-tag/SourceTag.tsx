import * as React from 'react';
import { cn } from '../../lib/cn';
import { Tag } from '../../atoms/tag';

/**
 * SourceTag — where an Added Value came from, as a word in a blue tag. A
 * component: it is a `Tag` wearing one fixed look.
 *
 * Read off the Figma `Source_Tag` (`6809:39656`, Tags page): the info tonal
 * fill and text with the info outline border around them, 28 tall, 6 radius,
 * 14 medium — `Tag`'s `md` size exactly. Of `Tag`'s four styles none is a fill
 * *and* a border, so this is the tonal info `Tag` plus the border colour; the
 * shape, size and type are all `Tag`'s own.
 *
 * Sources are data, not vocabulary — they are whatever systems and suppliers
 * the account has — so unlike `StatusTag` or `UrgencyTag` there is no mapping
 * here, and the text is shown as given. (The design's example is written in
 * capitals; that is the source's name, not a style applied by the tag.)
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class.
 */
export interface SourceTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The source's name, as it should read. */
  source: string;
}

export const SourceTag = React.forwardRef<HTMLSpanElement, SourceTagProps>(
  ({ className, source, ...props }, ref) => (
    <Tag
      ref={ref}
      variant="tonal"
      tone="info"
      /* The design's border: the info outline stroke around the tonal fill. */
      className={cn('border border-accent-info-outline-border-default', className)}
      {...props}
    >
      {source}
    </Tag>
  ),
);
SourceTag.displayName = 'SourceTag';
