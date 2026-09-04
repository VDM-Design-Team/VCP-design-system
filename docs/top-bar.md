# TopBar *(pattern)*

The app bar — the Figma `Top_NavBar`, in its two versions: primary action on
the left, or the linked logo when there is none. Bell, mode toggle, and the
signed-in user on the right.

## Composed of

| Piece | Tier | Role here |
|---|---|---|
| `Logo` | atom | The left side, linked home, when there is no `primaryAction` |
| `Toggle` | atom | The light/dark mode switch |
| `IconButton` | atom | The notification bell |
| `Avatar` | atom | The signed-in user |
| `Icon` | atom | The user-menu caret |

Composed through **slots**: the "Create Added Value" `Button` arrives via
`primaryAction` — the WithPrimaryAction story shows it.

The import rows are checked against the real imports — `npm test` fails if
this list drifts.

## The two versions

| Version | Left side | When |
|---|---|---|
| With primary action | The `Button` passed in `primaryAction` | Screens where creating an Added Value is the headline act |
| Without | The `Logo`, linked via `homeHref` | Everywhere else |

Exactly the Figma variant pair — pass `primaryAction` or don't; there is no
third arrangement. The **page-level** header (back arrow, AV id/title,
status-move buttons) is a different Figma component, `AV_Header`, and is its
own pattern — [`AVHeader`](av-header.md). TopBar deliberately carries no
title, no `h1`, no back.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `primaryAction` | `ReactNode` | — | The bar's one action — a `Button`. Present ⇒ replaces the logo |
| `homeHref` | `string` | — | The logo's home link (no-action version) |
| `notifications` | `number` | — | Bell renders whenever this is a number; `> 0` shows the design's red dot — the count lives in the bell's name |
| `onNotifications` | `() => void` | — | The bell's click |
| `theme` / `onThemeChange` | `'light' \| 'dark'` / `(t) => void` | — | The mode `Toggle`. **Controlled**: it reports the wish; the app owns the theme and the `.dark` class |
| `user` | `{ name, src? }` | — | Avatar + name + caret, inline — as the design draws it. No role badge (design review, 3 Sep 2026: no design for it) |
| `onUserMenu` | `() => void` | — | Makes the user chip a real button — the future `UserMenu`'s trigger |
| `className` | `string` | — | On the `<header>` |
| `ref` | `Ref<HTMLElement>` | — | The `<header>` |

## Tokens

`surface.elevated` bar (64 tall = `h-16`) on `stroke.subtle`; user name
`label-lg` `text.primary`; the unread dot is
`accent.critical.filled.surface` — the design's red dot. No new tokens —
every visible piece is a composed component wearing its own.

## Accessibility

- A `<header>` landmark. **No `h1`** — the app bar is chrome; the page title
  belongs to `AVHeader`/the page itself.
- The logo link is named "Value Chain Plus — home" with the `Logo` rendered
  `decorative` — one announcement (the InAHomeLink pattern from
  docs/logo.md).
- The bell is an `IconButton` whose name carries the count ("Notifications,
  3 unread"); the dot is `aria-hidden` — colour never carries it alone.
- The mode switch is the system `Toggle` named "Dark mode" — a real switch
  with real state, not a styled div.
- The user chip is a `<button>` named "`name`, account menu" only when
  `onUserMenu` is given; otherwise a plain group — no dead buttons.

## Don't

- **Don't put both the action and the logo in** — the design shows one or
  the other; that is what the variant pair means.
- **Don't stack page-title anatomy into this bar** — back/title/status
  actions are `AVHeader`'s. Two bars, two patterns, as designed.
- **Don't own theme state here** — `theme` is controlled; the app flips the
  `.dark` class, and everything (this bar included) re-themes by token.
- **Don't add a role badge to the user chip** — the export drew one; the
  design doesn't. Roles are `RoleBadge`'s business (to port).
