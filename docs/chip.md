# Chip

An interactive pill: a selected filter, a removable tag, a toggleable option —
optionally carrying an avatar or a count.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use Chip, Badge, or StatusTag

| Use | For | Interactive? | Vocabulary |
|---|---|---|---|
| `Chip` | A value the user can act on: toggle a filter, remove a tag, pick an option | Yes — real buttons, real tab stops | Whatever the caller supplies |
| `Badge` | Classifying something in place: `Beta`, `Read-only`, `2 failures` | No | Generic tones only |
| `StatusTag` *(component)* | A VCP status: `Accepted`, `For QA`, `Confirmed prod` | No | VCP's status vocabulary |

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

## People chips — the Initiator and Assignee recipes

Figma's `_User_Chip_Initiator` and `_User_Chip_Assignee` are this chip, not a second component. The
options that make them (`size`, `tone`, `variant`, `description`, `onEdit`, `actions`, `disabled`) are all
opt-in; with none of them a chip is exactly what it was.

**Initiator** — an avatar and a name.

```tsx
<Chip size="md" tone="brand" avatar={<Avatar name="Marvin R" size="sm" />} label="Marvin R" />           // View
<Chip size="md" tone="brand" variant="outline" avatar={…} label="Marvin R" onRemove={remove} />          // Edit
<Chip size="md" disabled avatar={…} label="Marvin R" />                                                   // Disabled
```

**Assignee** — an avatar, a name with an "Assignee" line, and a count.

```tsx
<Chip size="md" tone="brand" avatar={<Avatar name="John Doe" tone="blue" size="sm" />}
      label="John" description="Assignee" count={5} />                                                     // View
<Chip size="md" tone="brand" variant="outline" actions="hover" …
      onEdit={edit} onRemove={remove} />                                                                   // Edit (Edit Hover)
```

The stories `Initiator` and `Assignee` draw every state side by side.

| Figma state | Chip options |
|---|---|
| View | `tone="brand"` (tonal is the default `variant`) |
| Edit | `variant="outline"`, plus `onRemove` (Initiator) or `onEdit` and `onRemove` (Assignee) |
| Edit Hover | the same, with `actions="hover"`: the buttons appear while the pointer is over the chip or focus is inside |
| Disabled | `disabled` |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | — | Never wraps; truncates with an ellipsis when constrained |
| `description` | `ReactNode` | — | A second, smaller line under the label (`caption-sm-medium`) — the "Assignee" under a name |
| `avatar` | `ReactNode` | — | Leading slot. `<Avatar size="sm" />` fits the 28 pill exactly |
| `count` | `number` | — | Suffix after a hairline rule, set in the numeric face (`caption-md`) |
| `variant` | `tonal \| outline` | `tonal` | `outline` is the editing look: a `stroke.brand.strong` border and no fill |
| `size` | `sm \| md` | `sm` | 28 or 32 tall. `md` takes a 24 avatar with 4 around it, as the people chips draw |
| `tone` | `default \| brand` | `default` | `brand` sets the text in `text.brand.strong`; `default` is `text.primary` |
| `onClick` | `() => void` | — | Makes the main region a real button |
| `selected` | `boolean` | — | Selected fill + `aria-pressed`. Only meaningful with `onClick` |
| `onRemove` | `() => void` | — | Renders the ✕ — always its own button and tab stop. In an `outline` chip it is critical-coloured, as the design draws it |
| `onEdit` / `editLabel` | `() => void` / `string` | — / `Edit ${label}` | Renders a pencil button before the ✕, its own control and tab stop. Name it with `editLabel` when `label` is not a string |
| `actions` | `always \| hover` | `always` | `hover` hides the buttons until the pointer is over the chip or focus is inside it, and always shows them on a touch screen |
| `disabled` | `boolean` | — | Grey border and disabled text; the buttons are not drawn and nothing is clickable |
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

### Tokens for the people-chip options

| Part | Token | Contrast, light / dark |
|---|---|---|
| `tone="brand"` text on the tonal fill | `text.brand.strong` on `surface.brand.faint` (hover: `subtle`) | 11.37 / 8.97 (8.97 / 6.14) |
| `tone="brand"` text on an outline | `text.brand.strong` on `surface.canvas` | 12.64 / 12.11 |
| Count on a tonal brand chip | `text.tertiary` on `surface.brand.faint` (as Figma) | 6.51 / 8.91 |
| Outline border | `stroke.brand.strong` on `surface.canvas` | 8.64 / 7.73 |
| Critical ✕ on an outline | `accent.critical.outline.content` on `surface.canvas` | 4.56 / 6.18 |
| Disabled border | `stroke.strong` | 4.55 / 6.96 |

Disabled text (`text.disabled`) is exempt from the contrast minimum, as every disabled control's is.

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

- **Hover-revealed buttons stay reachable.** With `actions="hover"` the buttons are only visually hidden
  (clear and zero-wide): they stay in the tab order, and focus inside the chip reveals them, so a keyboard user
  is never tabbing through invisible controls. A touch screen has no hover, so they are always shown there
  (`pointer-coarse`). The reveal is skipped under reduced motion.
- A disabled chip is `aria-disabled` with no buttons at all.

## Differences from the design

- **The "Assignee" line is `caption-sm-medium` (10), not Figma's 9.** 9 is not on the type ramp.
- **The edit and remove buttons are 24 (`md`) or 20 (`sm`) round hit areas** with a 14 pencil and a 12 ✕, the
  system's sizes, not Figma's raw 24 buttons.
- **The count is the numeric face (`caption-md-medium`)**, as every chip count is; Figma sets it in 14 Poppins.
- **The Initiator avatar is the `Avatar` atom** (initials, or a photo through `src`).
- **Brand text applies to the Edit state's count too** (an outline chip's count wears the chip's ink); only the
  tonal chip's count is `text.tertiary`, as Figma draws.

## Don't

- **Don't use a Chip as a status indicator.** That is `Badge` (generic) or
  `StatusTag` (VCP vocabulary).
- **Don't pass a node `label` without `removeLabel`** on a removable chip — the
  ✕ falls back to an anonymous "Remove".
- **Don't set `selected` without `onClick`.** A chip nobody can toggle should
  not claim a pressed state.
- **Don't nest a Chip inside another control** — it already contains buttons.
- **Don't build a "chips input" by hand.** That is `TagEditor` (to port), which
  composes this.
