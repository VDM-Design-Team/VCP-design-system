import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Tooltip } from '../tooltip';

/**
 * NotificationItem — one line in a list of notifications: who did what to which
 * Added Value, when, and whether it has been read.
 *
 * Read off Figma's `Notification_Item` (`2428:4412`): Default, Hover and Focused,
 * each with or without a comment preview. The message is Figma's
 * `_Message_Content`, thirteen kinds of event, which **this component owns** — the
 * way `StatusTag` owns status → tone — so no call site writes "John moved … to
 * the backlog" itself, and the bold and regular runs are the same everywhere.
 *
 * The whole row is the target: pass `href` and it is a link, or `onSelect` and it
 * is a button. The unread dot is on the right until the row is hovered or
 * focused, when it makes way for the design's mark-read / mark-unread button. The
 * comment preview is the design's: three lines, then "Show more".
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type NotificationKind =
  | 'commented'
  | 'mention'
  | 'moved'
  | 'pending'
  | 'accepted'
  | 'updated'
  | 'rejected'
  | 'rejected-feedback'
  | 'assigned'
  | 'backlog'
  | 'handoff'
  | 'completed'
  | 'viewer';

/**
 * Kind → the sentence, in two parts: the `verb` that follows the actor's name
 * ("commented on"), and an optional `trail` after the subject ("to the
 * backlog"). Every sentence ends in a full stop, added here. The strings are the design's; localise by passing your own through a
 * wrapper, not by editing call sites.
 */
const NOTIFICATION_PHRASES: Record<
  NotificationKind,
  { verb: string; trail?: (status?: string) => string }
> = {
  commented: { verb: 'commented on' },
  mention: { verb: 'mentioned you in a comment on' },
  moved: { verb: 'moved', trail: (s) => `to ${s}` },
  pending: { verb: 'submitted', trail: () => 'for approval. Pending' },
  accepted: { verb: 'accepted' },
  updated: { verb: 'made an update to' },
  rejected: { verb: 'rejected' },
  'rejected-feedback': { verb: 'rejected', trail: () => 'with feedback' },
  assigned: { verb: 'assigned you' },
  backlog: { verb: 'moved', trail: () => 'to the backlog' },
  handoff: { verb: 'handed off', trail: () => '. Ready for Review' },
  completed: { verb: 'accepted & completed' },
  viewer: { verb: 'added you as a viewer to' },
};

export interface NotificationActor {
  name: string;
  /** Photo. Without it the avatar draws initials. */
  src?: string;
}

export interface NotificationItemBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** Who did it. */
  actor: NotificationActor;
  /** The Added Value it happened to — its title. */
  subject: string;
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
}

/**
 * What happened picks the sentence. `moved` is the one that needs more: the status
 * it moved to ("to Confirmed prod"), which is required there and nowhere else.
 */
export type NotificationItemProps = NotificationItemBaseProps &
  (
    | { kind: Exclude<NotificationKind, 'moved'>; status?: never }
    | { kind: 'moved'; status: string }
  );

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
      ...props
    },
    ref,
  ) {
    const phrase = NOTIFICATION_PHRASES[kind];
    const trail = phrase.trail?.(status);
    const markLabel = `${unread ? 'Mark as read' : 'Mark as unread'}: ${subject}`;
    const interactive = Boolean(href || onSelect);

    /* The spaces are text nodes of their own: a space at the start of an inline
       `<span>` is dropped when the accessible name is computed, which ran the
       words together ("John Kestrel commented onChange the notification"). */
    const message = (
      <>
        {unread && <span className="sr-only">Unread: </span>}
        <span className="text-body-sm-bold">{`${actor.name} ${phrase.verb}`}</span>{' '}
        <span className="text-body-sm-regular">{trail ? subject : `${subject}.`}</span>
        {trail && (
          <>
            {!trail.startsWith('.') && ' '}
            <span className="text-body-sm-bold">{`${trail}.`}</span>
          </>
        )}{' '}
        {/* Capitalised for display: it follows the sentence's full stop, so it starts a
            sentence of its own. `first-letter` needs a block-level box. */}
        <span className="inline-block text-caption-md-regular text-text-tertiary first-letter:uppercase">
          {time}
        </span>
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
          'group/notification relative flex flex-col gap-2 bg-surface-elevated p-4 font-sans',
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

          {/* The trailing slot: one 40 box, so the click area is a comfortable
              target, pulled back by 8 on every side (`-m-2`) so the text and the
              icon sit where a 24 box would put them. The dot and the check share
              the box's centre, so they swap in place. Unread: the dot at rest,
              which dissolves into an outlined check-circle (mark as read) when the
              row is hovered or the button focused. Read: empty at rest; a filled
              check-circle (mark as unread) dissolves in. Every change is a
              dissolve, not a jump. With no `onToggleRead` the dot just stays. */}
          <span className="relative -m-2 flex size-10 shrink-0 items-center justify-center">
            {unread && (
              <span
                aria-hidden="true"
                data-unread-dot
                className={cn(
                  'size-2 rounded-full bg-surface-brand-strong',
                  'transition-opacity duration-200 ease-out motion-reduce:transition-none',
                  onToggleRead &&
                    'group-hover/notification:opacity-0 group-has-[[data-mark]:focus-visible]/notification:opacity-0',
                )}
              />
            )}
            {onToggleRead && (
              /* After a half-second rest, the design's tooltip names the action. The
                 wrapper fills the box, over the dot, so the button keeps its whole
                 area. */
              <Tooltip
                content={unread ? 'Mark as read' : 'Mark as unread'}
                openDelay={500}
                placement="left"
                className="absolute inset-0 z-10 flex"
              >
                <button
                  type="button"
                  data-mark
                  onClick={onToggleRead}
                  aria-label={markLabel}
                  className={cn(
                    'flex size-full items-center justify-center rounded-pill',
                    'text-stroke-focused hover:text-text-brand-strong',
                    'opacity-0 group-hover/notification:opacity-100 focus-visible:opacity-100',
                    'transition-[opacity,color] duration-200 ease-out motion-reduce:transition-none',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused',
                  )}
                >
                  <Icon name={unread ? 'check-circle' : 'check-circle-fill'} size="md" />
                </button>
              </Tooltip>
            )}
          </span>
        </div>

        {preview && (
          /* Above the row's stretched link on purpose: a click anywhere on the
             preview does not open the item. Only Show more / less respond. */
          <div className="relative z-10 flex flex-col gap-1 pr-6 pl-13">
            <CommentPreview text={preview} />
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
