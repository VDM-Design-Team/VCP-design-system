import * as React from 'react';
import { cn } from '../../lib/cn';
import { PageTitle } from '../../components/page-title';
import { NotificationInbox, type NotificationInboxProps } from '../notification-inbox';

/**
 * NotificationsPage — the page the bell's "View notifications inbox" link opens: the inbox, in the page's content area. It goes inside `AppShell`, which draws the
 * top bar and the footer. Built to Figma's `Notification Inbox` page (`1030:173232`).
 *
 * **Figma draws this page differently from the others in three ways**, and this carries them:
 *
 * - **No sidebar.** The page is the top bar and the inbox; give `AppShell` no `sidebar`. The top bar is the logo version (no `primaryAction`, so the logo is on the left;
 *   Figma's `Top_NavBar` `Type=Notification Inbox`).
 * - **No title band.** The inbox card starts 40 below the bar. The page still needs its `h1`, so the title ("Notifications") is there for a screen reader and not drawn;
 *   `showTitle` draws it as a `PageTitle` for a product that wants one.
 * - **The content is 40 above and below** (Figma's `Page_Template_Content_With_Padding_Spacing`), 32 in from the sides (`AppShell`'s body).
 *
 * Everything else is `NotificationInbox`'s and is passed straight through (`unreadOnly`, `onMarkAllRead`, `pagination`, `groups`, the rows as `children`): it holds no
 * data and fetches nothing.
 *
 * Every class below resolves to a design token from the VCP Figma variables. If you need a value that isn't here, add the
 * token in `tokens/` first — never hardcode a hex, px value, or arbitrary Tailwind class. ds-lint-ignore
 */
export interface NotificationsPageProps extends NotificationInboxProps {
  /** The page's name, its `h1`. Default "Notifications". Not drawn unless `showTitle`. */
  title?: string;
  /** Draw the title as a title band (`PageTitle`). Off by default: Figma's page has none, and the heading is for screen readers. */
  showTitle?: boolean;
}

export const NotificationsPage = React.forwardRef<HTMLDivElement, NotificationsPageProps>(
  ({ className, title = 'Notifications', showTitle = false, ...inbox }, ref) => (
    <div ref={ref} className={cn('flex flex-col pb-10', showTitle ? 'gap-4' : 'pt-10', className)}>
      {showTitle ? (
        /* `AppShell`'s body already gives 32 each side; the band brings its own, so it steps back out of them. */
        <PageTitle title={title} className="-mx-8" />
      ) : (
        <h1 className="sr-only">{title}</h1>
      )}
      <NotificationInbox {...inbox} />
    </div>
  ),
);
NotificationsPage.displayName = 'NotificationsPage';
