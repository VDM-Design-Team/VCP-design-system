# HolidayTable *(pattern)*

The Holiday Registry: the filter row (holiday type, period, who it applies to) with **Add Holiday** and **Import from Hubstaff** for an admin, the table of holidays, and the pagination beneath.
Built to Figma's `_Holiday_Registry_Table` (`8056:126395`: with rows, and `Empty Table = Yes`) and `Holiday_Registry_Row` (`8048:120056`: Admin and Normal user).

## Composed of

| Piece | Tier |
|---|---|
| `Avatar` | atom |
| `Button` | atom |
| `Icon` | sub-atomic |
| `IconButton` | atom |
| `Pagination` | atom |
| `Badge` | atom |
| `Tag` | atom |
| `Tooltip` | atom |
| `TruncatedText` | component |
| `AvatarGroup` | component |
| `DataTable` | component |
| `DatePicker` | component |
| `EmptyState` | component |
| `TableCard` | component |
| `HolidayTypeTag` | component |
| `HolidaySourceBadge` | component |
| `DateField` | component |
| `SearchSelect` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HolidayTable` | The Holiday Registry page's list |
| `AVTable` / `PlanningTable` | Added Values — not this |

## The row

**Name** (cut with "…" when it does not fit, and says the whole name on hover and focus; a flagged one wears a warning glyph; its tooltip says Hubstaff already includes the entry), **Date** (one day or a range, `dd/mm/yyyy` or the person's locale (`useDateFormat`), then a blue pill with the day count, then, when `today` is given, its status: **Upcoming** (info), **Today** (success) or **Past** (neutral), as Figma's Date Status badge), **Holiday Type**, **Applies to** (a stack of people),
**All Day** (or Partial Day), **Recurring** (Yearly / One-Time), **Added By** ("System", or the person), **Source**; and for an admin **Actions** (edit, delete). A holiday the system added can be deleted but not edited.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `HolidayRow[]` | required | `{ id, name, duplicateOfHubstaff?, start, end?, type, appliesTo, allDay, recurring, addedBy, source }`. Rendered in the order given |
| `filters` / `onFiltersChange` | `HolidayFilters` / `(f) => void` | required | `{ type: '' \| HolidayType, period: Period \| null, user }`. The page filters; the table does not |
| `users` | `SearchSelectOption[]` | required | After "All Users" in the Applies to filter |
| `periodPresets` | `DatePickerPreset[]` | — | The sprints, passed in as the Period filter's presets (`{ label, value: start, rangeEnd: end }`) down the left of the month picker |
| `sort` / `onSortChange` | `DataTableSort` | — | Date sorts; the page sorts |
| `today` | `string` | — | What today is (ISO): the caller owns it. Given, each Date cell wears **Upcoming**, **Today** (today is one of its days) or **Past**; left out, none does |
| `admin` | `boolean` | `false` | Add Holiday, Import from Hubstaff and Actions |
| `onAdd` / `onImport` / `onEdit` / `onDelete` | | | Only report; the page opens `HolidayModal` or confirms the removal (`ConfirmDeleteModal`, until the "(Future)" dialog is designed) |
| `onResetFilters` | `() => void` | — | **Reset** in the "No holidays match your filters." message |
| `page` / `pageCount` / `onPageChange` | | | Pagination shows when `pageCount` and `onPageChange` are given |
| `itemCount` / `pageSize` / `onPageSizeChange` | | | The readout ("51-100 of 1,250") and the Items select |

**Two empty messages**, under the headers (the filters and paging stay): "No holidays have been added yet." when there are none, and **"No holidays match your filters."** with a **Reset** (`onResetFilters`) when a filter is on and nothing matches.

**Reset hands focus on.** Once the page puts the filters back, Reset goes; so after calling `onResetFilters` the table moves focus to its first filter (Holiday type) rather than let it fall to the page.

## Width

The columns need more room than a 1440 screen with the sidebar open gives them (about 1120), most of all when the Date column carries its status. The table then **scrolls sideways inside its own wrapper** and the page does not: the root can shrink (`min-w-0`) when it is a flex or grid item. Actions is the last column, reached by scrolling or by tabbing to it (focus brings it into view).

## Tokens

None new. The day count and the date status are `Badge`s (pill, 12): the tonal fill with its own outline (info for the count and Upcoming, success for Today, neutral for Past), since the outline-only style falls under 4.5:1 in dark. **Edit and delete are 40** (`IconButton` `md`, the touch minimum): the delete is `critical-tonal`, so its hover and pressed fills and its glyph change in every state. All Day / Partial Day are `Tag`s at 12 (`sm`), as Figma's Medium. The Name column has a 184 floor (`minWidth`); Recurring is medium weight, like Added By.

## Accessibility

- A real `<table>` (`DataTable`): headers with `scope`, `aria-sort` on Date. Every icon button names its row ("Edit Labour Day", "Delete Labour Day").
- **A row button also says whose holiday it is**, so two people's "Annual leave" are told apart: "Edit Annual leave, Jordan Lee", "Delete Annual leave, Sam Okafor". The name is the holiday, then the first person it applies to, then "and 2 others" when there are more. A public holiday is everyone's, so its name is enough ("Delete Labour Day").
- Pressing **Reset** never drops focus: it moves to the Holiday type filter.
- The flagged name's glyph is a focusable `img` named "Duplicate of a Hubstaff entry" and its tooltip opens on focus as well as hover.
- Type, source, all-day and the date status say it in words; none rides on colour.

## Don't

- **Don't filter, sort or page inside the table.**
- **Don't map a type or a source here**: `HolidayTypeTag` and `HolidaySourceBadge` own them.
- **Don't offer Edit on a system entry.**
- **Don't give it a fixed or minimum width** to stop it scrolling: it scrolls inside itself so the page does not.
