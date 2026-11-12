# FilterBar

The filters above a list or table: a search field, Reset and a Filters button that shows or hides
the fields, then the labelled fields (priority, tags, status, date, people).

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
| `period` | `{ value?: { start?, end? }, onChange?, presets?, placeholder?, label? }` | A field that opens a two-month range calendar, labelled "Date" (`label` changes it). ISO `yyyy-mm-dd` in and out; the field reads `dd/mm/yyyy-dd/mm/yyyy`. `onChange({})` when cleared. `presets` are `DatePicker`'s quick picks |
| `cycle` | `{ options: Array<{ value, code, start, end }>, value?, onChange?, placeholder? }` | A one-pick `SearchSelect` with search. Each row reads **C33** (25/05/2026 - 08/06/2026), as in the AV details card (`start` and `end` are ISO `yyyy-mm-dd`); search matches the dates as well as the code; the field says just the code (`C33`), so it stays narrow. Placeholder defaults to "Select cycle" |
| `status` | `{ options, value?, onChange?, placeholder? }` | `SearchSelect` (several picks, no search box by default) with the Clear all / Apply footer, shown as a summary ("In progress", "3 selected") |
| `priority` | `{ options, value?, onChange?, placeholder? }` | `Select`. For "no filter" as a choice, add an "All priorities" option |
| `tags` | `{ options, value?, onChange?, placeholder? }` | `SearchSelect` with a search box and removable tags in the field. Options may carry a `group`. `searchable`, `searchPlaceholder` and `rows` (`text`, `avatar`, `icon`, `tag`) can be set on `status` and `tags` |
| `users` | `Array<{ label, options, value?, onChange?, placeholder?, multiple?, display? }>` | One `SearchSelect` per entry (Assignee, Initiator…) with avatars and search, named by its `label`; the placeholder defaults to "Select assignee". `multiple: true` takes and returns an array; a one-person field is `clearable`, so a picked person has a ✕ ("Clear Assignee"). `rows` defaults to `avatar` here. Options may carry `src` (a photo) or `unassigned` |
| `children` | `ReactNode` | More fields, in the same row, shown and hidden with the others |
| `onReset` / `resetLabel` | `() => void` / `string` | What Reset does. The button is always shown. Label defaults to "Reset" |
| `filtersOpen` / `onFiltersOpenChange` / `filtersLabel` | `boolean` / `(open) => void` / `string` | Whether the fields show. Uncontrolled (shown) when omitted |
| `className`, `ref`, rest | | On the root |

## Choosing which filters show

The bar draws exactly the filters you pass, and closes up around them. It has no idea about roles or
pages: the page decides.

| Page | What it passes |
|---|---|
| A page with every filter | `period`, `cycle`, `status`, `priority`, `tags` |
| A draft page (every row is a draft, so a status filter would filter nothing) | everything but `status` |
| An admin view that can also filter by person | the above plus `users` |
| A regular user's view of the same page | no `users` |
| A page with nothing to filter by | only `search` (the Filters button then claims no panel) |

`children` is there for a field no prop covers. Do not add a `hidden` or `visibleFor` prop to the bar:
leaving a prop out is already the switch, and role rules belong to the page that knows them.

## Layout

Built to Figma's Manage table (`940:167946`), decided 10 Nov 2026 for every list that uses the bar:

- **The top row**: the search at the left (up to 20rem), **Reset** and **Filters** at the right.
- **The fields**, under it, **each with its label above** (`text.primary`, label-sm medium, the same as
  `Field`'s), in Figma's order: **Priority, Tags, Status, Date** (the period), then Cycle, then the people
  (Assignee, Initiator…), then `children`. From `lg` six to a row, three from `md`, two below; each
  fills its cell. A Tags field holding many tags grows down, not across.
- **Below `md`** it stacks, as Figma's Mobile: Reset and Filters, then search, then the fields two across
  (Tags, Date and Cycle full width), and the calendar takes its touch layout, one month wide.
- **With the filters folded away** (Filters pressed, or a page that passes none) the fields and their labels
  go; the search and the buttons keep their row.
- A filled people field holds just the name ("Amy Lee"): its label above says which person it is (Figma `940:171256`).

**Design target: 1440.** With the expanded sidebar (256) and 32 of padding either side, the bar has 1120:
six fields of about 170 each, so Manage's six (Priority, Tags, Status, Date, Assignee, Initiator) fit on one row.

## Tokens

Spacing is the numeric scale (8 between everything). Every colour is the field
shells' own — `stroke.strong`, `surface.elevated`, `text.subtle` for the period
placeholder and `text.primary` once it has a value. No new tokens.

## Accessibility

- **The fields' edges are the neutral outline** (`neutral.outline.border.default`, slate-400: about 2.6:1 on white), lighter than the 3:1 `stroke.strong` every other field uses, because a whole row of dark outlines is noisy beside a table. This is a deliberate exception: each field here is also identified by its icon (the magnifier, the chevron, the calendar) and its placeholder, and an error, a warning and focus still draw their own stronger edge. If design wants the full 3:1 back, drop the `edge` prop on the fields in `FilterBar`.

- Each field is named by its visible label (`<label for>`): "Priority", "Tags", "Status", and the people by
  theirs, with the value after it ("Assignee Amy Lee"). The period button's name starts with its label, then
  the range ("Date, 09/09/2026-15/09/2026"), so what is read starts with what is on screen. The search field is
  named by its placeholder.
- Filters is a disclosure button: `aria-expanded` and `aria-controls` point at the
  fields. With no fields (a search-only bar) it claims no panel.
- Hidden fields stay mounted, so their uncommitted state survives a hide and show; they
  are out of the tab order and the accessibility tree while hidden.
- The period trigger is a real `<button>` opening the calendar in a `Popover`, not an
  input; the calendar is `DatePicker`, with its own grid keyboard model.

## Differences from the design

- **Field order and labels** are Manage's (`940:167946`): Priority, Tags, Status, Date, Assignee, Initiator,
  labelled. `_Filter_Bar` (`3094:8860`) drew unlabelled fields in another order (period first); Manage's wins
  (decided 10 Nov 2026). Cycle, which Manage doesn't have, follows Date.
- **Filters** is the filled (primary) button, as Manage draws it.
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
