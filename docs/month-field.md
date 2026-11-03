# MonthField

A month and year chosen from a grid: a read-only field that reads "September 2026", and a month picker that opens under it.
Built to Figma's `_SuperAdmin_Metric_Month_Selector` (a text field with a trailing chevron, and the Date Picker in its month mode).

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | atom |
| `Input` | atom |
| `DatePicker` | component |
| `Popover` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `MonthField` | A month, with no day: a reporting period, a billing month |
| `DateField` | A date: a due date, a start date |
| `DatePicker` | The calendar on its own, inline |
| `Select` | A short list of named choices |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | — | The month, as any ISO `yyyy-mm-dd` date inside it. Empty shows the placeholder |
| `onChange` | `(iso: string) => void` | — | The **first of the chosen month**, ISO. The picker then closes |
| `placeholder` | `string` | `Select month` | Shown while there is no month |
| `invalid`, `disabled` | `boolean` | — | As `Input` |
| `picker` | `Omit<DatePickerProps, …>` | — | `min`, `max`, `today` and the rest go to the `DatePicker` |
| `aria-label`, `id`, `aria-describedby` | | | Names the field when no `Field` label does; `Field` sets the others |
| `className` | `string` | `w-full` | On the wrapper, which sets the field's width |

## Behaviour

- The trigger is `Input`, **read-only**, so the keyboard cannot type a malformed month. It is a `combobox`: it opens a picker.
- The picker is `DatePicker` in `month` mode in a `Popover`, aligned to the field's right edge and `strategy="fixed"`, so a scrolling
  dialog or table cannot clip it. Choosing a month closes it.
- `formatMonth` turns an ISO date into "September 2026". It reads in UTC, so no time zone can move the month.

## Tokens

The `Input`'s, unchanged (`stroke.strong` border, `stroke.focused` ring, 40 high), with a `caret-down` glyph after the text.
The picker's are `DatePicker`'s. No new tokens.

## Accessibility

- A read-only `combobox`, named by `aria-label` or a `Field` label; the month cells are buttons named "March 2026" with
  `aria-pressed` for the chosen one, and arrow keys move between them (`DatePicker`'s roving focus).
- Escape closes the picker and returns focus to the field.

## Don't

- **Don't use it for a date.** That is `DateField`.
- **Don't parse its text.** It is read-only; the value is the ISO date `onChange` hands you.
