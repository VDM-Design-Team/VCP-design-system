import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Toggle } from '../../atoms/toggle';
import { Pagination, type PaginationProps } from '../../components/pagination';

/**
 * NotificationInbox — the full notifications page's content: the controls ("Mark
 * all as read" and "Show unread only"), the list of rows, and the pager.
 *
 * Read off Figma's `Notification_Inbox_Content` (`7709:99303`): a `surface.elevated`
 * card, 32 / 16 padding, the controls row on top, the rows, then `VCP_Pagination`.
 * The popover's "View notifications inbox" link goes here. The rows are the same
 * `NotificationItem` the popover uses: Figma draws an inbox row of its own
 * (`_Notification_Inbox_Item`), but it is the same thing in a wider list, so the
 * system has one.
 *
 * **The list is yours.** Pass `NotificationItem`s as `children`; each goes in a
 * `<li>`. Which notifications show, for "unread only" and for the page, is the
 * caller's data: this pattern reports the wishes (`onUnreadOnlyChange`,
 * `pagination.onChange`) and filters and pages nothing itself.
 *
 * Every class below resolves to a design token from the VCP Figma variables.
 * If you need a value that isn't here, add the token in `tokens/` first —
 * never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface NotificationInboxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "Show unread only". Uncontrolled (off) when omitted. */
  unreadOnly?: boolean;
  onUnreadOnlyChange?: (unreadOnly: boolean) => void;
  /** Renders "Mark all as read" and fires when it is pressed. */
  onMarkAllRead?: () => void;
  /** The pager under the list. Omit it for a single page. */
  pagination?: Pick<
    PaginationProps,
    'page' | 'pageCount' | 'onChange' | 'itemCount' | 'pageSize' | 'variant'
  >;
  /** The rows — `NotificationItem`s. Each is wrapped in a `<li>`. */
  children?: React.ReactNode;
  /** What an empty list says. Defaults to "No notifications". */
  emptyLabel?: string;
  /** Names the list for assistive tech. Defaults to "Notifications". */
  listLabel?: string;
}

export const NotificationInbox = React.forwardRef<HTMLDivElement, NotificationInboxProps>(
  function NotificationInbox(
    {
      className,
      unreadOnly,
      onUnreadOnlyChange,
      onMarkAllRead,
      pagination,
      children,
      emptyLabel = 'No notifications',
      listLabel = 'Notifications',
      ...props
    },
    ref,
  ) {
    const [unreadState, setUnreadState] = React.useState(false);
    const onlyUnread = unreadOnly ?? unreadState;
    const items = React.Children.toArray(children);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2.5 rounded-md bg-surface-elevated px-8 py-4 font-sans',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          {onMarkAllRead && (
            <Button variant="tertiary" size="sm" onClick={onMarkAllRead}>
              Mark all as read
            </Button>
          )}
          <Toggle
            label="Show unread only"
            checked={onlyUnread}
            onChange={(next) => {
              setUnreadState(next);
              onUnreadOnlyChange?.(next);
            }}
          />
        </div>

        {items.length > 0 ? (
          <ul aria-label={listLabel}>
            {items.map((child, index) => (
              <li key={React.isValidElement(child) && child.key != null ? child.key : index}>
                {child}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-body-sm-regular text-text-tertiary">{emptyLabel}</p>
        )}

        {pagination && pagination.pageCount > 1 && (
          <Pagination className="pt-6" {...pagination} />
        )}
      </div>
    );
  },
);
NotificationInbox.displayName = 'NotificationInbox';
