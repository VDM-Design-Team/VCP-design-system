# DatePicker

The calendar panel, in the shapes the Figma `Date_Picker_VCP` set draws
(VCP Design Library, node 3169:1227): a day, a range or a month; one
calendar or two; desktop or touch; with or without quick picks and a footer
button. The panel only — the trigger-in-a-Popover composition is the
caller's (the InAPopover story shows it).

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## Figma variants → props

| Figma property | Prop | Notes |
|---|---|---|
| Mode = Day | `mode="day"` (default) | One date; `onChange(iso)` |
| Mode = Day & Range | `mode="range"` | Two clicks; `onRangeChange(start, end?)` |
| Mode = Month | `mode="month"` | A year of months; `onChange` gets the first of the month |
| Button = Yes | `onClear` (+ `clearLabel`) | Footer button; label defaults to "Clear" |
| Dual View = Yes | `dualView` | Two calendars, paging independently. Day and range mode |
| Mobile Friendly = Yes | `mobile` | `h-10` day targets, full width, presets as a scrolling row |
| Theme | — | Dark comes from the tokens, as in Figma's variable mode |

The quick-pick list Figma draws with Dual View and Mobile Friendly is
`presets` — available with any combination. In Storybook the first story's
controls flip every axis.

## When to use

| Use | For |
|---|---|
| `mode="day"` in a `Popover` | Picking one date a keyboard could also type |
| `mode="range"` + `dualView` + `presets` | Filtering by period on desktop (reports, task lists) |
| `mode="range"` + `mobile` | The same filter in a bottom sheet or full-width panel |
| `mode="month"` | Monthly views — budgets, planning months |
| `DatePicker` inline | Planning surfaces where the month *is* the page |
| `Input type="date"` *(plain)* | Quick forms where the native picker is fine |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `mode` | `'day' \| 'range' \| 'month'` | `'day'` | What a click picks |
| `value` | ISO `yyyy-mm-dd` | — | The day, the range start, or a day in the picked month |
| `onChange` | `(iso) => void` | — | Day mode: the day. Month mode: the month's first day |
| `rangeEnd` | ISO | — | With `value`, shades the span between and marks the end (any mode) |
| `onRangeChange` | `(start, end?) => void` | — | Range mode. First click → `end` undefined; second closes it |
| `month` / `onMonthChange` | ISO / `(iso) => void` | internal | Controlled visible month (the first calendar's in dual view) |
| `dualView` | `boolean` | `false` | Two calendars side by side |
| `mobile` | `boolean` | `false` | Touch layout |
| `presets` | `{ label, value, rangeEnd? }[]` | — | Quick picks; pressed while their dates are the value |
| `onClear` | `() => void` | — | Shows the footer button |
| `clearLabel` | `string` | `'Clear'` | Figma labels the range variant's button "Cancel" |
| `min` / `max` | ISO | — | Inclusive bounds; outside days and months disable, arrows refuse to leave |
| `markers` | `Record<iso, 'success' \| 'warning' \| 'danger'>` | `{}` | Dot under the day — pair with a legend |
| `flagged` | `string[]` | `[]` | Tinted unavailable-but-selectable days; ", flagged" joins the day's name |
| `today` | ISO | the real today | Drawn semibold, `aria-current="date"`. Stories pin it |
| `className` | `string` | — | On the panel (the InAPopover story strips its shadow inside the popover) |

## Behaviour

- **Range picking.** The first click starts a range (`onRangeChange(start)`),
  the second closes it (`onRangeChange(start, end)`). A click before the
  start, or any click once the range is closed, starts a new one. The panel
  never holds the range itself — `value` and `rangeEnd` stay the caller's.
- **The month heading opens the month grid** in day and range mode — the
  caret beside it promises that. Picking a month goes back to its days
  without choosing a date.
- **Dual view pages each calendar on its own**, as Figma draws it (June
  beside September), so both ends of a long range can be in view. The second
  starts one month after the first; a preset moves both to its ends.
- **Presets** apply their dates (through `onRangeChange` when they carry a
  `rangeEnd` or the mode is range, `onChange` otherwise) and page the
  calendar to them.
- Neighbouring months' days are drawn greyed, as in Figma, but are not
  targets — the arrows and month buttons get you there.

## Generic affordances, not VCP vocabulary

The export painted `capacity` load-dots and tinted `holidays` "from the
Holiday Registry" — planning domain, same ruling as Badge and Timeline.
`markers`, `flagged` and `presets` are the generic forms; the patterns own
the mapping. **"Overdue" and "Due Soon" are labels the caller resolves to
dates** — the panel only sees label → dates. **A marker dot means nothing
by itself** — the MarkersAndFlags story shows the legend the caller owes.

## Local-time ISO

Dates are ISO strings end to end, parsed and formatted in **local time**.
The export round-tripped through `toISOString()` (UTC), which shifts a
picked date to yesterday for anyone east of UTC — the classic date-picker
bug, fixed by never letting a `Date` cross a timezone.

## Tokens

Panel `surface.elevated`, `radius.md`, `shadow.menu`, no border (Figma
draws none). Header: `IconButton tertiary sm` chevrons tinted
`text.tertiary` as in Figma; heading `title-sm-semibold` `text.primary`.
Weekdays `caption-md-semibold` `text.tertiary`. Days in the numeric face,
`body-md-regular` `text.secondary`; today `body-md-semibold` `text.primary`;
out-of-bounds days `text.disabled`. Neighbouring months' days are
`text.subtle` (4.76:1 light / 5.71:1 dark) — **a deliberate step off
Figma**, which greys them with `text.disabled` (1.48:1). They're still
text a reader may want (which weekday is the 31st?), and axe fails them.

| Pair | Light | Dark |
|---|---|---|
| Selected / range ends — `text.inverted.primary` on `surface.brand.strong` | 6.18:1 | 8.73:1 |
| Between — `text.primary` on `surface.brand.faint` | 17.34:1 | 13.23:1 |
| Days — `text.secondary` on `surface.elevated` | 10.35:1 | 11.87:1 |
| Weekdays — `text.tertiary` on `surface.elevated` | 7.58:1 | 9.85:1 |
| Neighbouring days — `text.subtle` on `surface.elevated` | 4.76:1 | 5.71:1 |
| Pressed preset — `text.primary` on `surface.neutral.subtle` | 18.41:1 | 10.35:1 |

Flagged stays the `accent.critical.tonal` pair (8.36:1 light / 12.00:1
dark); markers the accent filled surfaces. Presets hover
`surface.neutral.subtle`, press `surface.neutral.medium`; separators
`stroke.default`; footer `Button secondary sm`.

**Type is mapped to the nearest ramp step.** Figma sets days and the
heading at 15 and weekdays at 11 — neither is on the ramp — so they use
`body-md`/`title-sm` (16) and `caption-md` (12). No new tokens.

## Accessibility

- **One tab stop per grid.** The day grid roves: arrows move by day (←→)
  and week (↑↓), and crossing the month edge pages the view and keeps focus
  on the target day. The month grid roves by month and by row of three,
  across years. `min`/`max` stop the roving at the bounds.
- Every day is a named button — "14 September 2026", with ", flagged"
  appended — selected days (both range ends) carry `aria-pressed`, today
  `aria-current="date"`. Months are named "September 2026".
- The heading is a polite live region: paging announces "October 2026"
  without stealing focus. Its button is named "September 2026, choose
  month".
- In dual view each calendar is a named group ("First calendar", "Second
  calendar"), so their two sets of month buttons are told apart.
- Presets are toggle buttons in a "Quick picks" group; `aria-pressed` says
  which one the current dates match.
- `mobile` cells are `h-10` to meet the 40 touch minimum; the desktop
  `h-8` cells are pointer-dense, like the `sm` controls.
- Deliberately **not** `role="grid"`: claiming grid promises header
  associations and cell semantics this panel doesn't need; named buttons
  with real keyboard behaviour beat a half-kept ARIA promise. The weekday
  row and the neighbouring months' days are decorative (`aria-hidden`).
- Marker dots are decorative and colour-only by nature — that is why the
  legend is the caller's obligation, and why nothing critical may ride on a
  dot alone.

## Don't

- **Don't use the desktop layout on touch screens** — `mobile` is what
  makes the days 40-point targets.
- **Don't compute what "Overdue" spans inside the panel's callers ad hoc** —
  resolve presets in the pattern that owns the domain, once.
- **Don't put capacity/holiday logic at call sites** — that mapping is the
  planning patterns' single job here.
- **Don't use two DatePickers for a range** — `dualView` is one picker with
  one range; two pickers can't shade a span across both.
- **Don't parse the ISO strings with `new Date(iso)` in callers** either —
  same UTC trap; split the string.
- **Don't rely on a marker dot to carry meaning** — legend, always.
