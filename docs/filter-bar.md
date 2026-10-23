# FilterBar

The row of filters above a list or table: a search field, the filter fields
(period, status, priority, tags), Reset, and a Filters button that shows or hides
the fields.

## Composed of

| Piece | Tier |
|---|---|
| `Button` | atom |
| `Icon` | atom |
| `Input` | atom |
| `Select` | atom |
| `DatePicker` | component |
| `SearchSelect` | component |
| `Popover` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `FilterBar` | Narrowing a list or table by several things at once |
| `Tabs` / `SegmentedControl` | One dimension with a few fixed views |
| `Select` / `SearchSelect` alone | A single filter on a form, not a bar of them |

## The filters are yours

Every filter is controlled. You pass its `options`, its `value` and an `onChange`;
the bar draws the field and reports changes. It filters nothing and keeps no values
(only whether the fields are shown). Leave a filter out and its field is not drawn.

| Prop | Type | Notes |
|---|---|---|
| `search` / `onSearchChange` | `string` / `(value) => void` | The search field. `searchPlaceholder` defaults to "Search by title or ID" |
| `period` | `{ value?: { start?, end? }, onChange?, presets?, placeholder? }` | A field that opens a two-month range calendar. ISO `yyyy-mm-dd` in and out; the field reads `dd/mm/yyyy-dd/mm/yyyy`. `onChange({})` when cleared. `presets` are `DatePicker`'s quick picks |
| `status` | `{ options, value?, onChange?, placeholder? }` | `SearchSelect` (several picks, no search box by default) with the Clear all / Apply footer, shown as a summary ("In progress", "3 selected") |
| `priority` | `{ options, value?, onChange?, placeholder? }` | `Select`. For "no filter" as a choice, add an "All priorities" option |
<<<<<<< HEAD
| `tags` | `{ options, value?, onChange?, placeholder? }` | `SearchSelect` with a search box and removable tags in the field. Options may carry a `group`. `searchable` and `searchPlaceholder` can be set on `status` and `tags` |
| `users` | `Array<{ label, options, value?, onChange?, placeholder?, multiple?, display? }>` | One `SearchSelect` per entry (Assignee, Initiator…) with avatars and search, named by its `label`; the placeholder defaults to "Select assignee". `multiple: true` takes and returns an array. `rows` defaults to `avatar` here. Options may carry `src` (a photo) or `unassigned` |
=======
| `tags` | `{ options, value?, onChange?, placeholder? }` | `SearchSelect` with a search box and removable tags in the field. Options may carry a `group`. `searchable`, `searchPlaceholder` and `rows` (`text`, `avatar`, `icon`, `tag`) can be set on `status` and `tags` |
>>>>>>> feat/filter-bar
| `children` | `ReactNode` | More fields, in the same row, shown and hidden with the others |
| `onReset` / `resetLabel` | `() => void` / `string` | What Reset does. The button is always shown. Label defaults to "Reset" |
| `filtersOpen` / `onFiltersOpenChange` / `filtersLabel` | `boolean` / `(open) => void` / `string` | Whether the fields show. Uncontrolled (shown) when omitted |
| `className`, `ref`, rest | | On the root |

## Layout

From `md` up, three columns — search (300) at the left, the fields, and Reset and
Filters at the right. The buttons stay at the top right; the fields right-align
between and wrap onto more lines when they do not fit, so a Tags field holding many
tags drops under the others. Below `md` it stacks, as Figma's Mobile: Reset and
Filters, then search, then the fields two across (period and tags full width), and
the calendar takes its touch layout, one month wide.

Fields are 40 tall: status and priority 160, user fields 176, period 240, tags at least 160 and as
wide as its tags need (up to 680).

## Tokens

Spacing is the numeric scale (8 between everything). Every colour is the field
shells' own — `stroke.strong`, `surface.elevated`, `text.subtle` for the period
placeholder and `text.primary` once it has a value. No new tokens.

## Accessibility

- Each field is named: `Status`, `Priority` and `Tags` by `aria-label`, the period
  button by its value ("Period, 09/09/2026-15/09/2026"), the search field by its
  placeholder.
- Filters is a disclosure button: `aria-expanded` and `aria-controls` point at the
  fields. With no fields (a search-only bar) it claims no panel.
- Hidden fields stay mounted, so their uncommitted state survives a hide and show; they
  are out of the tab order and the accessibility tree while hidden.
- The period trigger is a real `<button>` opening the calendar in a `Popover`, not an
  input; the calendar is `DatePicker`, with its own grid keyboard model.

## Differences from the design

- **Users follow tags.** Figma's bar draws Assignee and Initiator in its "current design" frame, not in `_Filter_Bar`; they are placed after tags, one `SearchSelect` each, with avatars and search.
- **Field order.** Period, status, priority, tags, as `_Filter_Bar`'s first row draws them.
  Its second row draws a filled version in another order (tags first); that is read as a state,
  not a layout.
- **Priority placeholder.** Figma reads "Search priority"; the field is a plain select, so it
  says "Select priority".
- **Status is a draft until Apply**, as the status menu draws; tags apply on every tick.
- **Active filters are not summarised on the Filters button** while the fields are hidden.

## Don't

- **Don't keep filter values inside the bar** — the page owns them, so a URL, a saved view
  and Reset can all agree.
- **Don't hide "Reset" when nothing is filtered** — it is a fixed control; `onReset` can do
  nothing.
- **Don't put actions in `children`** — they are fields. Page actions live beside the bar.
