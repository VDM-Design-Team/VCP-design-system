# GanttTooltip

The card a Gantt bar shows on hover or keyboard focus: the work item's title with
a link glyph, then a few label/value lines — Status, Initiator, Est. Due Date.

It is `Tooltip` with the content filled in. All the behaviour — opens on hover
and on focus, `aria-describedby`, Escape, the pointer staying on it — is
`Tooltip`'s; this piece only supplies the card.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |
| `Tooltip` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `GanttTooltip` | A Gantt bar (or any timeline bar) that stands for one work item and needs its title and a few facts on hover |
| `Tooltip` | A short plain-text description of a control, e.g. the project badge's "Project Name Goes Here" |
| `Popover` *(not built yet)* | Anything the user has to click inside |

## Props

Everything `Tooltip` takes (`placement`, `openDelay`, `defaultOpen`, `tooltipId`,
`children` — the trigger), except `content`, plus:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | The work item's name. One line, truncated |
| `details` | `{ label: string; value: ReactNode }[]` | required | The lines under the title, in order. The colon after the label is added for you |

`children` must be one focusable element — the bar itself. It is the trigger,
it receives `aria-describedby`, and it is the link; the glyph in the card is
only decoration.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `Tooltip`'s: `surface.elevated`, `stroke.default`, `shadow.menu`, radius `sm`, padding 12 / 8 | — |
| Title | `text.primary`, `type.caption-md-bold` | `text-text-primary text-caption-md-bold` |
| Link glyph | `text.brand.medium`, 16 | `text-text-brand-medium` |
| Lines | `text.primary`; label `type.caption-md-medium`, value `type.caption-md-regular` | `text-caption-md-medium` / `text-caption-md-regular` |
| Width | Tailwind numeric scale | `w-56` content + the bubble's side padding = 248 |

No new tokens. Contrast is `Tooltip`'s: `text.primary` on `surface.elevated`,
20.17:1 light and 14.63:1 dark. The brand glyph is decoration and carries no
meaning of its own.

## Accessibility

- It is a `Tooltip`: described by, not labelled by. The bar must already be
  named (its own text or `aria-label`); the card adds detail on top.
- The lines are a description list (`dl`), so a screen reader hears "Status:
  AB Testing" as a pair.
- The glyph is `aria-hidden`.
- Nothing in the card is interactive. Anything a user needs to act on belongs on
  the page, not in the tooltip — if the bar opens the item, the bar is the link.

## Don't

- **Don't put the only copy of a fact here.** Touch users never see it; the
  detail has to exist on the item's page.
- **Don't add buttons or links to the card.** It closes on blur; that is a
  Popover.
- **Don't wrap a non-focusable element.** A hover-only trigger is invisible to
  keyboard users.
- **Don't put a long sentence in a line.** Lines are short facts; the card is
  fixed at one width.
