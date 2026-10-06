# CopyText

A value that is not a link but is interactive. It underlines on hover; clicking
it copies the text to the clipboard and shows a "Copied" bubble that goes away
by itself after 800ms. Use it for the things people copy far more often than
they follow: a reference number, an id, an email address.

Read off Figma's `_AV_Table_ID` (`7247:39763`): Default, Hover (underlined) and
Tooltip (underlined, with the bubble). 14 regular `text.tertiary`; the bubble 12
regular `text.primary` on a raised surface with a shadow.

## Composed of

Nothing from the system — this piece renders its own markup and takes
composition through its props/slots. `npm test` fails if that changes
without this section changing.

## When to use

| Use | For |
|---|---|
| `CopyText` | A reference or id a person pastes elsewhere — a table's `VCP-12345` |
| A link | Anything that navigates. If clicking should *go* somewhere, it is a link, not this |
| A button with a copy icon | A value with room for a visible affordance, where discoverability matters more than density |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | required | What goes on the clipboard. Also the visible text unless `children` is given |
| `children` | `ReactNode` | `text` | Visible content when it differs from what is copied |
| `copiedLabel` | `string` | `'Copied'` | The bubble's message — and what a screen reader hears |
| `duration` | `number` | `800` | How long the bubble stays, in ms. The design's number |
| `onCopy` | `(text) => void` | — | After a successful copy |
| `className`, `ref`, rest | | | On the `<button>` |

## Tokens

Text `text.tertiary` 14 regular (`body-sm-regular`), underlined on hover, with the
standard focus ring. The bubble is `surface.elevated` with `text.primary` at
`caption-md-regular`, `radius.sm`, `space.8` padding and `shadow.menu`, `space.8`
above the text. No new tokens.

The bubble is the Figma design's light one. `Tooltip` is an inverted (dark) bubble;
the two differ because Figma draws them differently, and that difference is worth
settling with design.

## Accessibility

- A real `<button>` — nothing navigates, so it must not claim to be a link, and a
  clickable `<span>` is unreachable by keyboard. Space and Enter both copy.
- Its accessible name is the visible text: "VCP-12345, button".
- "Copied" is announced through a polite live region (`role="status"`); the visible
  bubble is `aria-hidden` so it is not read twice. The bubble fades with
  `prefers-reduced-motion` respected.
- **If the clipboard is unavailable** (an insecure page, or permission denied) it
  says nothing, rather than claim a copy that did not happen.

## Don't

- **Don't use it for something that navigates.** Underline-on-hover is what a link
  does too; a value that goes somewhere should be a link so middle-click and
  open-in-new-tab work.
- **Don't put a different text in `children` and `text` without a reason.** What
  people see is what they expect to paste.
- **Don't use `Tooltip` for this.** A tooltip opens on hover or focus and closes on
  leave; this bubble opens on click and closes on a timer.
