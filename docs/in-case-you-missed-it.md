# InCaseYouMissedIt

The dashboard strip that brings back the Added Values that have been waiting — overdue, due soon, awaiting review, pending. A titled
card (with an ⓘ that says what it is for) over a row of `InCaseYouMissedItCard`s that scrolls sideways. Built to Figma's
`InCaseYouMissedIt` (`4361:23920`) and its flow.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |
| `Tooltip` | atom |
| `InCaseYouMissedItCard` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `InCaseYouMissedIt` | A dashboard's "things you may have missed" strip |
| `NotificationInbox` | The full list of notifications |
| `Carousel` | One panel at a time (a what's-new tour) — this is a scrolling row, not a carousel |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ id, type, title, user, created, days }[]` | required | The cards, in order. **Empty renders nothing** |
| `onOpen` | `(item) => void` | — | A card was pressed |
| `onDismiss` | `(item) => void` | — | A ✕ was pressed. Omit it and the cards have none |
| `title` | `string` | "In Case You Missed it" | |
| `hint` | `string` | "Added Values that have been waiting for a while and may need your attention." | The ⓘ's tooltip |

## Behaviour

- **No scrollbar is drawn** (the design draws none), so scrolling works every other way: a touch or trackpad swipe, Shift + wheel,
  **dragging the row with the mouse** (past a few pixels it is a drag, and the click that ends it is swallowed so letting go over a
  card does not open it), Tab (focusing a card brings it into view), and an arrow at each edge that moves one card. The arrows are
  32 tonal discs in a 40 press area — one size down from Figma's `_ICYMI_Arrow_Button` (a 40 disc in 48), which read as too big beside the
  cards, with the same 40 minimum target — shown while the strip is hovered or has focus, not at an end the
  row cannot go past, and not at all when everything fits; on a touch screen they are hidden. A plain vertical wheel is left to the
  page — turning it sideways would trap anyone scrolling past the strip.
- **It owns no state.** A dismissed card must stay away "even after logging out and in and after a refresh" while it keeps its current
  status — so the caller removes it from `items` **and remembers it** (server-side). This strip cannot.
- Cards are `w-85` (340 with their padding), snap to the start, and keep their size however wide the page.

## Accessibility

- A `<section>` named by its heading; the cards are a list. The ⓘ is a real button that opens its tooltip on hover **and** focus.
- The arrows are named "Previous" / "Next" and are in the tab order while shown.
- The scrolling row is reachable by keyboard through its cards (each is a button), so it needs no extra tab stop.

## Don't

- **Don't keep dismissals in the component.** A page refresh would bring them back.
- **Don't use it for a short, fixed list** — if it all fits, a plain list is the better surface.
