import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { CommentCard } from '../comment-card';
import { CommentComposer } from '../comment-composer';
import { CommentControl } from '../comment-control';
import { EmojiReactionPicker, type EmojiReaction } from '../emoji-reaction-picker';
import type { MentionMember, MentionSegment } from '../mention-input';
import { Tooltip } from '../tooltip';

/**
 * NotificationItem — one line in a list of notifications: who did what to which
 * Added Value, when, and whether it has been read.
 *
 * Read off Figma's `Notification_Item` (`2428:4412`): Default, Hover and Focused,
 * each with or without a comment preview. The message is Figma's
 * `_Message_Content`, eleven kinds of event, which **this component owns** — the
 * way `StatusTag` owns status → tone — so no call site writes "John moved … to
 * the backlog" itself, and the bold and regular runs are the same everywhere.
 *
 * The whole row is the target: pass `href` and it is a link, or `onSelect` and it
 * is a button. The unread dot is on the right until the row is hovered or
 * focused, when it makes way for the design's mark-read / mark-unread button. The
 * comment preview is the design's: three lines, then "Show more".
 *
 * **Reacting and replying** live under the preview, as the design's
 * `Notification_Popover_Comment_Reply` draws them. The row under the card holds
 * "Reply" (or, once there is a reply, "Show Reply" / "Hide Reply") on the left and the
 * reactions on the right, exactly as `EmojiReactionPicker` draws them. "Reply" swaps the
 * row for a composer; a posted reply is one `CommentCard`, hidden until shown, with Edit
 * and Delete under it; Edit puts the composer back, filled. There is **one reply** per
 * comment. The reply and the reactions are the caller's data and come in as props; the
 * component owns only which of those views is showing.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type NotificationKind =
  | 'commented'
  | 'mention'
  | 'moved'
  | 'accepted'
  | 'updated'
  | 'rejected'
  | 'rejected-feedback'
  | 'assigned'
  | 'backlog'
  | 'handoff'
  | 'viewer';

/**
 * Kind → the sentence, in two parts: the `verb` that follows the actor's name
 * ("commented on"), and an optional `trail` after the subject ("to the
 * backlog"). The strings are the design's; localise by passing your own through a
 * wrapper, not by editing call sites.
 */
const NOTIFICATION_PHRASES: Record<
  NotificationKind,
  { verb: string; trail?: (status?: string) => string }
> = {
  commented: { verb: 'commented on' },
  mention: { verb: 'mentioned you in a comment on' },
  moved: { verb: 'moved', trail: (s) => `to ${s ?? '[Status]'}` },
  accepted: { verb: 'accepts' },
  updated: { verb: 'made an update to' },
  rejected: { verb: 'rejected' },
  'rejected-feedback': { verb: 'rejected', trail: () => 'with feedback' },
  assigned: { verb: 'assigned you' },
  backlog: { verb: 'moved', trail: () => 'to the backlog' },
  handoff: { verb: 'completes', trail: () => '. Ready for review' },
  viewer: { verb: 'added you as a viewer to' },
};

export interface NotificationActor {
  name: string;
  /** Photo. Without it the avatar draws initials. */
  src?: string;
}

export interface NotificationItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** What happened. Picks the sentence. */
  kind: NotificationKind;
  /** Who did it. */
  actor: NotificationActor;
  /** The Added Value it happened to — its title. */
  subject: string;
  /** For `moved`: the status it moved to ("to Confirmed prod"). */
  status?: string;
  /** When, already formatted: "5 minutes ago". */
  time: string;
  /** Not yet read. Draws the dot and names the row "Unread". */
  unread?: boolean;
  /**
   * Renders the mark-read / mark-unread button and fires when it is pressed. Omit
   * it for a list that cannot be marked.
   */
  onToggleRead?: () => void;
  /** Makes the whole row a link. */
  href?: string;
  /** Makes the whole row a button, when it does not navigate. */
  onSelect?: () => void;
  /** The comment, when the event is about one. Drawn as the design's preview card. */
  preview?: string;
  /** Reactions under the preview, as `EmojiReactionPicker` takes them. */
  reactions?: readonly EmojiReaction[];
  /** A reaction pill or the thumbs-up button was pressed. */
  onToggleReaction?: (emoji: string) => void;
  /** An emoji was chosen from the palette. */
  onSelectEmoji?: (emoji: string) => void;
  /** The one reply to the comment, when there is one. */
  reply?: NotificationReply;
  /**
   * Turns replying on: renders "Reply" under the preview, and the composer it opens.
   * Fires with the words and the ids of everyone mentioned.
   */
  onReply?: (value: MentionSegment[], mentionedIds: string[]) => void;
  /** Renders "Edit" on the reply, and fires when the edit is saved. */
  onEditReply?: (value: MentionSegment[], mentionedIds: string[]) => void;
  /** Renders "Delete" on the reply, and fires when it is pressed. */
  onDeleteReply?: () => void;
  /** Who can be mentioned in a reply. */
  members?: readonly MentionMember[];
  /** Who is replying: the composer's avatar. */
  currentUser?: NotificationActor;
  /** Show the reply from the start. It is hidden by default, as the design draws it. */
  defaultReplyShown?: boolean;
}

