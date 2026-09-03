# DatePicker

The calendar panel: one month of named day buttons, month navigation,
optional range shading, marker dots, flagged dates. The panel only — the
Input-in-a-Popover composition is the caller's (the InAPopover story shows
it).

## Composed of

| Piece | Tier |
|---|---|
| `IconButton` | atom |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `DatePicker` in a `Popover` | Picking a date a keyboard could also type |
| `DatePicker` inline | Planning surfaces where the month *is* the page |
| `Input type="date"` *(plain)* | Quick forms where the native picker is fine |
| A pattern (`PeriodSelector`, to port) | VCP periods — cycles, quarters |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | ISO `yyyy-mm-dd` | — | The selected day |
| `onChange` | `(iso) => void` | — | A day was picked |
| `month` / `onMonthChange` | ISO / `(iso) => void` | internal | Controlled visible month |
| `rangeEnd` | ISO | — | With `value`, shades the span between and marks the end |
| `min` / `max` | ISO | — | Inclusive bounds; outside days disable, arrows refuse to leave |
| `markers` | `Record<iso, 'success' \| 'warning' \| 'danger'>` | `{}` | Dot under the day — pair with a legend |
| `flagged` | `string[]` | `[]` | Tinted unavailable-but-selectable days; ", flagged" joins the day's name |
| `className` | `string` | — | On the panel (the InAPopover story strips border/shadow inside the popover) |

## Generic affordances, not VCP vocabulary

The export painted `capacity` load-dots and tinted `holidays` "from the
Holiday Registry" — planning domain, same ruling as Badge and Timeline.
`markers` and `flagged` are the generic forms; `PlanningTable`,
`HolidayForm` and friends own the mapping. **A marker dot means nothing by
itself** — the MarkersAndFlags story shows the legend the caller owes.

## Local-time ISO

Dates are ISO strings end to end, parsed and formatted in **local time**.
The export round-tripped through `toISOString()` (UTC), which shifts a
picked date to yesterday for anyone east of UTC — the classic date-picker
bug, fixed by never letting a `Date` cross a timezone.

## Tokens

Panel `surface.elevated` / `stroke.subtle` / `radius.md` / `shadow.menu`.
Nav is `IconButton tertiary sm` ("Previous month" / "Next month"). Weekday
row `label-sm` `text.subtle` (Monday-first — VCP plans in ISO weeks). Days
in the numeric face (`caption-md`); selected on `action.primary`; range
`surface.brand.faint`; flagged the `accent.critical.tonal` pair (8.36:1
light / 12.00:1 dark); markers the accent filled surfaces. No new tokens.

## Accessibility

- **One tab stop.** The day grid roves: arrows move by day (←→) and week
  (↑↓), and crossing the month edge pages the view and keeps focus on the
  target day. `min`/`max` stop the roving at the bounds.
- Every day is a named button — "14 September 2026", with ", flagged"
  appended — and the selected day carries `aria-pressed`.
- The month heading is a polite live region: paging announces "October 2026"
  without stealing focus.
- Deliberately **not** `role="grid"`: claiming grid promises header
  associations and cell semantics this panel doesn't need; named buttons
  with real keyboard behaviour beat a half-kept ARIA promise. The weekday
  row is decorative (`aria-hidden`) — the full date is in every button name.
- Marker dots are decorative and colour-only by nature — that is why the
  legend is the caller's obligation, and why nothing critical may ride on a
  dot alone.

## Don't

- **Don't put capacity/holiday logic at call sites** — that mapping is the
  planning patterns' single job here.
- **Don't use two DatePickers for a range** without wiring `value`/`rangeEnd`
  into both — the shading is the affordance that makes a range readable.
- **Don't parse the ISO strings with `new Date(iso)` in callers** either —
  same UTC trap; split the string.
- **Don't rely on a marker dot to carry meaning** — legend, always.
