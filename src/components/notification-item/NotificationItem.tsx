import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';

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
 * backlog"). The strings are the design's. `NotificationInboxItem` reads the same
 * table, so the two rows can never word an event differently; localise by
 * passing your own through a wrapper, not by editing call sites.
 */
export const NOTIFICATION_PHRASES: Record<
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
  /** Below the preview — the reply and reaction controls, which the caller owns. */
  previewActions?: React.ReactNode;
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
      previewActions,
      ...props
    },
    ref,
  ) {
    const phrase = NOTIFICATION_PHRASES[kind];
    const trail = phrase.trail?.(status);
    const interactive = Boolean(href || onSelect);

    const message = (
      <>
        {unread && <span className="sr-only">Unread: </span>}
        <span className="text-body-sm-bold">{`${actor.name} ${phrase.verb}`}</span>
        <span className="text-body-sm-regular"> {subject}</span>
        {trail && (
          <span className="text-body-sm-bold">
            {trail.startsWith('.') ? '' : ' '}
            {trail}
          </span>
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
          'group relative flex flex-col gap-2 bg-surface-elevated p-4 font-sans transition-colors',
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
          <Avatar name={actor.name} src={actor.src} size="lg" className="shrink-0" />
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

          {/* The trailing slot: the unread dot, or on hover and focus the
              mark-read button. They share the 24 box, so the row never shifts. */}
          <span className="relative flex size-6 shrink-0 items-center justify-center">
            {unread && (
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-surface-brand-strong group-hover:opacity-0 group-has-[button:focus-visible]:opacity-0"
              />
            )}
            {onToggleRead && (
              <button
                type="button"
                onClick={onToggleRead}
                aria-label={unread ? 'Mark as read' : 'Mark as unread'}
                className={cn(
                  'absolute inset-0 z-10 flex items-center justify-center rounded-pill',
                  'text-stroke-brand-medium hover:text-stroke-focused',
                  'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
                )}
              >
                <Icon name="check-circle" size="md" />
              </button>
            )}
          </span>
        </div>

        {preview && (
          <div className="relative z-10 flex flex-col gap-1 pr-6 pl-13">
            <CommentPreview text={preview} />
            {previewActions}
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
      <div className="relative px-3 pt-2 pb-2">
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
            className="pointer-events-none absolute inset-x-0 bottom-2 h-5 bg-linear-to-t from-surface-elevated to-transparent"
          />
        )}
      </div>
      {(overflowing || expanded) && (
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
