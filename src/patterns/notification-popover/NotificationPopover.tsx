import * as React from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../../atoms/icon-button';
import { SegmentedControl } from '../../atoms/segmented-control';
import { Toggle } from '../../atoms/toggle';
import { Menu } from '../../components/menu';
import { NotificationBell } from '../../components/notification-bell';
import { Popover } from '../../components/popover';

/**
 * NotificationPopover — the bell and the panel that opens from it: a header with
 * the filter (All or Mentions), the "Unread only" switch and a menu with "Mark
 * all as read", the list of notifications, and a link to the full inbox.
 *
 * Read off Figma's `Notification_Popover` (`2428:4386`): 500 wide in Figma, 528 here (and up to 448 tall), `radius.md`,
 * the header over a rule, a scrolling list, and the footer link under a second
 * rule. The pieces are the system's — `Popover` carries the open and close,
 * Escape and the click-away, `NotificationBell` is the trigger, `Menu` the
 * overflow menu, and `SegmentedControl` and `Toggle` the controls — so this
 * pattern is the arrangement, not new behaviour.
 *
 * **The list is yours.** Pass `NotificationItem`s as `children`; the popover puts
 * each in a `<li>`. Which notifications to show for a filter, and what "unread
 * only" does to them, is the caller's data: this component reports the wish
 * (`onFilterChange`, `onUnreadOnlyChange`) and does not filter anything itself.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export type NotificationFilter = 'all' | 'mentions';

export interface NotificationPopoverProps {
  /** How many are unread: the bell's dot and its name. */
  count?: number;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which list is showing. Uncontrolled (starting on All) when omitted. */
  filter?: NotificationFilter;
  onFilterChange?: (filter: NotificationFilter) => void;
  /** "Unread only". Uncontrolled (off) when omitted. */
  unreadOnly?: boolean;
  onUnreadOnlyChange?: (unreadOnly: boolean) => void;
  /** Renders the "Mark all as read" menu item and fires when it is chosen. */
  onMarkAllRead?: () => void;
  /** Where "View notifications inbox" goes. */
  inboxHref: string;
  /** The notifications — `NotificationItem`s. Each is wrapped in a `<li>`. */
  children?: React.ReactNode;
  /** What an empty list says. Defaults to "No notifications". */
  emptyLabel?: string;
  /** The panel's title and accessible name. Defaults to "Notifications". */
  title?: string;
  /** The footer link's text. Defaults to "View notifications inbox". */
  inboxLabel?: string;
  /** Merged onto the wrapper that holds the bell. */
  className?: string;
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'mentions', label: 'Mentions' },
];

export function NotificationPopover({
  count = 0,
  open,
  defaultOpen,
  onOpenChange,
  filter,
  onFilterChange,
  unreadOnly,
  onUnreadOnlyChange,
  onMarkAllRead,
  inboxHref,
  children,
  emptyLabel = 'No notifications',
  title = 'Notifications',
  inboxLabel = 'View notifications inbox',
  className,
}: NotificationPopoverProps) {
  const [filterState, setFilterState] = React.useState<NotificationFilter>('all');
  const [unreadState, setUnreadState] = React.useState(false);
  const activeFilter = filter ?? filterState;
  const onlyUnread = unreadOnly ?? unreadState;

  const items = React.Children.toArray(children);

  /* A scrolling region has to be operable from the keyboard (WCAG 2.1.1): when the
     list overflows it becomes a tab stop, so the arrow keys can scroll it. */
  const listRef = React.useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = React.useState(false);
  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => setScrollable(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <Popover
      className={className}
      trigger={<NotificationBell count={count} />}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      align="right"
      panelRole="dialog"
      label={title}
      /* 528 wide (33rem), and no panel padding: the header and footer draw their
         own, with their own rules. */
      panelClassName="w-132 overflow-hidden p-0"
      content={
        /* Up to 448 tall (28rem) counting the panel's 1 border each side, so 446 here:
           the header and the footer keep their height and the list takes the rest and
           scrolls. Shorter than that, it hugs the rows. */
        <div className="flex max-h-111.5 flex-col">
          {/* A div, not <header>: a <header> outside a sectioning element is a banner
              landmark, and the page already has one (the top bar). */}
          <div className="flex items-center justify-between gap-2 border-b border-stroke-default p-4">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="text-body-lg-semibold text-text-primary">{title}</h2>
              <SegmentedControl
                size="sm"
                aria-label="Show"
                options={FILTERS}
                value={activeFilter}
                onChange={(next) => {
                  setFilterState(next as NotificationFilter);
                  onFilterChange?.(next as NotificationFilter);
                }}
              />
            </div>
            <div className="flex shrink-0 items-center gap-0">
              <Toggle
                label="Unread only"
                checked={onlyUnread}
                onChange={(next) => {
                  setUnreadState(next);
                  onUnreadOnlyChange?.(next);
                }}
              />
              {onMarkAllRead && (
                <Menu
                  align="right"
                  trigger={
                    <IconButton
                      icon="dots-three-outline-vertical-fill"
                      label="More notification actions"
                      className={cn(
                        /* Neutral and the standard size, as the bell: Figma's 24 target in
                           the blue tertiary colour was hard to find and harder to hit. */
                        'text-neutral-outline-content-default',
                        'hover:bg-surface-neutral-subtle hover:text-neutral-outline-content-hover',
                        'active:bg-surface-neutral-medium active:text-neutral-outline-content-pressed',
                      )}
                    />
                  }
                  items={[{ key: 'mark-all', label: 'Mark all as read' }]}
                  onSelect={(key) => key === 'mark-all' && onMarkAllRead()}
                />
              )}
            </div>
          </div>

          <div
            ref={listRef}
            /* Only a tab stop while it actually scrolls. */
            tabIndex={scrollable ? 0 : undefined}
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focused"
          >
            {items.length > 0 ? (
              <ul>
                {items.map((child, index) => (
                  <li key={React.isValidElement(child) && child.key != null ? child.key : index}>
                    {child}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-body-sm-regular text-text-tertiary">
                {emptyLabel}
              </p>
            )}
          </div>

          <div className="border-t border-stroke-default p-4 text-center">
            <a
              href={inboxHref}
              className={cn(
                'inline-block rounded-sm text-body-sm-medium text-text-link-default',
                'hover:text-text-link-hover hover:underline',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focused',
              )}
            >
              {inboxLabel}
            </a>
          </div>
        </div>
      }
    />
  );
}
NotificationPopover.displayName = 'NotificationPopover';
