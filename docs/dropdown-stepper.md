# DropdownStepper

One choice from an ordered list, reachable two ways: step to the neighbour
with the arrows, or jump anywhere from the dropdown. Years, quarters, cycles.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Menu` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DropdownStepper` | An ordered list where "next" is the common move *and* jumping must stay possible (a year, a quarter, a cycle) |
| `Select` | An unordered closed list; the platform's own picker |
| `SearchSelect` | A list long enough that people type to find the entry |
| `Stepper` | A number nudged by `step`, not a named option |
| `Tabs` / `SegmentedControl` | Views that stay all visible — switching them is navigation |

The arrows change the **value**. They never go anywhere; if clicking "next"
should load a different page, that is `Pagination`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `options` | `(string \| { value, label, disabled? })[]` | required | Order is the stepping order. Strings are shorthand for `{ value, label }` |
| `value` / `defaultValue` | `string` | first option | Controlled, or uncontrolled with a starting value |
| `onChange` | `(value: string) => void` | — | From the arrows and from the dropdown |
| `label` | `string` | required | What is being chosen — "Year". Names every part (below) |
| `wrap` | `boolean` | `false` | Step past either end to the other. Off, the arrow disables at the end |
| `size` | `sm \| md` | `md` | 32 / 40 — the `Input` scale. Figma drew 32; 40 is the touch-safe default |
| `fullWidth` | `boolean` | `false` | Spans the container; the middle takes the slack |
| `invalid` | `boolean` | `false` | Critical border. Pair with a visible message |
| `error` | `ReactNode` | — | Optional caption under the control. Implies `invalid`, is announced (`role="alert"`) and wired to the dropdown with `aria-describedby`. Inside a `Field`, use the `Field`'s `error` instead |
| `disabled` | `boolean` | `false` | Disables all three controls and gives the shell the Input family's disabled look, the same as a disabled `Stepper`. An arrow that dies at the end of the list does not |
| `className` | `string` | — | On the outer wrapper (the control plus its caption) |
| `ref` | `Ref<HTMLDivElement>` | — | The outer wrapper |

A disabled option is stepped over by the arrows and shown disabled in the list.

## Tokens

| Part | Token | Utility |
|---|---|---|
| Shell | `surface.elevated`, `stroke.strong`, `shape.radius.md` | `bg-surface-elevated border-stroke-strong rounded-md` |
| Arrows and dropdown, resting | `neutral.outline.content.default` | `text-neutral-outline-content-default` |
| Hover | `neutral.outline.surface.hover` / `.content.hover` | `hover:bg-neutral-outline-surface-hover` |
| Pressed | `neutral.outline.surface.pressed` / `.content.pressed` | `active:bg-neutral-outline-surface-pressed` |
| Value | `text.primary`, `type.body.sm` medium | `text-text-primary text-body-sm-medium` |
| Border, invalid | `accent.critical.outline.border.default` | `border-accent-critical-outline-border-default` |
| Error caption | `accent.critical.outline.content.default`, `type.caption.md` medium | `text-accent-critical-outline-content-default text-caption-md-medium` |
| Disabled, text and glyphs | `text.disabled` | `disabled:text-text-disabled` |
| Disabled, shell (the `disabled` prop only) | `surface.neutral.subtle`, `stroke.subtle` | `bg-surface-neutral-subtle border-stroke-subtle cursor-not-allowed` |
| Focus ring | `stroke.focused`, drawn inward | `focus-visible:outline-2 focus-visible:-outline-offset-2` |

Figma draws the border `stroke.default`; the repo's rule is that a control's
boundary is `stroke.strong` (3:1 against the field), the same as `Input`,
`Select` and `Stepper` — so beside them nothing betrays which is which. No new
tokens.

## Accessibility

- Three real buttons: **Previous Year**, **Year: 2026** (the dropdown), **Next
  Year**. The dropdown's name contains its visible text, so voice control
  ("click 2026") finds it.
- The list is `Menu`'s: `aria-haspopup="menu"`, a roving tabindex, arrows,
  Escape, focus returned to the dropdown. The current option is a
  `menuitemradio` with `aria-checked` and a visible check — never colour alone.
- Every change — from an arrow or the list — updates a polite live region, so
  clicking **Next** does not change the value in silence while focus stays on
  the arrow.
- The arrow at an end is `disabled`, so the end is felt from the keyboard, not
  only seen. With `wrap` there is no end.
- `error` is a `role="alert"` caption referenced by the dropdown's
  `aria-describedby`; the border alone is never the only signal. There is no
  `aria-invalid` — it is not supported on a button.
- Arrows are 40 (`md`) / 32 (`sm`) wide; `sm` is the pointer-dense exemption.

## Don't

- **Don't use it for navigation.** If the arrows load another page, that is
  `Pagination`.
- **Don't use it for a long list.** Past a couple of dozen options, nobody steps
  — use `SearchSelect`.
- **Don't omit `label`.** Three unnamed buttons in a toolbar of three steppers
  are indistinguishable.
- **Don't recreate it from a `Select` plus two `IconButton`s.** The end-state,
  skip-disabled and announcement rules live here.
