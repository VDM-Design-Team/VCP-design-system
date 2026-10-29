# StatusHistory

The collapsible bar on an Added Value that holds its status log: a clock, "Status
History (n)" and a caret that shows which way it opens. A disclosure; what lies
under the bar when it is open is the caller's.

Read off the Figma `Status_History` set (`6594:68135`), Closed and Open. The set draws
only the bar, so the open panel is a slot.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |

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
| `count` | `number` | — | Shown as "(3)" after the title; omit for none |
| `open` / `onOpenChange` | `boolean` / `(open) => void` | — | Controlled state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled: starts open |
| `headingLevel` | `2 \| 3 \| 4` | `3` | The title's heading level |
| `children` | `ReactNode` | — | The log. Mounted only while open |
| `className` | `string` | — | Merged via `cn()` |

## Tokens

| Part | Token | Utility |
|---|---|---|
| Card | `surface.elevated`, `shape.radius.md` | `bg-surface-elevated rounded-md` |
| Padding, gap | Tailwind numeric scale | `p-4` (16), `gap-1.5` (clock to title) |
| Title | `text.primary`, `type.title-sm-semibold` | `text-title-sm-semibold text-text-primary` |
| Clock, caret | `text.tertiary`, 20 | `text-text-tertiary`, `size={20}` |
| Open panel | `text.secondary`, `type.body-sm-regular` | `text-text-secondary text-body-sm-regular` |
| Focus ring | `stroke.focused` | Drawn inward: the card clips |

## Accessibility

- The title is a real heading and the bar is the `<button>` inside it, with
  `aria-expanded` and, while open, `aria-controls` pointing at the panel.
- The open panel is a `region` named by the bar.
- The glyphs are decorative; the count is part of the title text, so it is read.
- The whole bar is the target, well over 40 tall.

## Don't

- **Don't put the status log's own controls in the bar.** The bar only opens and closes.
- **Don't stack several as an accordion.** That is `Accordion`, with the caret on the left.
- **Don't keep heavy content mounted when closed.** It is only rendered while open.
