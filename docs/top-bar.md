# TopBar *(pattern)*

The page header on every VCP screen: back affordance, kicker, the page's
`<h1>`, page actions, the notification bell, the signed-in user.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `IconButton` | atom | The back affordance and the notification bell |
| `Avatar` | atom | The signed-in user |
| `Icon` | atom | The user-menu caret |

Composed through **slots** (the caller passes them in): `Breadcrumb` as the
kicker, `Button` / `IconButton` / `StatusPill` in `actions` — the DetailPage
story shows the full assembly.

The import rows are checked against the real imports — `npm test` fails if
this list drifts.

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
| `notifications` | `number` | — | The bell renders whenever this is a number; `> 0` adds the unread dot (the count lives in the bell's name) |
| `onNotifications` | `() => void` | — | The bell's click |
| `user` | `{ name, src? }` | — | Avatar + name + caret, inline — as the Figma `Top_NavBar` draws it |
| `onUserMenu` | `() => void` | — | Makes the user chip a real button — the future `UserMenu`'s trigger |
| `className` | `string` | — | On the `<header>` |
| `ref` | `Ref<HTMLElement>` | — | The `<header>` |

## Tokens

`surface.elevated` bar (84 tall = `h-21`) on `stroke.subtle`; title
`heading-md` `text.primary` (20.17:1 / 14.63:1); kicker `label-sm` and
subtitle `body-sm` in `text.tertiary`; the bell's unread dot is
`accent.critical.filled.surface`, exactly the Figma `Top_NavBar`'s red dot.
No new tokens — every visible piece is a composed component wearing its own.

## Accessibility

- A `<header>` landmark carrying the page's **single `<h1>`** — which is why
  `title` is required and the heading level is not configurable.
- Back and the bell are `IconButton`s with real names. The design marks
  unread with a dot; the *count* lives in the bell's name ("Notifications,
  3 unread"), and the dot is `aria-hidden` — colour never carries it alone.
- The user chip is a `<button>` named "`name`, account menu" only when
  `onUserMenu` is given; otherwise a plain group — no dead buttons.
- Long titles truncate; the actions/bell/user side never collapses.

## Don't

- **Don't stack two TopBars** or use it inside a panel — one per screen; a
  panel's heading is `Card`'s.
- **Don't put the primary page action only in `actions`** on mobile-width
  screens without checking the truncation story — the bar clips title first,
  never actions.
- **Don't add a role badge to the user chip** — the export drew one; the
  Figma `Top_NavBar` doesn't. Roles are `RoleBadge`'s business (to port), on
  the surfaces the design actually puts them.
- **Don't wire `onUserMenu` to anything but a menu** — the caret promises
  one; `UserMenu` (to port) will be the real thing.
