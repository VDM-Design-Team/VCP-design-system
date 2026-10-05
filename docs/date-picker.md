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
| Button = Yes | `clearable` (default **on**), `onClear`, `clearLabel` | Footer button, visible by default; `clearable={false}` turns it off. Label defaults to "Clear" |
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
| `clearable` | `boolean` | `true` | The footer Clear button. On by default; `false` hides it. The same button in the same place in the day and month views |
| `onClear` | `() => void` | — | What Clear does. The panel holds no value of its own to reset, so supply this whenever the button is shown |
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
- **The month heading is a toggle** in day and range mode. "Sep 2026 ▾" swaps
  the panel to the month grid, whose heading reads "2026 ▴" and swaps back;
  picking a month also goes back to its days, without choosing a date. The
  footer Clear button is outside the swap, so it is the same button in the same
  place in both views. In month mode on its own the heading draws the ▴ but is
  not a button — there are no days to go back to.
- **Dual view pages each calendar on its own**, as Figma draws it (June
  beside September), so both ends of a long range can be in view. The second
  starts one month after the first; a preset moves both to its ends. **The
  right calendar is always after the left** — never the same month, never
  before: the left's Next arrow and the right's Previous arrow disable where
  they would meet, and the month grids grey out the months that would cross.
- **Presets follow the mode.** A single-date picker (`day`, `month`) shows
  only the presets without a `rangeEnd` — Today; a range picker shows them
  all. With nothing left to show the column is dropped. On desktop the list
  is drawn like the system's dropdown menu: a 4 inset, square 40-high rows,
  12 either side, `surface.brand.faint` on hover, `.subtle` on press, and the
  current pick semibold on `.faint` (not `text.brand.medium`: it is 3.5:1 on that fill in dark). Figma doesn't define this list,
  so it is a proposal to test.
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
draws none). **Type (design review, 5 Oct 2026):** weekdays `caption-md-semibold`
`text.tertiary`; day and month cells `label-sm-regular` (14) `text.secondary`;
today's date and today's month `label-sm-semibold` `text.primary`; the days
between a range's ends `label-sm-medium` `text.primary`; the selected ends
`label-sm-semibold` `text.inverted.primary`; the heading `label-sm-medium`
`text.secondary`. All Poppins. Out-of-bounds days `text.disabled`.

**Header.** Previous and next are `IconButton tertiary sm` whose glyphs follow
**`neutral.textual.content`** — `default`, `hover`, `pressed` — not the action blue.
The heading is Figma's small textual button, filling the header's 24: the label in
`text.secondary`, a **12 filled caret** (`caret-down-fill` in the days, `caret-up-fill`
in the months) on the same neutral-textual colours, which change with the button's
state. Figma draws today's month ("Jun") medium; this makes it semibold, per the same
review.

**Pointer.** Day cells, month cells, quick picks, the heading and the arrows all show
the pointer cursor — Tailwind's preflight leaves buttons on the arrow.

**Range.** A range reads as unbroken bands: the calendar's grid is seven **36** columns
(Figma's 252) centred in the calendar, because a column that is not a whole number of
pixels — 260 ÷ 7 in the dual view — anti-aliases the seam between two tinted cells into a
visible line. Rows sit 35 apart (a 32 cell and 3 between), Figma's pitch.

**Dual view and popover sizes.** The dual panel is 685 × 329: a 118 quick-picks column
with a divider, then two 260 calendars 16 apart over 252 of height, 8 above the footer. In
a `Popover` use `width="auto"` and `panelClassName="p-0"`; the default popover is 288 wide
with 16 of padding, which pushed the 284 calendar out of its container with doubled spacing.

Neighbouring months' days are
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
| Pressed preset (touch row) — `text.primary` on `surface.neutral.subtle` | 18.41:1 | 10.35:1 |
| Pressed preset (desktop) — `text.primary` on `surface.brand.faint` | 17.34:1 | 13.23:1 |

Flagged stays the `accent.critical.tonal` pair (8.36:1 light / 12.00:1
dark); markers the accent filled surfaces. Presets (desktop) hover
`surface.brand.faint`, press `surface.brand.subtle`; the touch row uses
`surface.neutral.subtle` / `.medium`; separators
`stroke.default`; footer `Button secondary sm`.

**Type is on the ramp.** The earlier 16px `body-md` / `title-sm` mapping is gone: Figma's
`Label/sm` (14) and `Caption/md` (12) are ramp steps, so the cells and heading use them
directly. No new tokens; two icons (`caret-down-fill`, `caret-up-fill`) were added.

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
