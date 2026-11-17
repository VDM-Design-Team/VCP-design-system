---
bump: minor
---
### `NotificationInbox` — a title in the card, the notification inbox page as a story, an optional `sidebar` on `AppShell`, and "View notification inbox" (November 2026)

`NotificationInbox` takes an optional `title` and `headingLevel`: a heading at the left of the controls row. Without them the card is as before. The page the bell's link opens (Figma's `Notification Inbox` page) is the inbox in `AppShell` with no sidebar, the logo in the top bar and `py-10` around it, shown by the new `OnItsPage` story and set out in `docs/notification-inbox.md`; like the Gantt chart's page it has no wrapper component. `AppShell`'s `sidebar` is now optional (a `TopBar` with no `primaryAction` is the logo version already).

**A deliberate departure from Figma: the page has a title, in the card.** Figma's inbox card has none. Here "Notification Inbox" is the card's own heading and the page's `h1`, as the Gantt chart's title is its card's. Don't add a `PageTitle` band above it.

**Wording:** the popover's footer link, `NotificationPopover`'s default `inboxLabel`, is now "View notification inbox" (was "View notifications inbox"): the standard singular form, and the same name as the page and the component. Anything that sets `inboxLabel` itself is unaffected.
