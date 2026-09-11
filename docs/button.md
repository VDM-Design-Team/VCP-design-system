# Button

The primary interactive control.

## When to use which variant

| Variant | Use for | Max per screen |
|---|---|---|
| `primary` | The single most important action | 1 |
| `secondary` | Supporting actions next to a primary | no limit |
| `neutral` | The way *out* — Cancel beside a destructive answer, Dismiss beside a confirm | no limit |
| `tertiary` | Dense toolbars, icon-only actions, table rows | no limit |
| `danger` | Destructive, irreversible actions only | 1 |
| `link` | Inline navigation that reads as text | no limit |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `primary \| secondary \| neutral \| tertiary \| danger \| link` | `primary` | |
| `size` | `sm \| md \| lg` | `md` | `sm` only in dense contexts (tables, toolbars) |
| `fullWidth` | `boolean` | `false` | Mobile forms and modals footers |
| `loading` | `boolean` | `false` | Disables the button and swaps the left icon for a spinner |
| `iconLeft` / `iconRight` | `ReactNode` | — | 16px icons only |

### `secondary` or `neutral`?

Both are outlined. `secondary` is outlined in the **brand**, which reads as a
second call to action — right for "Save draft" beside "Publish", wrong for the
Cancel beside "Delete". `neutral` is outlined in grey and says *this is the way
out*, which is what the AV modals draw.

It came from Figma's `colors/neutral/outline/*`, imported name-for-name on
11 September 2026 — the family existed in the design file and had simply never
been ported.

**Its border is 2.56:1 against white**, below the 3:1 WCAG 1.4.11 asks of a UI
boundary. Accepted on the same reasoning `Pagination` documents for its own
border: the **label** is what identifies this control, at 7.58:1, and the
border is reinforcement. In dark the border is 3.07:1 and clears the bar
outright. If a neutral button ever ships with no label, that reasoning stops
holding and the border needs a stronger token.

## Accessibility

- Minimum target size is 40×40 (size `md`). `sm` is 36px tall (the Figma
  Small button, design audit 3 Sep 2026) — still under 40, so only use it
  where a pointer is guaranteed.
- Focus ring is `outline-stroke-focused` at 2px with 2px offset. Never remove it.
- `loading` sets `aria-busy` and disables the control; put the outcome in the label ("Saving…") if the wait exceeds ~1s.
- Icon-only buttons **must** have an `aria-label`.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#336afa]"` is a bug — add a token instead.
- Don't stack two `primary` buttons side by side.
- Don't use `danger` for "Cancel".
