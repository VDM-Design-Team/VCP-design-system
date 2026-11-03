# DateField

A date in a form: a read-only field that shows it, and a calendar that picks it. Built to Figma's date fields
(a calendar glyph, then `2026-03-02`) in the Add Required Details dialog and the detail card.

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |
| `Input` | atom |
| `DatePicker` | component |
| `Popover` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DateField` | A date in a form, next to other fields |
| `InlineDateEdit` | A date in a table cell: read it, press the calendar, pick |
| `DatePicker` | The calendar alone — a filter, a panel |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `mode` | `'day' \| 'month'` | `'day'` | What it picks: a day, or a month with no day (see below). `DatePicker`'s own prop |
| `value` | `string` | — | ISO `yyyy-mm-dd` (in month mode, any day in the month). Empty shows the placeholder |
| `onChange` | `(iso) => void` | — | The chosen day (in month mode, the **first of the month**); the calendar then closes |
| `estimated` | `boolean` | — | A calculated date — reads "(est.)". Picking a day yourself is the cue to clear it. Day mode only |
| `placeholder` | `string` | `-` | While there is no date |
| `invalid` / `disabled` | `boolean` | — | As `Input` |
| `picker` | `DatePickerProps` | — | `min`, `max`, `today` … go to the calendar |
| `id`, `aria-describedby`, `aria-label` | | | From a `Field` (it hands them over), or name it yourself |

## Month mode

`mode="month"` is the same field for a month with no day — a reporting period, a billing month. It keeps the calendar glyph and
everything else, and changes three things: the field **reads "September 2026"** (`formatMonth`, read in UTC so no time zone can move
the month), the calendar opens on `DatePicker`'s **month grid**, and `onChange` gets the **first of the month**. `estimated` means
nothing for a month and is ignored. Use it where Figma draws a month selector (the super admin dashboard's); use `Select` for a
short list of named choices.

## Accessibility

- **A `combobox`, read-only.** It opens a calendar, so it takes the role that allows `aria-expanded`; being read-only, the
  keyboard cannot type a malformed date. Enter or Space opens the calendar.
- The calendar opens with `strategy="fixed"`, so a scrolling dialog or table cannot clip it; Escape closes it and returns focus.
- "(est.)" is in the field's value, so a screen reader hears it with the date.

## Don't

- **Don't type into it.** It is read-only on purpose; offer a way to clear it separately if the date is optional.
- **Don't leave "(est.)" on a date a person picked.**
