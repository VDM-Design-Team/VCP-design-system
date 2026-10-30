import * as React from 'react';
import { cn } from '../../lib/cn';
import { Icon, type IconName } from '../../atoms/icon';

/**
 * CommentActions — the row of things you can do to a comment: show or hide its
 * replies, edit it, delete it, reply, copy its link, and react.
 *
 * Read off the Figma `_Comment_Control` set (Default, Cancel Reply, Copy Link)
 * with its `_Comment_Control_Button`, `_Comment_Control_Button_Reply` and
 * `_Comment_Control_Icon` parts. Each action is a text-and-glyph button: 14
 * regular in `neutral.textual.content.default`, a 16 glyph, 8 between them, 36
 * tall with no side padding, so the row's own 16 gap is the only spacing.
 * Hovering turns text and glyph brand blue; pressing darkens the text.
 *
 * **An action shows when you give it a handler.** The design's `Your comment`
 * switch is exactly this: Edit and Delete are for the author's own comment, so
 * a comment by someone else simply gets no `onEdit` or `onDelete`. The same
 * goes for the replies toggle (it needs `replyCount`), Reply and Copy Link.
 * There is no "hidden" state to remember to set.
 *
 * **Reactions are a slot.** The design ends the row with the reaction buttons
 * and counts, which are `EmojiReactionPicker`. Pass it as `reactions` — this
 * piece does not know what a reaction is, so the picker keeps its own state.
 *
 * **Copy Link copies, then says so, and never says so falsely.** With a `link`, a click
 * writes it to the clipboard and, only once that has worked, the glyph becomes the green
 * check the design draws, for `copiedDuration`; "Link copied" goes to a polite live region
 * for everyone who cannot see the glyph. If the clipboard refuses (an insecure page, or
 * permission denied) the glyph becomes a warning and the live region says "Couldn't copy
 * the link". With no `link` there is nothing to copy: the click only fires `onCopyLink` and
 * no success is claimed. The label stays "Copy Link", as drawn.
 *
 * **Names with context.** In a long thread every button would otherwise be named "Edit",
 * "Delete" or "Reply". Give `subject` ("Amy Lee's comment") and each reads "Edit Amy Lee's
 * comment", "Reply to Amy Lee's comment" and so on; the visible word still leads the name.
 * The replies toggle changes its words ("Show 3 Replies" to "Hide 3 Replies") and so does
 * not also carry `aria-expanded`, which would announce the state twice.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface CommentActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** How many replies the comment has. The toggle shows when this is above 0. */
  replyCount?: number;
  /** Whether the replies are showing. Switches "Show" to "Hide". */
  repliesOpen?: boolean;
  /** Toggles the replies. Without it the replies toggle is not drawn. */
  onToggleReplies?: () => void;
  /** The id of the replies list, wired to the toggle as `aria-controls`. */
  repliesId?: string;
  /** Edit the comment. Pass only for the author. */
  onEdit?: () => void;
  /** Delete the comment. Pass only for the author. */
  onDelete?: () => void;
  /** A reply box is open for this comment. Turns "Reply" into "Cancel Reply". */
  replying?: boolean;
  /** Open a reply box. */
  onReply?: () => void;
  /** Close the reply box. */
  onCancelReply?: () => void;
  /** What Copy Link puts on the clipboard. Giving it (or `onCopyLink`) draws the button. */
  link?: string;
  /** Fires after a successful copy, with the link. With no `link` it fires on click with `''`. */
  onCopyLink?: (link: string) => void;
  /** What the actions are about, for their accessible names: "Amy Lee's comment". Optional. */
  subject?: string;
  /** How long the green check stays after a copy, in ms. Default 2000. */
  copiedDuration?: number;
  /** The reaction buttons and counts — an `EmojiReactionPicker`. */
  reactions?: React.ReactNode;
}

