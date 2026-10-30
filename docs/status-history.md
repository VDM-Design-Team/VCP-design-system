# StatusHistory

The collapsible bar on an Added Value that holds its status log: a clock, "Status
History (n)" and a caret that shows which way it opens. A disclosure; open, it shows
the log: who changed the status, from which to which, and how long ago.

Read off the Figma `Status_History` set (`6594:68135`), Closed and Open, and the live
app's log for the open panel (the set draws only the bar).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Icon` | sub-atomic |
| `Tag` | atom |
| `StatusTag` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `StatusHistory` | One standing, collapsible log on a record page |
| `Accordion` | Several stacked panels with the caret on the left |
| `Timeline` | The log itself, as the panel's content |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | `Status History` | The bar's title |
| `count` | `number` | `entries.length` | Shown as "(3)" after the title; omit both for none |
| `entries` | `StatusHistoryEntry[]` | — | The log: `{ actor, actorSrc?, from, to, when, id? }`. `when` is already worded ("a month ago") |
| `open` / `onOpenChange` | `boolean` / `(open) => void` | — | Controlled state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled: starts open |
| `headingLevel` | `2 \| 3 \| 4` | `3` | The title's heading level |
| `children` | `ReactNode` | — | Anything else for the panel, under the entries. Mounted only while open |
| `className` | `string` | — | Merged via `cn()` |

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `surface.elevated`, `shape.radius.md` | `bg-surface-elevated rounded-md` |
| Padding, gap | Tailwind numeric scale | `p-4` (16), `gap-1.5` (clock to title) |
| Title | `text.primary`, `type.title-sm-semibold` | `text-title-sm-semibold text-text-primary` |
| Clock, caret | `text.tertiary`, 20 | `text-text-tertiary`, `size={20}` |
| Entry row | `stroke.subtle` between rows, `p` 16 / 12 | `border-b border-stroke-subtle px-4 py-3` |
| Avatar | `Avatar` `md` (32), neutral | initials, or the photo |
| Actor, sentence, time | `type.label-sm-bold` / `body-sm-regular` / `caption-md-regular` | `text-text-primary` / `text-text-secondary` / `text-text-tertiary` |
| Old status | `Tag` `sm`, neutral | quiet |
| New status | `StatusTag` `sm` | the system's own status colour |
| Open panel | `text.secondary`, `type.body-sm-regular` | `text-text-secondary text-body-sm-regular` |
| Focus ring | `stroke.focused` | Drawn inward: the card clips |

## Accessibility

- The title is a real heading and the bar is the `<button>` inside it, with
  `aria-expanded` and, while open, `aria-controls` pointing at the panel.
- The open panel is a `region` named by the bar.
- The glyphs are decorative; the count is part of the title text, so it is read.
- The log is a list. Each entry reads "Ali H. changed status from Accepted to Initiated, a month ago": the arrow is decorative and a hidden "to" stands in for it.
- The whole bar is the target, well over 40 tall.

**The new status wears its own colour.** The live app draws every new status in one purple
tag; here it is a `StatusTag`, so it takes the status's colour from the one mapping that owns
them. There is no purple in the tag tones.

## Don't

- **Don't put the status log's own controls in the bar.** The bar only opens and closes.
- **Don't stack several as an accordion.** That is `Accordion`, with the caret on the left.
- **Don't keep heavy content mounted when closed.** It is only rendered while open.
