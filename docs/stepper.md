# Stepper

A small number chosen by nudging: decrement, a typeable value, increment.
Capacity points, quantities, retry counts.

## When to use

| Use | For |
|---|---|
| `Stepper` | Small numbers whose neighbours matter — nudging is the natural gesture |
| `Input` + `inputMode="numeric"` | Free-form numbers with real range (a budget, a year) |
| `Select` | Numbers that are really named choices ("1 week", "2 weeks") |

If most users would type rather than click, the number is too big for a
stepper.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | required | Controlled — there is no uncontrolled mode; a nudger without state is meaningless |
| `onChange` | `(value: number) => void` | — | Fires clamped, from buttons, arrows, and commits |
| `min` / `max` / `step` | `number` | `0` / `999` / `1` | Buttons snap by `step`; typed values clamp but do not snap |
| `label` | `string` | — | The accessible name — "Capacity points". The buttons fold it in: "Decrease Capacity points" |
| `suffix` | `ReactNode` | — | Inline unit ('pts'). Decorative, `aria-hidden` |
| `size` | `sm \| md` | `md` | 32 / 40 — the Input scale (the export's 36 had no step here) |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | On the shell |
| `ref` | `Ref<HTMLDivElement>` | — | The shell |

## Typing is draft-based

The export clamped every keystroke — with `min=10`, typing "15" was
impossible (the "1" clamped to 10 before the "5" arrived). Here the field
holds a draft while focused: empty, `-`, half a number all pass through, and
the value commits — clamped — on blur or Enter. Arrow Up/Down nudge by `step`
from the keyboard. The nudge glyphs are minus/plus rather than the export's
left/right chevrons: nudging is arithmetic, not navigation.

## Tokens

The Input shell (`stroke.field` border, `stroke.focused` ring,
`surface.neutral.subtle` disabled). Value in the numeric face
(`font.family.numeric` at `caption-md` — the same treatment as DataTable's
numbers). Nudge glyphs `text.secondary` (10.35:1 light / 11.87:1 dark),
hover `surface.neutral.faint`. No new tokens.

## Accessibility

- The value is a real `<input inputMode="numeric">` — focusable, typeable,
  named by `label` (or a wrapping `Field`).
- Both buttons are named, with the field's name folded in, and they disable
  at the ends — state you can feel from the keyboard, not just see.
- Arrow Up/Down work in the field, matching what number inputs teach.
- The nudge buttons are 32 wide inside the field — the pointer-dense
  exemption; the keyboard path (type, or arrows) is first-class, not a
  fallback.

## Don't

- **Don't use it uncontrolled** — pass `value` and handle `onChange`; that is
  the whole contract.
- **Don't omit `label`** unless a `Field` label points at it — unnamed
  "Decrease" buttons in a form with three steppers are indistinguishable.
- **Don't put a unit in the value** ("12 pts" as text) — that is `suffix`.
- **Don't reach for it for large ranges** — clicking + forty times is not an
  interface.
