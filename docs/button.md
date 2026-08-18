# Button

The primary interactive control.

## When to use which variant

| Variant | Use for | Max per screen |
|---|---|---|
| `primary` | The single most important action | 1 |
| `secondary` | Supporting actions next to a primary | no limit |
| `ghost` | Dense toolbars, icon-only actions, table rows | no limit |
| `danger` | Destructive, irreversible actions only | 1 |
| `link` | Inline navigation that reads as text | no limit |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `primary \| secondary \| ghost \| danger \| link` | `primary` | |
| `size` | `sm \| md \| lg` | `md` | `sm` only in dense contexts (tables, toolbars) |
| `fullWidth` | `boolean` | `false` | Mobile forms and modals footers |
| `loading` | `boolean` | `false` | Disables the button and swaps the left icon for a spinner |
| `iconLeft` / `iconRight` | `ReactNode` | — | 16px icons only |

## Accessibility

- Minimum target size is 40×40 (size `md`). `sm` is 32px tall — only use it where a pointer is guaranteed.
- Focus ring is `outline-line-brand` at 2px with 2px offset. Never remove it.
- `loading` sets `aria-busy` and disables the control; put the outcome in the label ("Saving…") if the wait exceeds ~1s.
- Icon-only buttons **must** have an `aria-label`.

## Don't

- Don't hardcode colors or spacing. `className="bg-[#336afa]"` is a bug — add a token instead.
- Don't stack two `primary` buttons side by side.
- Don't use `danger` for "Cancel".
