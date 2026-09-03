# Chip

An interactive pill: a selected filter, a removable tag, a toggleable option —
optionally carrying an avatar or a count.

## When to use Chip, Badge, or StatusPill

| Use | For | Interactive? | Vocabulary |
|---|---|---|---|
| `Chip` | A value the user can act on: toggle a filter, remove a tag, pick an option | Yes — real buttons, real tab stops | Whatever the caller supplies |
| `Badge` | Classifying something in place: `Beta`, `Read-only`, `2 failures` | No | Generic tones only |
| `StatusPill` *(component)* | A VCP status: `Accepted`, `For QA`, `Confirmed prod` | No | VCP's status vocabulary |

**If nothing about it is clickable, it is probably a Badge.** A Chip with neither
`onClick` nor `onRemove` renders as a plain span; reach for it only when the
avatar/count anatomy is the point (a people-chip in a read-only list).

## Anatomy — why the markup changes with the props

The export rendered a clickable `<span>` with a `<button>` nested inside — a
control the keyboard cannot reach wrapped around one it can. HTML forbids a
button inside a button, so the rebuilt Chip changes shape instead:

- **`onClick` alone** — the whole pill is one `<button>`, `aria-pressed` when
  `selected` is supplied.
- **`onRemove` present** — the pill is a passive `<span>`; the main region (a
  `<button>` when clickable, else a span) and the ✕ sit inside it as
  **siblings**. Two controls, two tab stops, nothing nested.
- **neither** — a plain `<span>`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | — | Never wraps; truncates with an ellipsis when constrained |
| `avatar` | `ReactNode` | — | Leading slot. `<Avatar size="sm" />` fits the 28 pill exactly |
| `count` | `number` | — | Suffix after a hairline rule, set in the numeric face (`caption-md`) |
| `onClick` | `() => void` | — | Makes the main region a real button |
| `selected` | `boolean` | — | Selected fill + `aria-pressed`. Only meaningful with `onClick` |
| `onRemove` | `() => void` | — | Renders the ✕ — always its own button and tab stop |
| `removeLabel` | `string` | `Remove ${label}` | The ✕'s accessible name. **Required in practice when `label` is not a string** — the fallback is a bare "Remove" |
| `className` | `string` | — | Merged via `cn()` |
| `ref` | `Ref<HTMLElement>` | — | The root — a `<button>` or `<span>` depending on the props |

## Tokens

Brand-tinted, both themes from the same tokens: rest fill
`surface.brand.faint`, hover/selected `surface.brand.subtle`, label
`text.primary`, ✕ `text.secondary` (hover: `surface.brand.medium` fill), count
hairline `stroke.brand.medium`, focus ring `stroke.focused`.

Contrast, measured (WCAG AA asks 4.5:1 for text, 3:1 for UI graphics):

| Pair | Light | Dark |
|---|---|---|
| Label on rest fill | **17.34:1** | **13.23:1** |
| Label on selected/hover fill | **13.69:1** | **9.04:1** |
| ✕ glyph on rest fill | **8.90:1** | **10.73:1** |
| ✕ glyph on selected fill | **7.03:1** | **7.34:1** |
| ✕ glyph on its hover fill | **8.73:1** | **3.77:1** |
| Count hairline on rest fill | 3.24:1 | 2.14:1 |

Everything interactive clears its bar in both themes; the ✕-hover floor is
3.77:1 in dark against the 3:1 a glyph needs. The count hairline is
**decorative** — the count reads on its own and the rule is `aria-hidden` — so
its dark 2.14:1 is accepted, not a defect.

## Accessibility

- Every clickable region is a real `<button>` — focusable, Enter/Space, visible
  `stroke.focused` ring. Nothing is a div with an onClick.
- A toggleable chip announces its state via `aria-pressed`; the fill change is
  the visual echo, not the only signal.
- The ✕ is named `Remove ${label}` (or `removeLabel`). It stops nothing —
  removal and selection are independent controls.
- **28 tall is below the 40 minimum touch target** — the same exemption as
  `IconButton size="sm"`, and the same condition: pointer-dense surfaces only
  (filter bars, tag editors, table cells). Do not make a chip the only path to
  an action on a touch-first screen.

## Don't

- **Don't use a Chip as a status indicator.** That is `Badge` (generic) or
  `StatusPill` (VCP vocabulary).
- **Don't pass a node `label` without `removeLabel`** on a removable chip — the
  ✕ falls back to an anonymous "Remove".
- **Don't set `selected` without `onClick`.** A chip nobody can toggle should
  not claim a pressed state.
- **Don't nest a Chip inside another control** — it already contains buttons.
- **Don't build a "chips input" by hand.** That is `TagEditor` (to port), which
  composes this.
