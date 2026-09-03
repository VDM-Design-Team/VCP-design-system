# TopBar *(pattern)*

The page header on every VCP screen: back affordance, kicker, the page's
`<h1>`, page actions, the notification bell, the signed-in user.

## When to use

| Use | For |
|---|---|
| `TopBar` | The top of every page — once per screen |
| `Card` header | A panel's own heading inside the page |
| `Breadcrumb` alone | Wayfinding inside content, not the page chrome |

**The first pattern, and the tier's shape.** An organism composed entirely
from existing pieces — `IconButton`, `Icon`, `Avatar`, `Badge`, and whatever
callers slot in (`Breadcrumb` as the kicker, `StatusPill` + `Button` as
actions, per the DetailPage story). Nothing bespoke except the arrangement —
that is what `src/patterns/` is for.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | The page's `<h1>`. Truncates |
| `subtitle` | `ReactNode` | — | Line under the title, `text.tertiary` |
| `breadcrumb` | `ReactNode` | — | Kicker above the title — an AV id, or a real `<Breadcrumb />` |
| `onBack` | `() => void` | — | Renders the back `IconButton` |
| `actions` | `ReactNode` | — | Page-level actions, left of the bell |
| `notifications` | `number` | — | The bell renders whenever this is a number; `> 0` adds the count pill |
| `onNotifications` | `() => void` | — | The bell's click |
| `user` | `{ name, src?, role? }` | — | `role` renders as a small brand `Badge` |
| `onUserMenu` | `() => void` | — | Makes the user chip a real button — the future `UserMenu`'s trigger |
| `className` | `string` | — | On the `<header>` |
| `ref` | `Ref<HTMLElement>` | — | The `<header>` |

## Tokens

`surface.elevated` bar (84 tall = `h-21`) on `stroke.subtle`; title
`heading-md` `text.primary` (20.17:1 / 14.63:1); kicker `label-sm` and
subtitle `body-sm` in `text.tertiary`; the bell's count pill is the
`accent.critical.filled` pair (4.77:1 / 5.30:1) in the numeric face. No new
tokens — every visible piece is a composed component wearing its own.

## Accessibility

- A `<header>` landmark carrying the page's **single `<h1>`** — which is why
  `title` is required and the heading level is not configurable.
- Back and the bell are `IconButton`s with real names. The bell's unread
  count lives **in its name** ("Notifications, 3 unread"); the visual pill
  is `aria-hidden` — announced once, not twice.
- The user chip is a `<button>` named "`name`, account menu" only when
  `onUserMenu` is given; otherwise a plain group — no dead buttons.
- Long titles truncate; the actions/bell/user side never collapses.

## Don't

- **Don't stack two TopBars** or use it inside a panel — one per screen; a
  panel's heading is `Card`'s.
- **Don't put the primary page action only in `actions`** on mobile-width
  screens without checking the truncation story — the bar clips title first,
  never actions.
- **Don't hand-roll the role chip's colours** — `role` renders a brand
  `Badge` verbatim today; when roles need distinct treatments, that mapping
  is `RoleBadge`'s to own (to port), not a call site's.
- **Don't wire `onUserMenu` to anything but a menu** — the caret promises
  one; `UserMenu` (to port) will be the real thing.
