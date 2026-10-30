import * as React from 'react';
import { cn } from '../../lib/cn';
import { CommentComposer } from '../../components/comment-composer';
import { CommentReplyThread } from '../../components/comment-reply-thread';
import { CommentSortChip, type CommentSort } from '../../components/comment-sort-chip';
import { EmojiReactionPicker, type EmojiReaction } from '../../components/emoji-reaction-picker';
import type { MentionMember, MentionSegment } from '../../atoms/mention-input';

/**
 * CommentSection — a whole comment list, the way an Added Value page has one: the
 * "Comments" title with the sort switch, the box to write a new comment, and under it
 * every comment with its replies, each with the things you can do to it.
 *
 * **This is the piece to reach for.** `CommentComposer`, `CommentReply`,
 * `CommentReplyThread`, `CommentActions` and the rest are its building blocks, and
 * they are all exported, but putting them together by hand means keeping track of
 * which replies are open, which comment is being replied to and which is being edited,
 * and getting the thread lines and the author-only buttons right. This does all of that.
 * You give it **the comments as data** and **what to do when someone adds, replies,
 * edits, deletes or reacts**; it draws the thread and holds the rest.
 *
 * **What it holds for you** (the screen state, never your data):
 * which threads are open, which comment has a reply box open, which is being edited,
 * and (unless you control it) the sort order. At most one reply or edit box is open at
 * a time, and a reply, once sent, opens its thread so it is seen.
 *
 * **What it works out for you:** Edit and Delete appear only on the current user's own
 * comments (`author.id === currentUser.id`); a thread's reply count and toggle follow
 * its replies; the thread line follows the replies; and top-level comments sort by
 * `createdAt` when it is given, and replies read oldest first, as a conversation does (by
 * `createdAt` when every reply has it, otherwise in the order you give them).
 *
 * **What stays yours:** the data, the sorting of anything you page in from a server,
 * and confirming a delete (`onDelete` just says "delete this"; ask first if you need to).
 * Every handler may be async: the box waits, shows its spinner, and **keeps what was
 * typed if the promise rejects**, so report the failure in your own handler.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CommentData {
  /** Stable and unique across the whole list, replies included. */
  id: string;
  /** Who wrote it. `id` is compared with `currentUser.id` to decide who may edit and delete. */
  author: { id: string; name: string; src?: string };
  /** When, as it should read: "an hour ago". */
  time: string;
  /** The exact time, ISO. Used for the `<time>` element and, if every top-level comment has one, for sorting. */
  createdAt?: string;
  /** What it says: the segments `MentionInput` writes. */
  body: readonly MentionSegment[];
  /** The reaction counts, as `EmojiReactionPicker` takes them. */
  reactions?: readonly EmojiReaction[];
  /** Its replies. They read oldest first: by `createdAt` when every one has it, otherwise as you give them. A reply can have replies of its own. */
  replies?: readonly CommentData[];
}

export interface CommentSectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'title' | 'onChange'> {
  /** Who is looking: drives the avatar by the new-comment box and which comments they may edit and delete. */
  currentUser: { id: string; name: string; src?: string };
  /** Who can be mentioned. */
  members: readonly MentionMember[];
  /** The comments, as a tree. */
  comments: readonly CommentData[];

  /** Someone sent a new, top-level comment. */
  onAddComment?: (body: MentionSegment[]) => void | Promise<void>;
  /** Someone replied to the comment `parentId`. */
  onReply?: (parentId: string, body: MentionSegment[]) => void | Promise<void>;
  /** The author saved an edit to the comment `id`. Giving this shows Edit on their comments. */
  onEdit?: (id: string, body: MentionSegment[]) => void | Promise<void>;
  /** The author asked to delete the comment `id`. Giving this shows Delete on their comments. It does not confirm. */
  onDelete?: (id: string) => void;
  /** Someone picked or toggled an emoji on the comment `id`. Giving this shows the reaction buttons. */
  onReact?: (id: string, emoji: string) => void;
  /** What Copy Link copies for the comment `id`. Giving this shows Copy Link. */
  getLink?: (id: string) => string;

