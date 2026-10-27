import * as React from 'react';
import { cn } from '../../lib/cn';
import { CommentReply, type CommentReplyProps } from '../comment-reply';

/**
 * CommentReplyThread — a comment and, under it, its replies.
 *
 * Read off the Figma `Comment_Reply_Thread` (`3506:10331`): a `Comment_Reply` with a
 * `Replies` slot beneath, which the design's own note describes as "insert a Comment
 * Reply into this slot to build a comment thread; a new sub-thread is made by inserting
 * this Comment Reply Thread into the slot". So the replies are this piece's `children`,
 * and a reply that has replies of its own is a `CommentReplyThread` in the slot.
 *
 * **The thread line is drawn here.** The comment's line runs from its avatar down into
 * the replies, and each reply takes a corner off it to its own avatar, 32 across: the
 * line keeps going past every reply but the last and stops at the last one's corner.
 * The design draws one hook at the foot of the comment; with a single reply that is
 * the same picture, and with several the line has to reach each of them. With no
 * replies showing, a comment being replied to ends its line in the hook (`CommentReply`'s
 * `thread="hook"`) and an ordinary one draws no line.
 *
 * **It takes `CommentReply`'s props, and `children` for the replies.** `replyCount`
 * defaults to the number of `children`. `repliesOpen` says whether they show (the
 * toggle in `CommentActions` flips it; the state is yours). The replies are a list, named by
 * the id the toggle controls.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CommentReplyThreadProps extends Omit<CommentReplyProps, 'thread' | 'repliesId'> {
  /** The replies: `CommentReply`, or `CommentReplyThread` for one with replies of its own. */
  children?: React.ReactNode;
}

/* A corner off the line to the reply's avatar. The line is at 16 (the middle of the 32 avatar); a reply
   is indented 48, so the corner is 32 across, and the avatar's middle is 24 down (8 of padding and 16).
   Every reply draws its own length of line: all of its height, or down to its corner if it is the last. */
const REPLY =
  'relative pl-12 before:absolute before:top-0 before:bottom-0 before:left-4 before:w-px before:bg-stroke-default ' +
  'after:absolute after:top-6 after:left-4 after:h-px after:w-8 after:bg-stroke-default ' +
  'last:before:bottom-auto last:before:h-6';

/* The replies as a flat list: `<>…</>` around several is one child to React, and a thread would count it as one. */
const flatten = (nodes: React.ReactNode): React.ReactNode[] =>
  React.Children.toArray(nodes).flatMap((node) =>
    React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === React.Fragment
      ? flatten(node.props.children)
      : [node],
  );

export const CommentReplyThread = React.forwardRef<HTMLElement, CommentReplyThreadProps>(
  ({ className, children, replyCount, repliesOpen = false, replying, ...props }, ref) => {
    const listId = React.useId();
    const items = flatten(children);
    const count = replyCount ?? items.length;
    const showing = repliesOpen && items.length > 0;
    const thread = showing ? 'line' : replying ? 'hook' : 'none';

    return (
      <div className={cn('flex flex-col', className)}>
        <CommentReply
          ref={ref}
          {...props}
          replying={replying}
          replyCount={count}
          repliesOpen={repliesOpen}
          repliesId={listId}
          thread={thread}
        />
        {showing && (
          <div id={listId} role="list" className="flex flex-col">
            {items.map((child, i) => (
              <div key={i} role="listitem" className={REPLY}>
                {child}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
CommentReplyThread.displayName = 'CommentReplyThread';
