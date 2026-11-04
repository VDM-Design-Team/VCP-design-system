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
| `Tag` | atom |
| `Tooltip` | atom |
| `AvatarGroup` | component |
| `DataTable` | component |
| `DatePicker` | component |
| `EmptyState` | component |
| `HolidayTypeTag` | component |
| `HolidaySourceTag` | component |
| `PeriodSelect` | component |
| `SearchSelect` | component |

Generated from the real imports — `npm test` fails if this list drifts.

## When to use

| Use | For |
|---|---|
| `HolidayTable` | The Holiday Registry page's list |
| `AVTable` / `PlanningTable` | Added Values — not this |

## The row

**Name** (a flagged one wears a warning glyph; its tooltip says Hubstaff already includes the entry), **Date** (one day or a range, `dd/mm/yyyy`, then a blue pill with the day count), **Holiday Type**, **Applies to** (a stack of people),
**All Day** (or Partial Day), **Recurring** (Yearly / One-Time), **Added By** ("System", or the person), **Source**; and for an admin **Actions** (edit, delete). A holiday the system added can be deleted but not edited.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `HolidayRow[]` | required | `{ id, name, duplicateOfHubstaff?, start, end?, type, appliesTo, allDay, recurring, addedBy, source }`. Rendered in the order given |
| `filters` / `onFiltersChange` | `HolidayFilters` / `(f) => void` | required | `{ type: '' \| HolidayType, period: Period \| null, user }`. The page filters; the table does not |
| `users` | `SearchSelectOption[]` | required | After "All Users" in the Applies to filter |
| `periodPresets` | `DatePickerPreset[]` | — | The sprints down the left of the Period filter |
| `sort` / `onSortChange` | `DataTableSort` | — | Date sorts; the page sorts |
| `admin` | `boolean` | `false` | Add Holiday, Import from Hubstaff and Actions |
| `onAdd` / `onImport` / `onEdit` / `onDelete` | | | Only report; the page opens `HolidayModal` or confirms the removal |
| `page` / `pageCount` / `onPageChange` | | | Pagination shows when `pageCount` and `onPageChange` are given |
| `itemCount` / `pageSize` / `onPageSizeChange` | | | The readout ("51-100 of 1,250") and the Items select |

An empty `rows` shows "No holidays have been added yet." under the headers; the filters and paging stay.

## Tokens

None new. The duration pill is the info tonal `Tag` with the info outline (the outline-only style falls under 4.5:1 in dark at this size).

## Accessibility

- A real `<table>` (`DataTable`): headers with `scope`, `aria-sort` on Date. Every icon button names its row ("Edit Labour Day", "Delete Labour Day").
- The flagged name's glyph is a focusable `img` named "Duplicate of a Hubstaff entry" and its tooltip opens on focus as well as hover.
- Type, source and all-day say it in words; none rides on colour.

## Don't

- **Don't filter, sort or page inside the table.**
- **Don't map a type or a source here**: `HolidayTypeTag` and `HolidaySourceTag` own them.
- **Don't offer Edit on a system entry.**
