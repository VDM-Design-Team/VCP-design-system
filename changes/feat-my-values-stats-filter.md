---
bump: minor
---
### `MyValuesStats` — the stats can filter the list (November 2026)

New `selected` and `onSelectedChange` props turn the stats into filters, as Figma's My Values page draws them (`State=Selected`, `State=Empty` and the click). Completed, Draft, Pending, Accepted, Active and Overdue can be pressed; pressing the selected one again clears it; a stat whose count is 0 cannot be pressed; Total AVs never filters. The selected stat is tinted (`surface.brand.faint`) and Completed's figure goes 24 bold. The strip only reports which stat: what each lists (Active is every custom status between Accepted and Completed; Overdue is by due date) is the page's, and the `MyValuesFilteredByStat` story on `AVListPage` shows it. Leave `onSelectedChange` off and nothing changes.