  /** The text above the box. Default "Comments". */
  title?: string;
  /** The heading level of the title: 2 (default), 3 or 4. */
  headingLevel?: 2 | 3 | 4;
  /** The sort order, controlled. Leave it off and the section holds it. */
  sort?: CommentSort;
  /** The sort order the section starts in. Default `newest`. */
  defaultSort?: CommentSort;
  /** The order changed. */
  onSortChange?: (sort: CommentSort) => void;
  /** Whether threads start open. Default `false` (collapsed, "Show N Replies"). */
  defaultRepliesOpen?: boolean;
  /** What shows under the box when there are no comments. Nothing, by default. */
  emptyState?: React.ReactNode;
}

const byTime = (order: CommentSort) => (a: CommentData, b: CommentData) => {
  const x = Date.parse(a.createdAt ?? '');
  const y = Date.parse(b.createdAt ?? '');
  return order === 'newest' ? y - x : x - y;
};

export const CommentSection = React.forwardRef<HTMLElement, CommentSectionProps>(
  (
    {
      className,
      currentUser,
      members,
      comments,
      onAddComment,
      onReply,
      onEdit,
      onDelete,
      onReact,
      getLink,
      title = 'Comments',
      headingLevel = 2,
      sort,
      defaultSort = 'newest',
      onSortChange,
      defaultRepliesOpen = false,
      emptyState,
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();
    const [ownSort, setOwnSort] = React.useState<CommentSort>(defaultSort);
    const order = sort ?? ownSort;
    const [open, setOpen] = React.useState<Record<string, boolean>>({});
    const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
    const [editing, setEditing] = React.useState<string | null>(null);

    const isOpen = (id: string) => open[id] ?? defaultRepliesOpen;
    const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !(o[id] ?? defaultRepliesOpen) }));

    const sortable = comments.length > 0 && comments.every((c) => c.createdAt);
    const top = sortable ? [...comments].sort(byTime(order)) : comments;

    const Heading = `h${headingLevel}` as const;

    /* Replies are a conversation: oldest first, by time when they all carry one. */
    const replies = (list?: readonly CommentData[]) =>
      list && (list.every((r) => r.createdAt) ? [...list].sort(byTime('oldest')) : list).map(render);

    const render = (comment: CommentData): React.ReactNode => {
      const mine = comment.author.id === currentUser.id;
      return (
        <CommentReplyThread
          key={comment.id}
          author={comment.author}
          time={comment.time}
          dateTime={comment.createdAt}
          body={comment.body}
          members={members}
          reactions={
            onReact ? (
              <EmojiReactionPicker
                reactions={comment.reactions}
                onToggle={(emoji) => onReact(comment.id, emoji)}
                onSelect={(emoji) => onReact(comment.id, emoji)}
              />
            ) : undefined
          }
          link={getLink?.(comment.id)}
          repliesOpen={isOpen(comment.id)}
          onToggleReplies={() => toggle(comment.id)}
          onEdit={
            mine && onEdit
              ? () => {
                  setReplyingTo(null);
                  setEditing(comment.id);
                }
              : undefined
          }
          onDelete={mine && onDelete ? () => onDelete(comment.id) : undefined}
          editing={editing === comment.id}
          onCancelEdit={() => setEditing(null)}
          onSubmitEdit={async (body) => {
            await onEdit?.(comment.id, body);
            setEditing(null);
          }}
          replying={replyingTo === comment.id}
          onReply={
            onReply
              ? () => {
                  setEditing(null);
                  setReplyingTo(comment.id);
                }
              : undefined
          }
          onCancelReply={() => setReplyingTo(null)}
          onSubmitReply={async (body) => {
            await onReply?.(comment.id, body);
            setReplyingTo(null);
            /* A reply that was just sent should be seen. */
            setOpen((o) => ({ ...o, [comment.id]: true }));
          }}
        >
          {replies(comment.replies)}
        </CommentReplyThread>
      );
    };

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn('flex flex-col gap-4 font-sans', className)}
        {...props}
      >
        <div className="flex min-h-8 items-center justify-between gap-2">
          <Heading id={headingId} className="m-0 text-body-md-regular text-text-tertiary">
            {title}
          </Heading>
          <CommentSortChip
            sort={order}
            onSortChange={(next) => {
              if (sort === undefined) setOwnSort(next);
              onSortChange?.(next);
            }}
          />
        </div>
        <CommentComposer user={currentUser} members={members} onSubmit={onAddComment} />
        {comments.length === 0 ? emptyState : <div className="flex flex-col">{top.map(render)}</div>}
      </section>
    );
  },
);
CommentSection.displayName = 'CommentSection';
