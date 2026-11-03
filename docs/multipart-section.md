# MultipartSection *(pattern)*

The card on an Added Value's page that lists its parts: a **Multipart** heading, "33% (1/3 parts completed)", a progress bar and a
`MultipartRow` per part. In editing, **Add Part** sits under the rows. Built to Figma's `Multipart_Section` and the AV edit page.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `ProgressBar` | atom |
| `Tooltip` | atom |
| `MultipartRow` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MultipartSection` | An AV's list of parts, viewing or editing |
| `ChildPartModal` | What **Add Part** should open |
| `MultipartRow` | One part, anywhere else |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `parts` | `MultipartPart[]` | required | In order: the first is part 1. `id`, `title`, `assignee?`, `capacityPoints?`, `dueDate?`, `dueProximity?`, `status?`, `customStatus?`, `completed?` |
| `hint` | `string` | — | The info glyph's words. **Figma draws the glyph, not its text**; without `hint` there is no glyph |
| `onOpenPart` | `(part) => void` | — | A title was pressed. Opening it is the page's |
| `onAddPart` | `() => void` | — | **Add Part** (editing). Leave it out to hide the button |

## Progress is worked out here

A part is done when `completed` is true, or its `status` is `Completed`. The percentage, "(1/3 parts completed)" and the bar all come from
`parts`, so they cannot disagree with the rows.

## Narrow

Rows keep a floor width; below it the list scrolls sideways (Figma's "Small Screen Width"). The scroller is a focusable region (arrow keys)
**only while it overflows**.

## Tokens

`surface.elevated`, `radius.md`, `space.16`; heading `body-md-semibold`, the summary `body-sm-regular` `text.tertiary`; the bar is `ProgressBar`'s
brand tone; **Add Part** is the `secondary` `Button`, full width.

## Accessibility

- A `section` named by its heading (an `h2`); the parts are a list. The bar is a `progressbar` named by the summary.
- The info glyph is a button ("About Multipart") with a tooltip.

## Don't

- **Don't count parts yourself.** Pass them; the summary is worked out.
- **Don't open the part on a row click.** The title is the control.
