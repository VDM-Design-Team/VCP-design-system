# NotificationPopover *(pattern)*

The bell and the panel that opens from it: a header with the All / Mentions filter,
the "Unread only" switch and an overflow menu with "Mark all as read", the list of
notifications, and a link to the full inbox.

Read off Figma's `Notification_Popover` (`2428:4386`): 500 wide, `radius.md`, the
header over a rule, a scrolling list, and the footer link under a second rule.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Popover` | component | The panel: opens from the bell, closes on Escape and click-away, returns focus |
| `NotificationBell` | component | The trigger, with the unread dot |
| `Menu` | component | The overflow menu ("Mark all as read") |
| `SegmentedControl` | atom | The All / Mentions filter |
| `Toggle` | atom | "Unread only" |
| `IconButton` | atom | The overflow menu's trigger |

The list is passed through **children**: `NotificationItem`s, which the story shows.

## When to use

| Use | For |
|---|---|
| `NotificationPopover` | The quick look from the top bar: the latest notifications, without leaving the page |
| The inbox page (`NotificationInbox`) | The full list, reached from the footer link |
| `Toast` | A transient message about something the user just did |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` | `number` | `0` | Unread: the bell's dot and name |
| `open` / `defaultOpen` / `onOpenChange` | | closed | Controlled or uncontrolled, as `Popover` |
| `filter` / `onFilterChange` | `'all' \| 'mentions'` | `all` | Uncontrolled when `filter` is omitted. Reports the wish; does **not** filter the list |
| `unreadOnly` / `onUnreadOnlyChange` | `boolean` | `false` | Same: reports the wish, filters nothing |
| `onMarkAllRead` | `() => void` | — | Renders "Mark all as read" in the menu. Omit it and there is no menu |
| `inboxHref` | `string` | required | Where the footer link goes |
| `children` | `ReactNode` | — | The `NotificationItem`s. Each is wrapped in a `<li>` |
| `emptyLabel` | `string` | `No notifications` | What an empty list says |
| `title` | `string` | `Notifications` | The heading and the panel's accessible name |
| `inboxLabel` | `string` | `View notifications inbox` | The footer link's text |
| `className` | `string` | — | On the wrapper that holds the bell |

## The list is yours

Which notifications to show for a filter, and what "unread only" does to them, is
data the popover cannot know. It reports `onFilterChange` and `onUnreadOnlyChange`
and renders whatever it is given: the `Open` story filters its own list.

## Tokens

Panel `surface.elevated`, `radius.md`, `shadow.menu` (Popover's), 500 wide
(`w-125`); header and footer 16 / 8 padding on `stroke.default` rules; title
`body-lg-semibold` `text.primary`; the footer link `body-sm-medium`
`text.link.default` (hover `text.link.hover`). The list scrolls past 224 (`max-h-56`, near the design's 219).
No new tokens.

## Accessibility

- A dialog: the panel is `role="dialog"` named "Notifications"; the bell names it
  with `aria-haspopup="dialog"` and `aria-expanded`. Escape closes and focus returns
  to the bell (Popover's).
- The filter is a radio group ("Show": All, Mentions), the switch is a real switch,
  the menu is the system `Menu`.
- The list is a `<ul>`. When it overflows its box becomes a tab stop so the arrow keys
  can scroll it (as `Modal`'s body does); when it fits, it is not.
- Focus does not move into the panel on open (Popover's default). The next Tab
  reaches the filter.

## Design differences to know

- **The filter is `SegmentedControl`**, not Figma's brand-filled two-button toggle:
  the system's own two-option control, in its `sm` size (32, the design's height).
- **No empty state is drawn.** "No notifications" is a plain tertiary line.
- **No dividers between rows**, as the design draws it.
- **The footer link is `text.link.default`, not `text.brand.medium`** as Figma binds it: in dark, `text.brand.medium` is 3.88:1 on the panel, under the 4.5:1 text needs.

## Don't

- **Don't filter inside this component.** Pass it the list you want shown.
- **Don't put anything but `NotificationItem`s in the list.** Rows are `<li>`s.
- **Don't open the panel from anything but the bell.** The trigger is built in, so the
  name and the dot stay the same everywhere.
