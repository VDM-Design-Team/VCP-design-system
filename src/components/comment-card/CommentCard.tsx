import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { MentionTag, type MentionSegment } from '../mention-input';

/**
 * CommentCard — a posted comment or reply: the author's avatar and the words in a
 * bordered card, with the actions (Edit, Delete) under it.
 *
 * Read off Figma's `_Notification_Popover_Comment_Reply_Item` (`State=Replied`) and the
 * comment section's `Comment_Reply`: a 24 avatar, then a `surface.elevated` card with a
 * `stroke.default` border and `radius.md`, 12 / 8 padding, `body-sm-regular`, and the
 * controls 8 below. The words are `MentionSegment`s, so a mention reads as the same tag
 * the field drew while it was written.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CommentCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Who wrote it. The avatar is decoration; say the name in the surrounding text. */
  author: { name: string; src?: string };
  /** The comment, as the segments a `MentionInput` produces. */
  value: readonly MentionSegment[];
  /** Under the card: `CommentControl`s such as Edit and Delete. */
  actions?: React.ReactNode;
}

/** The words of a comment, with each mention as a tag and newlines kept. */
export function CommentText({ value }: { value: readonly MentionSegment[] }) {
  return (
    <>
      {value.map((segment, i) =>
        segment.type === 'mention' ? (
          <MentionTag key={i} id={segment.id} label={segment.label} />
        ) : (
          <React.Fragment key={i}>{segment.text}</React.Fragment>
        ),
      )}
    </>
  );
}

export const CommentCard = React.forwardRef<HTMLDivElement, CommentCardProps>(function CommentCard(
  { className, author, value, actions, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn('flex items-start gap-2 font-sans', className)} {...props}>
      <Avatar name={author.name} src={author.src} size="sm" className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="whitespace-pre-wrap break-words rounded-md border border-stroke-default bg-surface-elevated px-3 py-2 text-body-sm-regular text-text-primary">
          <CommentText value={value} />
        </p>
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>
    </div>
  );
});
CommentCard.displayName = 'CommentCard';
