# PeriodSelect *(component)*

A filter that picks a period: a month, or one of the named stretches you offer (sprints, cycles). The field says what is picked ("May 2026, Sprint 33 (1-15 May)"); the panel has the named periods down the left,
a year of months on the right, and **Clear**. Read off Figma's `_Holiday_Registry_Period_Selection` (`6155:40803`) and its "Datepicker with sprint selection".

## Composed of

| Piece | Tier |
|---|---|
| `Icon` | sub-atomic |
| `Input` | atom |
| `DateField` | component |
| `DatePicker` | component |
| `Popover` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `PeriodSelect` | Filtering a table by a month or a named period |
| `DateField` `mode="range"` | Picking exact start and end days in a form |
| `DateField` `mode="month"` | A month with no named periods |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` / `onChange` | `{ start, end } \| null` / `(period \| null) => void` | required | ISO dates. A month is its first and last day. `null` is no filter |
| `presets` | `DatePickerPreset[]` | — | The named periods: `{ label, value: start, rangeEnd: end }`. A pick that matches one reads after the month |
| `placeholder` | `string` | `Select Period` | Also the field's name unless `aria-label` is given |
| `emphasis` | `'regular' \| 'medium'` | `regular` | A row of filters sits quietly |
| `disabled`, `className` | | | |

## Behaviour

Choosing a month or a preset closes the panel; **Clear** empties the filter and closes it. `DatePicker` in month mode now shows range presets (a named stretch beside the months); in day mode it still hides them.

## Tokens

The field is `Input` with a trailing caret; the panel is `DatePicker`'s. No new tokens.

## Accessibility

A read-only `combobox` (it opens a panel); the presets are a "Quick picks" group of toggle buttons with `aria-pressed` on the current one, and the months are `DatePicker`'s grid with its keyboard.

## Don't

- **Don't put sprint arithmetic in here.** What a sprint is, and its dates, are the page's: pass them as `presets`.
