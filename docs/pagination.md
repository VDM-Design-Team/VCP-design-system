# Pagination

Page numbers for a data set with pages worth naming — tables, search results,
anywhere "page 3 of 12" is something a user might say.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `Pagination` | Addressable pages: tables, result lists |
| `PaginationDots` | Positions: carousels, onboarding, small steppers |
| Infinite scroll *(no component)* | Feeds where position is meaningless — but tables are not feeds |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `page` | `number` | required | 1-based |
| `pageCount` | `number` | required | — |
| `onChange` | `(page: number) => void` | — | Arrows and numbers both land here |
| `className` | `string` | — | Merged via `cn()`; the root is the `<nav>` |
| `ref` | `Ref<HTMLElement>` | — | The `<nav>` |

**The window is five numbers**, centred on the current page and clamped at the
ends — the export's rule, kept. There is deliberately no first/last-and-ellipsis
variant: at the page counts VCP's tables reach, five plus the arrows covers it.
If a thousand-page set genuinely appears, extend this component (minor bump)
rather than composing a bespoke row around it.

## Tokens

Quiet buttons: `surface.elevated` on a `stroke.subtle` border, `text.secondary`
labels, `surface.neutral.faint` hover, `text.disabled` for dead arrows. Active
page: `action.primary` surface/content at rest — the active page is a fact,
not a hover state. Trailing text `text.tertiary`. No new tokens.

| Pair | Light | Dark |
|---|---|---|
| Number label on its button | **10.35:1** | **11.87:1** |
| Active label on the brand fill | **6.18:1** | **5.36:1** |
| Active fill against neighbours | **6.18:1** | **3.88:1** |
| Disabled arrow | 1.48:1 | 3.07:1 |

The `stroke.subtle` button border is below the 3:1 UI-boundary bar in light —
accepted: the number *is* the control's boundary for anyone who can read it,
which is the same reasoning `Card` uses for the same border. The disabled
arrows are deliberately faint; disabled controls are exempt from 1.4.3/1.4.11.

## Accessibility

- `<nav aria-label="Pagination">`; the active page carries
  `aria-current="page"`, and its fill is backed by that semantic — never
  colour alone.
- Every control has a spoken name: "Page 3", "Previous page", "Next page".
- The trailing "Page 3 of 12" is `aria-hidden` — screen readers already get
  the position from `aria-current`; announcing it twice is noise.
- 36-tall controls (the Figma `VCP_Pagination` height): still the
  pointer-dense exemption (pagination lives under
  tables). A touch-first list should page with full-size buttons or scroll.
- Focus is not moved on page change — the user is mid-interaction with the
  pager; yanking focus to the table would strand them.

## Don't

- **Don't hide it when there is one page** by leaving it disabled — render
  nothing instead. A permanently dead control is furniture.
- **Don't reset to page 1 silently** after a filter change without also
  calling `onChange` — the pager shows `page`; lying to it lies to the user.
- **Don't wire arrows to data fetching without disabling during flight** — a
  double-click double-fetches; the component doesn't debounce by design.
- **Don't use it as a stepper for a wizard.** Steps have names; use the future
  `Stepper`, or `PaginationDots` for positions.
