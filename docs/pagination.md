# Pagination

Page numbers for a data set with pages worth naming — tables, search results,
anywhere "page 3 of 12" is something a user might say. Built to Figma's
`VCP_Pagination` (`6794:12201`, aligned 5 Oct 2026).

| Figma version | How you get it |
|---|---|
| **Tiny** — ‹ 1 2 3 4 5 › | `variant="compact"` |
| **Small** — « First ‹ 1 2 3 4 … 25 › Last » | `variant="default"` (the default) |
| **Mid size** — Small + Items [50 ▾] + "1-50 of 1,250" | `default` plus `itemCount`, `pageSize` and `onPageSizeChange` |

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
| `onChange` | `(page: number) => void` | — | First, Previous, numbers, Next and Last all land here, clamped to `1…pageCount` |
| `variant` | `default \| compact` | `default` | `default` has First and Last either end; `compact` drops them (Figma's Tiny) |
| `itemCount` | `number` | — | Total items. With `pageSize`, shows the "1-50 of 1,250" readout |
| `pageSize` | `number` | — | Items per page — for the readout and the Items select |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | The Items select's choices |
| `onPageSizeChange` | `(pageSize: number) => void` | — | Shows the Items select. Reports the new size only — see below |
| `className` | `string` | — | Merged via `cn()`; the root is a `<div>` holding the `<nav>`, the select and the readout |
| `ref` | `Ref<HTMLDivElement>` | — | That root `<div>` |

**Long page counts collapse to an ellipsis.** The first and last page always
show, with the current page and its neighbours between them: "1 2 3 4 … 25"
near the start, "1 … 12 13 14 … 25" in the middle, "1 … 22 23 24 25" near the
end. A gap of exactly one page shows that page, never an ellipsis standing in
for it. Seven pages or fewer show every number.

**Changing Items doesn't move the page.** The component reports the new size
and nothing else: whether to go back to page 1 (usually right, since the old
page may no longer exist) is the caller's call. The Default story resets.

## Tokens

Controls: `surface.elevated` on a `stroke.default` border, `radius.xs`, 36
high with `space.12` either side, `label-sm-medium` in `text.primary`, 16
glyphs; `space.6` between them. Hover `surface.neutral.faint`; disabled
`text.disabled`. Active page: `surface.brand.strong` with
`text.inverted.primary` — the active page is a fact, not a hover state. The
Items label and the readout are `label-sm-medium` in `text.secondary`;
`space.32` between the page controls and them, `space.8` between "Items" and
its select, `space.20` between the select and the readout.

Figma fills the controls with `surface.elevated-secondary`, which the repo
doesn't have. Its light value is white, the same as `surface.elevated`, so the
component uses that rather than inventing a dark value for a token it can't
see.

| Pair | Light | Dark |
|---|---|---|
| Number and label on its button | **20.17:1** | **14.63:1** |
| Active number on the brand fill | **6.18:1** | **8.73:1** |
| Active fill against the page | **5.91:1** | **7.73:1** |
| Items label and range readout | **9.90:1** | **14.48:1** |
| Button border against the page | 1.42:1 | 2.36:1 |
| Disabled control | 1.48:1 | 3.07:1 |

The button border is below the 3:1 UI-boundary bar — accepted, as before: the
number *is* the control's boundary for anyone who can read it, so the border is
decorative rather than a boundary 1.4.11 governs. Disabled controls are exempt
from 1.4.3/1.4.11.

## Accessibility

- `<nav aria-label="Pagination">`; the active page carries
  `aria-current="page"`, and its fill is backed by that semantic — never
  colour alone.
- Every control has a spoken name: "Page 3", "First page", "Previous page",
  "Next page", "Last page". First and Last carry visible words too.
- The ellipsis is `aria-hidden` — it is not a page, and the numbers either
  side of it already say where the gap is.
- The Items select is a native `<select>` with a real `<label>` ("Items"), so
  keyboards, screen readers and mobile pickers work without extra wiring.
- The range readout is plain visible text, outside the `<nav>`: it describes
  the data, not a place to go.
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
