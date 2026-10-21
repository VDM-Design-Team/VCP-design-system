# NotificationInboxItem *(component)*

One row on the full notifications page: who did what to which Added Value, when,
and whether it has been read.

Read off Figma's `_Notification_Inbox_Item` (`7709:99282`): Default and Hover. It is
the roomier cousin of `NotificationItem`, for a page rather than a popover.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Avatar` | atom | The actor, 40 (`md`), initials or a photo |
| `NotificationItem` | component | Its sentence table, `NOTIFICATION_PHRASES`, so both rows word every event identically |

## When to use

| Use | For |
|---|---|
| `NotificationInboxItem` | A row on the notifications page (`NotificationInbox`) |
| `NotificationItem` | A row in the popover from the bell: a 36 avatar, the mark-read button, an optional comment preview |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `kind` | `NotificationKind` | required | Picks the sentence. The eleven kinds are `NotificationItem`'s |
| `actor` | `{ name, src? }` | required | Who did it. The avatar is decorative; the name is in the sentence |
| `subject` | `string` | required | The Added Value's title |
| `status` | `string` | `[Status]` | For `moved` |
| `time` | `string` | required | Already formatted: "2 days ago" |
| `unread` | `boolean` | `false` | The dot, and "Unread:" in the row's name |
| `href` | `string` | — | The whole row is a link |
| `onSelect` | `() => void` | — | The whole row is a button |
| `className`, `ref`, rest | | | On the root `<div>` |

## Tokens

Row `surface.elevated`, hover `surface.neutral.subtle`; 8 padding, 16 between avatar
and text. One line of text: the name `body-sm-bold`, the verb and any ending
`body-sm-semibold`, the title `body-sm-regular`, all `text.primary`, then the time
in `caption-md-medium` `text.tertiary`. The unread dot is 8, `surface.brand.strong`,
in a 24 box that is always there so read and unread rows line up. No new tokens.

## Accessibility

- **The whole row is one target**, a real `<a>` or `<button>` named from the
  sentence, with "Unread:" in the name as text, not only as a dot.
- The focus ring is the `stroke.focused` outline drawn inside the row. Figma's
  hover is a fill only; this row has no separate focus fill in the design, so the
  ring is the indicator.
- No mark-read button: the page has "Mark all as read".
- Put rows in a `<ul>` / `<li>`; `NotificationInbox` does.

## Differences from the design

The inbox's "Ready for Review" is Title Case in Figma; the shared sentence table
says "Ready for review" (as the popover row does), so the two stay in step.

## Don't

- **Don't write the sentence yourself.** Add a `kind` to `NotificationItem`'s table.
- **Don't carry unread by colour alone.** The dot is decoration; the name says it.
