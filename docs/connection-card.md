# ConnectionCard

An outside service you can link your account to: its logo, its name, where the link stands, and the button that connects it. Built to Figma's
`_Personal_Info_Item_Jira_Connect` (the Jira card on the Personal Info settings).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `ConnectionCard` | Linking an account to an outside service (Jira), and showing where the link stands |
| `Banner` | A message about a state, not a service to link |
| `Button` | A plain action |

## It is generic on purpose

It draws a **logo tile, a name, a one-line status and one action** — and nothing about *which* service, what connecting does, or what the states
are. Jira's "Not connected" with **Connect** is the only state the design draws; "Connected as …" with **Disconnect**, or an in-flight
"Connecting…", are the same card with other words. So **`status` and `actionLabel` are the caller's, and so is what the button does** (an OAuth
redirect, a popup, a request): the card only reports the press (`onAction`).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | required | The service: "Jira". Names the card (`role="group"`) |
| `logo` | `ReactNode` | required | The service's mark (an `<svg>` or `<img>`), drawn white on a brand tile. Decorative |
| `status` | `ReactNode` | required | Where the link stands, in a line: "Not connected", "Connected as ada@company.com". Cut with "…" when long |
| `actionLabel` | `string` | `Connect` | The button's words |
| `onAction` | `() => void` | — | The button was pressed. What it does is the caller's |
| `loading` | `boolean` | — | The button spins — connecting or disconnecting |
| `disabled` | `boolean` | — | |
| `className`, `ref` | | | On the card |

## Tokens

`surface.elevated` with a `stroke.default` outline, `radius.md`, `space.16`, 24rem wide (Figma's 386) with the button at the far end — `className` overrides the width; the logo tile is 40 square in `surface.brand.strong` with `text.inverted.primary`
(the mark is white). The name is `body-sm-semibold` `text.secondary`, the status `caption-md-regular` `text.tertiary` (7.58:1 light / 9.85:1 dark).
The button is `Button` `sm`. No new tokens.

## Accessibility

- A `group` named by the service's name, so a screen reader announces "Jira, group".
- The button is named for the service and contains its visible word ("Connect Jira"), so a page with several cards never has two identical "Connect" buttons.
- The logo is decoration (the name beside it says which service this is); the status is text, not colour.

## Don't

- **Don't put the connection logic in it.** It reports a press; the page connects.
- **Don't use it for an action that is not linking a service.** A plain action is a `Button`.
