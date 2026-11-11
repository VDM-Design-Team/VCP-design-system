import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../../atoms/button';
import { Toggle } from '../../atoms/toggle';
import { Pagination, type PaginationProps } from '../../atoms/pagination';

/**
 * NotificationInbox — the full notifications page's content: the controls ("Mark
 * all as read" and "Show unread only"), the list of rows, and the pager.
 *
 * Read off Figma's `Notification_Inbox_Content` (`7709:99303`): a `surface.elevated`
 * card, 32 / 16 padding, the controls row on top, right-aligned, the rows, then `VCP_Pagination`
 * (the mid size, with the Items select), right-aligned.
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
  /**
   * Draws "Mark all as read" and fires when it is pressed. Without it there is no
   * button, as in `NotificationPopover`: a button that does nothing is never shown.
   */
  onMarkAllRead?: () => void;
  /**
   * The pager under the list, the large one: page numbers, the range readout and
   * the Items select (give `itemCount`, `pageSize` and `onPageSizeChange`). It
   * stays on a single page too, so the page size can always be changed back.
   */
  pagination?: Pick<
    PaginationProps,
    | 'page'
    | 'pageCount'
    | 'onChange'
    | 'itemCount'
    | 'pageSize'
    | 'pageSizeOptions'
    | 'onPageSizeChange'
    | 'variant'
  >;
  /** The rows — `NotificationItem`s. Each is wrapped in a `<li>`. */
  children?: React.ReactNode;
  /**
   * The rows in groups, each under its own heading: by day ("Today", "Yesterday", "3 November"), as the
   * inbox reads (decided 9 Nov 2026). Given, it is used instead of `children`. The grouping is yours; the
   * inbox draws it. A group with no rows is left out.
   */
  groups?: ReadonlyArray<{ label: string; children: React.ReactNode }>;
  /** The groups' heading level. `2` by default: under the page's own title. */
  groupHeadingLevel?: 2 | 3 | 4;
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
      groups,
      groupHeadingLevel = 2,
      emptyLabel = 'No notifications',
      listLabel = 'Notifications',
      ...props
    },
    ref,
  ) {
    const [unreadState, setUnreadState] = React.useState(false);
    const onlyUnread = unreadOnly ?? unreadState;
    const items = React.Children.toArray(children);
    const baseId = React.useId();
    const filled = (groups ?? [])
      .map((g) => ({ label: g.label, items: React.Children.toArray(g.children) }))
      .filter((g) => g.items.length > 0);
    const Heading = `h${groupHeadingLevel}` as 'h2' | 'h3' | 'h4';
    const list = (rows: React.ReactNode[], label: { aria?: string; by?: string }) => (
      <ul aria-label={label.aria} aria-labelledby={label.by}>
        {rows.map((child, index) => (
          <li key={React.isValidElement(child) && child.key != null ? child.key : index}>{child}</li>
        ))}
      </ul>
    );

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2.5 rounded-md bg-surface-elevated px-8 py-4 font-sans',
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-end gap-4">
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

        {groups ? (
          filled.length > 0 ? (
            /* One list per day, named by its heading, so a screen reader can move by day. */
            filled.map((g, i) => (
              <section key={g.label} aria-labelledby={`${baseId}-g${i}`} className="flex flex-col gap-1 pt-2">
                <Heading id={`${baseId}-g${i}`} className="m-0 text-label-sm-medium text-text-secondary">
                  {g.label}
                </Heading>
                {list(g.items, { by: `${baseId}-g${i}` })}
              </section>
            ))
          ) : (
            <p className="py-12 text-center text-body-sm-regular text-text-tertiary">{emptyLabel}</p>
          )
        ) : items.length > 0 ? (
          list(items, { aria: listLabel })
        ) : (
          <p className="py-12 text-center text-body-sm-regular text-text-tertiary">{emptyLabel}</p>
        )}

        {pagination && <Pagination className="justify-end pt-6" {...pagination} />}
      </div>
    );
  },
);
NotificationInbox.displayName = 'NotificationInbox';
