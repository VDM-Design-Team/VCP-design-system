---
bump: minor
---
### `DetailCardMenu` — the ⋮ menu at the head of an Added Value page (October 2026)

New component, to Figma's `Detail_Card_Menu` and `AV_Options_Dropdown`: a 32 outlined ⋮ button that opens a `Menu` of Edit and Delete, with the moves between Draft, Pending and Backlog that the role (`user` or `admin`) and the status allow. The component owns which actions appear (a table in `docs/detail-card-menu.md`), so no page decides it again; it only reports each action.

### `DetailCard` — the facts about one Added Value (October 2026)

New pattern, to Figma's `Detail_Card` and `_Detail_Card_Item_*` rows. `type` picks which of the four cards it is (`viewing`, `duplicate` for an AV initiated to another domain, `editing`, `new`), each a fixed list of fields; `domain` trims it (Design has no Cycle, Development has every field). Values go in as `value` and out through `onChange`; the dropdowns' choices come as `options`; `errors` marks a field invalid. Reading uses `Chip`, `Tag`, `StatusTag`, `UrgencyTag`, `TypeTag`, `DueDateTag` (its due-soon colour computed from the date) and `CycleTag`; editing uses `SearchSelect`, `Input` and a `DatePicker` in a `Popover`. The viewers pill is a placeholder until Edit Viewers is built. UI Changes and Estimated Duration are not built.
