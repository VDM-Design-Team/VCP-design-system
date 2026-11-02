# InCaseYouMissedItCard

One Added Value that has been waiting: who raised it and when, its title, and what is wrong with it — Overdue, Due Soon,
Awaiting Review or Pending — with how long. Built to Figma's `_ICYM_Card` (`4361:20247`, four types) on `_ICYM_Card_Base`
(Default / Hover / Pressed).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Divider` | atom |
| `Icon` | sub-atomic |
| `Tag` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InCaseYouMissedItCard` | An Added Value that has been waiting, inside `InCaseYouMissedIt` (or any list of them) |
| `NotificationItem` | A notification, with its read state and reply |
| `StatusTag` | An Added Value's status as a tag, in a table |

## The type vocabulary

The card owns it, once. Each type is a tag and a message in the tone's own colour:

| `type` | Tag | Message (`days: 3`) |
|---|---|---|
| `overdue` | critical, `warning-fill` (solid, as Figma draws it) | "since 3 days ago" (critical) |
| `due-soon` | critical, `hourglass-low-fill` (solid) | "in 3 days" (critical) |
| `awaiting-review` | warning, `clock-user` | "since 3 days ago" (warning) |
| `pending` | warning, `clock` | "since 3 days ago" (warning) |

You pass `days`; it writes the sentence ("1 day" / "3 days"), so no call site words it differently.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `overdue \| due-soon \| awaiting-review \| pending` | required | |
| `title` | `string` | required | Two lines at most, then "…" |
| `user` | `{ name, src? }` | required | Who raised it |
| `created` | `string` | required | Already written — "6 months ago". No relative-time maths here |
| `days` | `number` | required | Days overdue, waiting, or until due |
| `onOpen` | `() => void` | — | The card was pressed |
| `onDismiss` | `() => void` | — | The ✕. Omit it and there is none |
| `dismissLabel` | `string` | `Dismiss ${title}` | Names the ✕ |

## Behaviour

- **The whole face is one button** (open). Hover lifts it (`shadow.elevation.2`); pressed fills it (`surface.neutral.faint`).
- **The ✕ is a sibling of the face**, never inside it: a tonal red disc (24 to look at, 48 to press) in the top-right corner,
  shown on card hover and on focus, always on touch.
- The card sits in 8 of padding so its hover shadow is never clipped by a scrolling parent.
- Dismissing is the caller's to remember: the design says a dismissed card stays away "even after logging out and in".

## Accessibility

- Two real buttons: the card (named by its text — who, when, title, type, message) and the ✕ ("Dismiss Revamp customer onboarding
  documentation").
- The tag carries the type in words; colour is never the only signal. The avatar is decorative (the name is beside it).
- The ✕ is revealed by hover **and** focus, so a keyboard user always reaches it.

## Don't

- **Don't re-word the messages at the call site.** Pass `days`.
- **Don't put the dismiss inside the card's button.** A button does not contain a button.
