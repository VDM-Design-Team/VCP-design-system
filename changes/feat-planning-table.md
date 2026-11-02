---
bump: minor
---
### `PlanningTable` — the Planning list (November 2026)

New pattern, built to Figma's Planning Page: Added Values in collapsible Cycle and Backlog sections (caret, title, dates, Total Capacity and Capacity Remaining), ten columns, `DataTable` specialised as `AVTable` is. Start Date, Points and Due Date edit in place (`InlineEdit`, `InlineDateEdit`); the assignee shows their availability dot and tooltip (`AssigneeWithStatus`). Not included: the filter row and the animated cells, tracked separately.

`DataTable` columns can `fit` (hug their content) or `grow` (take the rest and truncate): the responsive pattern for every VCP table, applied to `AVTable` and `PlanningTable`. `Popover` gains `strategy="fixed"` (used by `InlineDateEdit`, so a date picker is not clipped by a scrolling table). `Tooltip` gains `wide`. `DataTable` gains `rowProps` (extra attributes for a row's `<tr>`) and `ColumnHint` an `icon` prop (the ƒ-in-a-ring for formula columns); both additive. `TypeTag` gains a hover tooltip (`tooltip`, on by default) and exports `AV_TYPE_MEANING` and `TYPE_COLUMN_HINT`; `UrgencyTag` and `StatusTag` export their column hints; `AVTable`'s Urgency, Type and Status headers now default to that copy. Sorting is a handler (`onSortChange`) — the table never reorders rows itself. Backlog rows can be dragged onto a Cycle (`onMoveRow`; the table moves nothing).

Stacked on the assignee availability PR (it uses `AssigneeWithStatus`).
