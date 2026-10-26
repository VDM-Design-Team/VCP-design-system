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
<Chip size="md" tone="brand" avatar={<Avatar name="Marvin R" tone="brand" size="sm" />} label="Marvin R" />  // View
<Chip size="md" tone="brand" variant="outline" avatar={…} label="Marvin R" onRemove={remove} />          // Edit
<Chip size="md" disabled avatar={…} label="Marvin R" />                                                   // Disabled
```

**Assignee** — an avatar, a name with an "Assignee" line, and a count.

```tsx
<Chip size="md" tone="brand" avatar={<Avatar name="John Doe" tone="brand" size="sm" />}
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
| `size` | `sm \| md` | `sm` | 28 or 36 tall. `md` takes a 24 avatar with 6 around it (a 6px left edge, and the same 6 after the last button), as the people chips draw |
| `tone` | `default \| brand` | `default` | `brand` sets the text in `text.brand.strong`; `default` is `text.primary` |
| `onClick` | `() => void` | — | Makes the main region a real button |
| `selected` | `boolean` | — | Selected fill + `aria-pressed`. Only meaningful with `onClick` |
| `onRemove` | `() => void` | — | Renders the ✕ — always its own button and tab stop. In an `outline` chip it is a critical tonal round button, as the design draws it |
| `onEdit` / `editLabel` | `() => void` / `string` | — / `Edit ${label}` | Renders a pencil button before the ✕, its own control and tab stop. Name it with `editLabel` when `label` is not a string. In an `outline` chip both buttons are tonal round buttons, with 2 between them |
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
| Role line under the name (`description`) | `text.tertiary`, `caption-sm-medium`, directly under the name (no gap) | 6.51 / 8.91 on the tonal fill |
| Count (`md`: 14, `label-sm-medium`, numeric face) | `text.tertiary` on a tonal chip; the chip's own ink on an outline | 6.51 / 8.91 on the tonal fill |
| Divider before the count | `stroke.default`, 24 tall on `md` (6 above and below), decorative (`aria-hidden`) | — |
| Outline border | `stroke.brand.strong` on `surface.canvas` | 8.64 / 7.73 |
| Disabled | `surface.neutral.subtle` fill, `stroke.subtle` border, `text.disabled` (exempt from the contrast minimum) | — |
| Remove button, outline chip (tonal round) | `accent.critical.tonal` content on its surface: rest / hover / pressed | 6.85 / 6.90 / 8.42 light; 8.22 / 7.64 / 5.87 dark |
| Edit button (tonal round) | `text.brand.strong` on `surface.brand.faint` (hover and pressed: `subtle`) | 11.37 / 8.97 rest; 8.97 / 6.14 hover |
| Avatar in a people chip | `Avatar tone="brand"`: `surface.brand.subtle`, `text.brand.strong` initials | 8.97 / 6.14 |

The buttons are 24 (`md`) or 20 (`sm`) round circles with a 16 (`md`) or 14 (`sm`) glyph, side by side with 2 between them. The
pencil is Figma's `NotePencil`, the system's `note-pencil`. A pressed edit button keeps the hover fill: the next step up,
`surface.brand.medium`, would put the pencil at 2.56:1 in dark.

**Spacing on a 36 chip with an avatar.** The avatar has 6 on its left. At rest, with no buttons showing, the right edge is
**12** (6 left would be even by the numbers but looks cramped on the right); with the buttons showing it is **6**, the same as the
left, with 6 between the content and the buttons. With `actions="hover"` the chip rests at 12 and tightens to 6 as the buttons
slide in; the padding, the buttons' width and their fade all run for the same 150ms, so nothing jumps, and the transitions are skipped
under reduced motion. (The chip is the `group`, so its own padding reacts to its own `hover:` and `focus-within:`, not `group-hover:`.)

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

- **`md` is 36 tall, not Figma's 32.** It gives the avatar 6 all round and the name and role room from the edges, and lines up with
  `Button size="sm"` (36).
- **The "Assignee" line is `caption-sm-medium` (10), not Figma's 9.** 9 is not on the type ramp. It is `text.tertiary` and sits
  directly under the name.
- **The buttons are 24 round circles with a 16 glyph**, where Figma draws a 20 glyph in the 24 button; the 16 keeps a margin
  inside the tonal fill. They are tonal (a critical and a brand fill), 2 apart.
- **The count is the numeric face**, 14 on `md` (as Figma) and `caption-md-medium` on `sm`.
- **The divider is `stroke.default`**, 24 tall on `md`, so it matches the avatar's height; Figma's runs the full chip.
- **The avatar is the `Avatar` atom with `tone="brand"`** (initials on `surface.brand.subtle`, or a photo through `src`), with no ring.
- **Disabled follows `Input` and `Select`** (a grey fill and a subtle border), not a transparent chip with a strong border.

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
