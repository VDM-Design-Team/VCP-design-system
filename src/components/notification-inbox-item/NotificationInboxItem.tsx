import * as React from 'react';
import { cn } from '../../lib/cn';
import { Avatar } from '../../atoms/avatar';
import {
  NOTIFICATION_PHRASES,
  type NotificationActor,
  type NotificationKind,
} from '../notification-item';

/**
 * NotificationInboxItem — one row on the full notifications page: who did what to
 * which Added Value, when, and whether it has been read.
 *
 * Read off Figma's `_Notification_Inbox_Item` (`7709:99282`): Default and Hover. It
 * is the roomier cousin of `NotificationItem`, for a page rather than a popover: a
 * 40 avatar, one line of text with its own weights (the name bold, the verb
 * semibold, the title regular, the ending semibold), the time after it, and the
 * unread dot. There is no mark-read button here; the page has "Mark all as read".
 *
 * **The sentences are `NotificationItem`'s.** Both rows read the same
 * `NOTIFICATION_PHRASES` table, so the popover and the inbox can never word an
 * event differently.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface NotificationInboxItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** What happened. Picks the sentence. */
  kind: NotificationKind;
  /** Who did it. */
  actor: NotificationActor;
  /** The Added Value it happened to — its title. */
  subject: string;
  /** For `moved`: the status it moved to. */
  status?: string;
  /** When, already formatted: "2 days ago". */
  time: string;
  /** Not yet read. Draws the dot and names the row "Unread". */
  unread?: boolean;
  /** Makes the whole row a link. */
  href?: string;
  /** Makes the whole row a button, when it does not navigate. */
  onSelect?: () => void;
}

export const NotificationInboxItem = React.forwardRef<HTMLDivElement, NotificationInboxItemProps>(
  function NotificationInboxItem(
    { className, kind, actor, subject, status, time, unread = false, href, onSelect, ...props },
    ref,
  ) {
    const phrase = NOTIFICATION_PHRASES[kind];
    const trail = phrase.trail?.(status);
    const interactive = Boolean(href || onSelect);

    /* The spaces are text nodes of their own: a space at the start of an inline
       `<span>` is dropped when the accessible name is computed, which ran the
       words together ("John SmithcompletesSome Added Value"). */
    const message = (
      <>
        {unread && <span className="sr-only">Unread: </span>}
        <span className="text-body-sm-bold">{actor.name}</span>{' '}
        <span className="text-body-sm-semibold">{phrase.verb}</span>{' '}
        <span className="text-body-sm-regular">{subject}</span>
        {trail && (
          <>
            {!trail.startsWith('.') && ' '}
            <span className="text-body-sm-semibold">{trail}</span>
          </>
        )}{' '}
        <span className="text-caption-md-medium text-text-tertiary">{time}</span>
      </>
    );

    /* An empty `::after` covers the row, so the whole row is the target. */
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
          'relative flex items-center gap-4 bg-surface-elevated p-2 font-sans transition-colors',
          interactive && 'hover:bg-surface-neutral-subtle',
          className,
        )}
        {...props}
      >
        <Avatar name={actor.name} src={actor.src} size="md" className="shrink-0" />
        {href ? (
          <a href={href} className={stretch}>
            {message}
          </a>
        ) : onSelect ? (
          <button type="button" onClick={onSelect} className={stretch}>
            {message}
          </button>
        ) : (
          <p className="min-w-0 flex-1 text-body-sm-regular text-text-primary">{message}</p>
        )}
        {/* The 24 box is always there, so read and unread rows align. */}
        <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
          {unread && <span className="size-2 rounded-full bg-surface-brand-strong" />}
        </span>
      </div>
    );
  },
);
NotificationInboxItem.displayName = 'NotificationInboxItem';
