import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { CommentActions } from '../comment-actions';
import { CommentComposer } from '../comment-composer';
import { MentionTag, type MentionMember, type MentionSegment } from '../mention-input';

/**
 * CommentReply — one posted comment: who wrote it and when, what it says, the
 * row of things you can do to it, and, when you are writing back or editing it,
 * the box for that.
 *
 * Read off the Figma `Comment_Reply` (`2886:6586`, Comment Component section): a
 * row of the 32 initials avatar (with the thread line beneath it) and a column
 * of the author's name in 14 medium and the time in 14 regular `text.tertiary`,
 * the comment, the actions and, under them, the reply box. Rows 8 apart, the
 * avatar and the text 16 apart, 8 of padding above and below.
 *
 * **It is made of the system's own pieces.** The actions are `CommentActions`, the
 * box is `CommentComposer` (without its avatar), and the avatar is `Avatar`. This piece adds
 * the layout and the two modes: **replying** (the box opens under the actions, Reply and
 * Cancel) and **editing** (the box takes the comment's place, filled with it, Save and
 * Cancel). Both open focused, and both are controlled by you (`replying`, `editing`),
 * because the same state decides what `CommentActions` says ("Reply" or "Cancel Reply").
 * Most apps will not wire this up by hand: `CommentSection` does it for a whole list.
 *
 * **The comment is segments.** `body` is what `MentionInput` writes (`CommentComposer`'s
 * `onSubmit` hands it over): text and mentions. Mentions draw as `MentionTag`, the
 * tag the box drew while it was written, so a mention reads the same either side
 * of posting. Line breaks are kept.
 *
 * **The thread line is `thread`.** `line` runs it down from the avatar to the foot of
 * the row, for a comment whose replies show below. It is the replies that call for a
 * line: a reply being *written* draws none (there is no reply yet for it to lead to),
 * and a comment being *edited* keeps its line, with the box in the row it still runs the
 * whole height and meets the replies below. `CommentReplyThread` sets this for you.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type CommentThreadLine = 'none' | 'line';

export interface CommentReplyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'onSubmit'> {
  /** Who wrote it. Drives the avatar's initials, or a photo with `src`. */
  author: { name: string; src?: string };
  /** When, as it should read: "an hour ago". */
  time: string;
  /** The exact time, for the `<time>` element and for assistive tech. */
  dateTime?: string;
  /** What it says: the segments `MentionInput` writes. */
  body: readonly MentionSegment[];
  /** Who can be mentioned in the reply and edit boxes. */
  members: readonly MentionMember[];

  /** How many replies the comment has. Shows "Show / Hide N Replies" when above 0. */
  replyCount?: number;
  repliesOpen?: boolean;
  onToggleReplies?: () => void;
  /** The id of the replies list, for the toggle's `aria-controls`. */
  repliesId?: string;
  /** Edit the comment. Pass only for the author. */
  onEdit?: () => void;
  /** Delete the comment. Pass only for the author. */
  onDelete?: () => void;
  /** What Copy Link copies. */
  link?: string;
  onCopyLink?: (link: string) => void;
  /** The reaction buttons and counts — an `EmojiReactionPicker`. */
  reactions?: React.ReactNode;

  /** The reply box is open. */
  replying?: boolean;
  onReply?: () => void;
  onCancelReply?: () => void;
  /** Sends the reply, with its segments. May return a promise: the box waits, and keeps the text if it rejects. The box is yours to close (`replying`). */
  onSubmitReply?: (value: MentionSegment[]) => void | Promise<void>;
  replyLoading?: boolean;

  /** The comment is being edited: its place is taken by the box, filled with it. */
  editing?: boolean;
  /** Saves the edit, with the new segments. May return a promise, as `onSubmitReply`. The box is yours to close (`editing`). */
  onSubmitEdit?: (value: MentionSegment[]) => void | Promise<void>;
  onCancelEdit?: () => void;
  editLoading?: boolean;

  /** The thread line under the avatar. Default `none`. */
  thread?: CommentThreadLine;
}

/* The avatar of the design's `Profile_Initials`: the neutral avatar with the everyday border and the
   tertiary text. The same as `CommentComposer`'s. */
const AVATAR = 'border border-stroke-default text-text-tertiary';

export const CommentReply = React.forwardRef<HTMLElement, CommentReplyProps>(
  (
    {
      className,
      author,
      time,
      dateTime,
      body,
      members,
      replyCount,
      repliesOpen,
      onToggleReplies,
      repliesId,
      onEdit,
      onDelete,
      link,
      onCopyLink,
      reactions,
      replying = false,
      onReply,
      onCancelReply,
      onSubmitReply,
      replyLoading,
      editing = false,
      onSubmitEdit,
      onCancelEdit,
      editLoading,
      thread = 'none',
      ...props
    },
    ref,
  ) => (
    <article ref={ref} className={cn('flex flex-col gap-2 py-2 font-sans', className)} {...props}>
      <div className="flex items-start gap-4">
        {/* The rail: the avatar, and under it the thread line. Stretches the row's height (the box, when
            there is one, is part of it), and reaches 8 past it so the line meets the replies below,
            whatever is between. The line is placed at 16, the middle of the avatar, so it lands on the
            same pixel as the replies' corners (`CommentReplyThread`). */}
        <div className={cn('relative w-8 shrink-0 self-stretch', thread !== 'none' && '-mb-2')}>
          <Avatar size="md" name={author.name} src={author.src} className={AVATAR} />
          {thread !== 'none' && (
            <span aria-hidden="true" className="absolute top-9 bottom-0 left-4 w-px bg-stroke-default" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-label-sm-medium text-text-primary">{author.name}</span>
              <time dateTime={dateTime} className="text-body-sm-regular text-text-tertiary">
                {time}
              </time>
            </div>
            {editing ? (
              <CommentComposer
                members={members}
                inputLabel="Edit comment"
                variant="save"
                defaultValue={body}
                loading={editLoading}
                onSubmit={onSubmitEdit}
                onCancel={onCancelEdit ?? (() => {})}
                autoFocus
              />
            ) : (
              <p className="m-0 text-body-sm-regular break-words whitespace-pre-wrap text-text-primary">
                {body.map((segment, i) =>
                  segment.type === 'mention' ? (
                    <MentionTag key={i} id={segment.id} label={segment.label} />
                  ) : (
                    <React.Fragment key={i}>{segment.text}</React.Fragment>
                  ),
                )}
              </p>
            )}
          </div>
          {!editing && (
            <CommentActions
              replyCount={replyCount}
              repliesOpen={repliesOpen}
              onToggleReplies={onToggleReplies}
              repliesId={repliesId}
              onEdit={onEdit}
              onDelete={onDelete}
              replying={replying}
              onReply={onReply}
              onCancelReply={onCancelReply}
              link={link}
              onCopyLink={onCopyLink}
              reactions={reactions}
            />
          )}
          {replying && !editing && (
            <CommentComposer
              members={members}
              inputLabel={`Reply to ${author.name}`}
              variant="reply"
              loading={replyLoading}
              onSubmit={onSubmitReply}
              onCancel={onCancelReply ?? (() => {})}
              autoFocus
            />
          )}
        </div>
      </div>
    </article>
  ),
);
CommentReply.displayName = 'CommentReply';
