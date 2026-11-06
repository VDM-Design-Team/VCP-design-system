# Stepper *(atom)*

A small number chosen by nudging: decrement, a typeable value, increment.
Capacity points, quantities, retry counts.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

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
| `value` | `number \| null` | required | Controlled — there is no uncontrolled mode; a nudger without state is meaningless. `null` is a field with no value yet: it shows `placeholder` |
| `onChange` | `(value: number) => void` | — | Fires clamped, from buttons, arrows, and commits |
| `placeholder` | `string` | — | What an empty field says ("Set Budget"), in italic `text.tertiary`. It is a prompt, not a name: `label` still names the field |
| `commitDelay` | `number` (ms) | — | Commit what is typed after this long without a keystroke, without leaving the field, so whatever is derived from the value follows while it is typed. **Off by default** — a stepper commits on blur or Enter. See below |
| `onClear` | `() => void` | — | Called when the field is committed empty (cleared, then blur or Enter), so a person can take a value back to `null`. Without it an empty commit restores the number, as before |
| `min` / `max` / `step` | `number` | `0` / `999` / `1` | Buttons snap by `step`; typed values clamp but do not snap |
| `label` | `string` | — | The accessible name — "Capacity points". The buttons fold it in: "Decrease Capacity points" |
| `suffix` | `ReactNode` | — | Inline unit ('pts'). Decorative, `aria-hidden` |
| `variant` | `plus-minus \| up-down` | `plus-minus` | Where the nudge buttons sit: minus/plus either side of the value, or one up/down caret pair stacked at the end (the number-input layout) |
| `size` | `sm \| md` | `md` | 32 / 40 — the Input scale (the export's 36 had no step here) |
| `invalid` | `boolean` | `false` | Critical border + `aria-invalid` on the input. Pair with a visible message |
| `error` | `ReactNode` | — | Optional caption under the field. Implies `invalid`, is announced (`role="alert"`) and wired to the input with `aria-describedby`. Inside a `Field`, use the `Field`'s `error` instead |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | On the outer wrapper (the field plus its caption) |
| `ref` | `Ref<HTMLDivElement>` | — | The outer wrapper |

## Variants

| Variant | Layout | Glyphs | Use for |
|---|---|---|---|
| `plus-minus` | `[ − ] 12 [ + ]`, value centred | minus / plus | Counts where the nudge is the main gesture |
| `up-down` | `12 ▴▾`, value left-aligned like an `Input` | `caret-up-fill` / `caret-down-fill` at 12 | A number field in a form or table row that sits beside other inputs |

`up-down` is Figma's `_Number_Input_Step` pair. Same props, same draft-based
typing, same clamping — only the buttons move. Each caret is 28 wide and half
the field tall, so it is a pointer affordance: in `up-down` the carets are
`tabIndex={-1}` and Arrow Up/Down in the field is the keyboard path. Colours
are `neutral.textual.content` (hover `neutral.textual.content.hover`) on a
`neutral.outline.surface.hover` wash.

## An empty field

`value={null}` is a number not chosen yet — an unset budget. The field shows its `placeholder`; nudging **up** gives it the
minimum (the first number it can have) and the down caret is disabled, since there is nothing to step down to. Clearing the
field and leaving it calls `onClear`; the caller sets the value back to `null`.

## Holding a button

Press and hold a nudge button and it keeps stepping: it steps once as the press lands, waits 400 ms, then repeats every 70 ms
until the pointer is released or the value reaches the end it is heading for (`min` going down, `max` going up), where the
button disables. A single click is still one step, and holding up from an empty field gives it its first number and carries on.
The repeat is for the pointer; the keyboard path is Arrow Up and Down in the field, which repeat as the browser's key repeat
does, and Enter or Space on a focused button is one step.

## Only numbers

A stepper holds a number, so only one can be typed: digits, a leading minus when the range goes below zero (`min < 0`), and a
point when the steps are fractional. Anything else is dropped as it is typed, instead of being left to fail at commit.

## Committing after a pause

`commitDelay` commits what is typed after that many milliseconds without a keystroke, **without leaving the field** — "validated
after a brief pause". Use it where something is derived from the value and should follow it while it is typed (a budget's
Remaining and bar). It is **opt-in per stepper**: left off, a stepper commits on blur or Enter as above. An empty field or a lone
"-" waits for blur. A half-typed number is clamped like any other commit, so with a high `min` a pause after "1" commits "10":
leave it off where that would bite.

## Typing is draft-based

The export clamped every keystroke — with `min=10`, typing "15" was
impossible (the "1" clamped to 10 before the "5" arrived). Here the field
holds a draft while focused: empty, `-`, half a number all pass through, and
the value commits — clamped — on blur or Enter. Arrow Up/Down nudge by `step`
from the keyboard. The nudge glyphs are minus/plus rather than the export's
left/right chevrons: nudging is arithmetic, not navigation.

## Tokens

The Input's shell: a `stroke.strong` border, a
`stroke.focused` ring and a `surface.neutral.subtle` disabled fill. Value in the numeric face
(`font.family.numeric` at `caption-md` — the same treatment as DataTable's
numbers) for `plus-minus`; the `up-down` number-input layout reads like any `Input`, so its value is `body-sm-regular` in the UI face. Nudge glyphs `text.secondary` (10.35:1 light / 11.87:1 dark),
hover `surface.neutral.faint`. No new tokens.

## Error state

`invalid` draws the critical border (`accent.critical.outline.border.default`,
held through focus so the error stays legible); `error` adds the caption below
in `text-caption-md-medium` / `accent.critical.outline.content.default` — the
same treatment as `Field`'s message. Colour is never the only signal: the
caption says what is wrong, and `aria-invalid` says that something is.
A nudge button disabling at `min`/`max` is not an error and does not draw one.

## Accessibility

- The value is a real `<input inputMode="numeric">` — focusable, typeable,
  named by `label` (or a wrapping `Field`).
- Both buttons are named, with the field's name folded in, and they disable
  at the ends — state you can feel from the keyboard, not just see.
- Arrow Up/Down work in the field, matching what number inputs teach.
- In `up-down`, the carets are out of the tab order (still named, still
  clickable, still announced to touch screen readers); Arrow Up/Down in the
  field does the same job from the keyboard.
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