/** The one reply to a comment. */
export interface NotificationReply {
  author: NotificationActor;
  value: readonly MentionSegment[];
}

export const NotificationItem = React.forwardRef<HTMLDivElement, NotificationItemProps>(
  function NotificationItem(
    {
      className,
      kind,
      actor,
      subject,
      status,
      time,
      unread = false,
      onToggleRead,
      href,
      onSelect,
      preview,
      reactions,
      onToggleReaction,
      onSelectEmoji,
      reply,
      onReply,
      onEditReply,
      onDeleteReply,
      members = [],
      currentUser,
      defaultReplyShown = false,
      ...props
    },
    ref,
  ) {
    /* Which view of the reply flow is showing. The data is the caller's; this is only
       the screen: the row, the composer for a new reply, or the composer for an edit. */
    const [mode, setMode] = React.useState<'idle' | 'replying' | 'editing'>('idle');
    const [replyShown, setReplyShown] = React.useState(defaultReplyShown);
    const replyId = React.useId();
    const hasReactions = Boolean(reactions || onToggleReaction || onSelectEmoji);
    const composerUser = currentUser ?? actor;

    const phrase = NOTIFICATION_PHRASES[kind];
    const trail = phrase.trail?.(status);
    const interactive = Boolean(href || onSelect);

    /* The spaces are text nodes of their own: a space at the start of an inline
       `<span>` is dropped when the accessible name is computed, which ran the
       words together ("John Kestrel commented onChange the notification"). */
    const message = (
      <>
        {unread && <span className="sr-only">Unread: </span>}
        <span className="text-body-sm-bold">{`${actor.name} ${phrase.verb}`}</span>{' '}
        <span className="text-body-sm-regular">{subject}</span>
        {trail && (
          <>
            {!trail.startsWith('.') && ' '}
            <span className="text-body-sm-bold">{trail}</span>
          </>
        )}{' '}
        <span className="text-caption-md-regular text-text-tertiary">{time}</span>
      </>
    );

    /* The stretched element: an empty `::after` covers the row, so the whole row
       is the target while the buttons inside it stay separately reachable above. */
    const stretch = cn(
      'min-w-0 flex-1 text-left text-body-sm-regular text-text-primary outline-none',
      'after:absolute after:inset-0',
      'focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-stroke-focused',
    );

    return (
      <div
        ref={ref}
        data-unread={unread || undefined}
        className={cn(
          'group relative flex flex-col gap-2 bg-surface-elevated p-4 font-sans',
          'transition-colors duration-200 ease-out motion-reduce:transition-none',
          interactive && [
            'hover:bg-neutral-outline-surface-hover',
            /* Figma's focused row: the pressed surface. The ring above is what
               makes focus visible; this is the fill that goes with it. */
            'has-[[data-main]:focus-visible]:bg-neutral-outline-surface-pressed',
          ],
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          {/* `ring` is the avatar's white outline (a `surface.elevated` ring), as Figma's
              `Profile_Initials` draws its white stroke. */}
          <Avatar name={actor.name} src={actor.src} size="lg" ring className="shrink-0" />
          {href ? (
            <a data-main href={href} className={stretch}>
              {message}
            </a>
          ) : onSelect ? (
            <button data-main type="button" onClick={onSelect} className={stretch}>
              {message}
            </button>
          ) : (
            <p className="min-w-0 flex-1 text-body-sm-regular text-text-primary">{message}</p>
          )}

          {/* The trailing slot, one 24 box so the row never shifts. Unread: the dot
              at rest, which dissolves into an outlined check-circle (mark as read)
              on hover and focus. Read: empty at rest; on hover and focus a filled
              check-circle (mark as unread) dissolves in. Every change is a
              dissolve, not a jump. */}
          <span className="relative flex size-6 shrink-0 items-center justify-center">
            {unread && (
              <span
                aria-hidden="true"
                className={cn(
                  'size-2 rounded-full bg-surface-brand-strong',
                  'transition-opacity duration-200 ease-out motion-reduce:transition-none',
                  'group-hover:opacity-0 group-has-[button:focus-visible]:opacity-0',
                )}
              />
            )}
            {onToggleRead && (
              /* After a half-second rest, the design's tooltip names the action.
                 The wrapper fills the 24 box, over the dot, so the button inside
                 keeps the box's whole area. */
              <Tooltip
                content={unread ? 'Mark as read' : 'Mark as unread'}
                openDelay={500}
                className="absolute inset-0 z-10 flex"
              >
                <button
                  type="button"
                  onClick={onToggleRead}
                  aria-label={unread ? 'Mark as read' : 'Mark as unread'}
                  className={cn(
                    'flex size-full items-center justify-center rounded-pill',
                    'text-stroke-brand-medium hover:text-stroke-focused',
                    'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                    'transition-[opacity,color] duration-200 ease-out motion-reduce:transition-none',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  <Icon name={unread ? 'check-circle' : 'check-circle-fill'} size="md" />
                </button>
              </Tooltip>
            )}
          </span>
        </div>

        {preview && (
          <div className="relative z-10 flex flex-col gap-3 pr-6 pl-13">
            <div className="flex flex-col gap-1">
              <CommentPreview text={preview} />

              {/* The row under the card. Gone while a composer is open, as the
                  design draws the Replying and Editing states. */}
              {mode === 'idle' && (onReply || reply || hasReactions) && (
                <div className="flex items-center justify-between gap-4">
                  {reply ? (
                    <CommentControl
                      kind={replyShown ? 'hide' : 'show'}
                      label={replyShown ? 'Hide Reply' : 'Show Reply'}
                      aria-expanded={replyShown}
                      aria-controls={replyId}
                      onClick={() => setReplyShown((shown) => !shown)}
                    />
                  ) : onReply ? (
                    <CommentControl kind="reply" label="Reply" onClick={() => setMode('replying')} />
                  ) : (
                    <span />
                  )}
                  {hasReactions && (
                    <EmojiReactionPicker
                      className="shrink-0"
                      reactions={reactions}
                      onToggle={onToggleReaction}
                      onSelect={onSelectEmoji}
                    />
                  )}
                </div>
              )}
            </div>

            {mode === 'replying' && onReply && (
              <CommentComposer
                autoFocus
                user={composerUser}
                members={members}
                submitLabel="Reply"
                onSubmit={(value, ids) => {
                  onReply(value, ids);
                  /* A new reply starts hidden, as the design draws it. */
                  setReplyShown(false);
                  setMode('idle');
                }}
                onCancel={() => setMode('idle')}
              />
            )}

            {reply && mode === 'editing' && (
              <CommentComposer
                autoFocus
                user={reply.author}
                members={members}
                submitLabel="Save"
                defaultValue={reply.value}
                onSubmit={(value, ids) => {
                  onEditReply?.(value, ids);
                  setMode('idle');
                }}
                onCancel={() => setMode('idle')}
              />
            )}

            {reply && replyShown && mode !== 'editing' && (
              <CommentCard
                id={replyId}
                author={reply.author}
                value={reply.value}
                actions={
                  <>
                    {onEditReply && (
                      <CommentControl kind="edit" label="Edit" onClick={() => setMode('editing')} />
                    )}
                    {onDeleteReply && (
                      <CommentControl
                        kind="delete"
                        label="Delete"
                        onClick={() => {
                          onDeleteReply();
                          setReplyShown(false);
                        }}
                      />
                    )}
                  </>
                }
              />
            )}
          </div>
        )}
      </div>
    );
  },
);
NotificationItem.displayName = 'NotificationItem';

/**
 * The design's comment preview: the comment in a bordered card, three lines of it,
 * and "Show more" when there is more. `Show less` puts it back. Whether there is
 * more is measured, not guessed from the string, so a wide card and a narrow one
 * each decide for themselves.
 */
function CommentPreview({ text }: { text: string }) {
  const id = React.useId();
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [overflowing, setOverflowing] = React.useState(false);
  const hasToggle = overflowing || expanded;

  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-stroke-default bg-surface-elevated">
      {/* No bottom padding while "Show more / less" follows, so the text and the
          button sit close; with no button the text keeps its 8. */}
      <div className={cn('relative px-3 pt-2', hasToggle ? 'pb-0' : 'pb-2')}>
        <p
          id={id}
          ref={textRef}
          className={cn(
            'text-body-sm-regular text-text-primary',
            !expanded && 'line-clamp-3',
          )}
        >
          {text}
        </p>
        {overflowing && !expanded && (
          /* A fade over the last line, so the cut reads as "there is more". */
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-linear-to-t from-surface-elevated to-transparent"
          />
        )}
      </div>
      {hasToggle && (
        <div className="flex justify-center">
          <Button
            variant="tertiary"
            size="sm"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Button>
        </div>
      )}
    </div>
  );
}
