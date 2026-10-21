# NotificationInbox *(pattern)*

The full notifications page's content: the controls ("Mark all as read" and
"Show unread only"), the list of rows, and the pager.

Read off Figma's `Notification_Inbox_Content` (`7709:99303`): a `surface.elevated`
card, `radius.md`, 32 / 16 padding, the controls row, the rows, then the pagination.
The popover's "View notifications inbox" link goes here.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Pagination` | component | The pager under the list |
| `Button` | atom | "Mark all as read" (`tertiary`, `sm`) |
| `Toggle` | atom | "Show unread only" |

The rows are passed through **children**: `NotificationInboxItem`s, which the stories
show.

## When to use

| Use | For |
|---|---|
| `NotificationInbox` | The notifications page: the full history, with paging |
| `NotificationPopover` | The quick look from the bell, which links here |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `unreadOnly` / `onUnreadOnlyChange` | `boolean` | `false` | Uncontrolled when `unreadOnly` is omitted. Reports the wish; filters nothing |
| `onMarkAllRead` | `() => void` | — | Renders "Mark all as read". Omit it and there is no button |
| `pagination` | `{ page, pageCount, onChange?, itemCount?, pageSize?, variant? }` | — | The pager. Drawn only when `pageCount > 1` |
| `children` | `ReactNode` | — | The `NotificationInboxItem`s. Each is wrapped in a `<li>` |
| `emptyLabel` | `string` | `No notifications` | What an empty list says |
| `listLabel` | `string` | `Notifications` | Names the list for assistive tech |
| `className`, `ref`, rest | | | On the card |

## The list is yours

Which notifications show for "unread only", and which page of them, is data this
pattern cannot know. It reports `onUnreadOnlyChange` and `pagination.onChange` and
renders what it is given: the `Default` story filters its own list.

## Tokens

Card `surface.elevated`, `radius.md`, `px-8 py-4` (32 / 16), `gap-2.5` (10). The
controls are 16 apart. The pager sits 24 below the last row, as the design draws it.
No new tokens.

## Accessibility

- The rows are a `<ul>` named "Notifications"; each row is a link or button named
  from its sentence.
- "Show unread only" is a real switch; "Mark all as read" a real button.
- The pager is `Pagination`'s `<nav>`.

## Differences from the design

- **No empty state is drawn.** "No notifications" is a plain tertiary line.
- **"Show unread only" is the system `Toggle`** (40 × 24), not Figma's 36 × 20 switch.
- **The controls sit at the left**, as Figma draws them.

## Don't

- **Don't filter or page inside this component.** Pass it the rows to show.
- **Don't put anything but `NotificationInboxItem`s in the list.**
