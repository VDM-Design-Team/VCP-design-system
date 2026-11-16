# NotificationsPage *(pattern)*

The page the bell's "View notifications inbox" link opens: the notification inbox, in the page's content area. It goes inside `AppShell`, which draws the top bar and the footer.
Built to Figma's `Notification Inbox` page (`1030:173232`).

## Composed of

| Piece | Tier |
|---|---|
| `PageTitle` | component |
| `NotificationInbox` | pattern |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `NotificationsPage` | The full notifications page, with the inbox's controls, rows and pager |
| `NotificationInbox` | The inbox on its own, in a layout of your own |
| `NotificationPopover` | The quick look from the bell, which links here |

## How Figma draws this page, and how it is carried

| Figma | Here |
|---|---|
| **No sidebar**: the page is the top bar and the inbox | Give `AppShell` no `sidebar` (it is optional for this) |
| The top bar is the logo version (`Top_NavBar` `Type=Notification Inbox`) | A `TopBar` with no `primaryAction`: the logo is on the left, linked home with `homeHref` |
| **No title band** | The `h1` ("Notifications") is for screen readers, not drawn; `showTitle` draws it as a `PageTitle` |
| 40 above and below the content, 32 in from the sides (`Page_Template_Content_With_Padding_Spacing`) | The page's own `pt-10 pb-10`, with `AppShell`'s 32 at the sides |

```tsx
<AppShell topBar={<TopBar homeHref="/" notifications={3} user={user} />}>
  <NotificationsPage onMarkAllRead={markAll} pagination={pager}>
    {rows}
  </NotificationsPage>
</AppShell>
```

## Props

`NotificationInbox`'s, passed straight through (`unreadOnly`, `onUnreadOnlyChange`, `onMarkAllRead`, `pagination`, `groups`, `groupHeadingLevel`, the rows as `children`), and:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | "Notifications" | The page's `h1`. Not drawn unless `showTitle` |
| `showTitle` | `boolean` | `false` | Draw the title as a title band. Off, as Figma draws the page |

It holds no data and fetches nothing: the rows, the filtering and the paging are the page's.

## Accessibility

- One `h1`, named for the page, so the page has a heading although Figma draws no title. The inbox's day groups (`groups`) are `h2`s beneath it.
- With no sidebar, the bar's logo link is the way back; the page is otherwise the inbox's own (see `docs/notification-inbox.md`).

## Don't

- Don't give it a sidebar: Figma's page has none. A product that wants the rail on this page passes one to `AppShell`; nothing here changes.
- Don't draw the title and hide the `h1` as well: `showTitle` replaces it, it does not add a second.