/* The design's `_Comment_Control_Button`, which has no side padding. */
const ACTION = cn(
  'group inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md py-2',
  'font-sans text-body-sm-regular whitespace-nowrap transition-colors',
  'text-neutral-textual-content-default',
  'hover:text-text-brand-medium active:text-neutral-textual-content-pressed',
  /* 36 is the design's; a finger needs the system's 40. */
  'pointer-coarse:min-h-10',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
);

interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  iconClassName?: string;
}

const Action = ({ icon, iconClassName, className, children, ...props }: ActionProps) => (
  <button type="button" className={cn(ACTION, className)} {...props}>
    <Icon name={icon} size="sm" aria-hidden="true" className={cn('shrink-0', iconClassName)} />
    {children}
  </button>
);

export const CommentActions = React.forwardRef<HTMLDivElement, CommentActionsProps>(
  (
    {
      className,
      replyCount = 0,
      repliesOpen = false,
      onToggleReplies,
      repliesId,
      onEdit,
      onDelete,
      replying = false,
      onReply,
      onCancelReply,
      link,
      onCopyLink,
      copiedDuration = 2000,
      subject,
      reactions,
      ...props
    },
    ref,
  ) => {
    const [copy, setCopy] = React.useState<'idle' | 'copied' | 'failed'>('idle');
    const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
    React.useEffect(() => () => clearTimeout(timer.current), []);

    const flash = (next: 'copied' | 'failed') => {
      setCopy(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopy('idle'), copiedDuration);
    };

    const copyLink = async () => {
      /* Nothing to copy: hand the click to the caller and claim nothing. */
      if (link === undefined) {
        onCopyLink?.('');
        return;
      }
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        flash('failed');
        return;
      }
      flash('copied');
      onCopyLink?.(link);
    };

    /* With a subject, a name that says what the action is about; the visible word still leads. */
    const named = (name: string) => (subject ? name.replace('{}', subject) : undefined);

    const showReplies = replyCount > 0 && onToggleReplies;
    const showReply = replying ? onCancelReply : onReply;
    const showCopy = link !== undefined || onCopyLink;

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-x-4', className)} {...props}>
        {showReplies && (
          <Action
            icon={repliesOpen ? 'caret-up' : 'caret-down'}
            aria-controls={repliesId}
            aria-label={named(`${repliesOpen ? 'Hide' : 'Show'} ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'} to {}`)}
            onClick={onToggleReplies}
          >
            {`${repliesOpen ? 'Hide' : 'Show'} ${replyCount} ${replyCount === 1 ? 'Reply' : 'Replies'}`}
          </Action>
        )}
        {onEdit && (
          <Action icon="pencil-simple" aria-label={named('Edit {}')} onClick={onEdit}>
            Edit
          </Action>
        )}
        {onDelete && (
          <Action icon="trash" aria-label={named('Delete {}')} onClick={onDelete}>
            Delete
          </Action>
        )}
        {showReply && (
          <Action
            icon="arrow-u-up-left"
            aria-label={named(replying ? 'Cancel Reply to {}' : 'Reply to {}')}
            onClick={replying ? onCancelReply : onReply}
          >
            {replying ? 'Cancel Reply' : 'Reply'}
          </Action>
        )}
        {showCopy && (
          <Action
            icon={copy === 'copied' ? 'check-circle-fill' : copy === 'failed' ? 'warning-circle' : 'link'}
            /* The design's green check: the success colour used as a foreground, so
               the content token of the same value, not the filled surface. A refusal
               is the critical one. */
            iconClassName={
              copy === 'copied'
                ? 'text-accent-success-outline-content-default'
                : copy === 'failed'
                  ? 'text-accent-critical-outline-content-default'
                  : undefined
            }
            aria-label={named('Copy link to {}')}
            onClick={copyLink}
          >
            Copy Link
          </Action>
        )}
        {reactions}
        <span role="status" className="sr-only">
          {copy === 'copied' ? 'Link copied' : copy === 'failed' ? 'Couldn’t copy the link' : ''}
        </span>
      </div>
    );
  },
);
CommentActions.displayName = 'CommentActions';
