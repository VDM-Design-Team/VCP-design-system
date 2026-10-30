---
bump: minor
---
### `DetailCardMenu` — the ⋮ menu at the head of an Added Value page (October 2026)

New component, to Figma's `Detail_Card_Menu` and `AV_Options_Dropdown`: a 32 outlined ⋮ button that opens a `Menu` of Edit and Delete, with the moves between Draft, Pending and Backlog that the role (`user` or `admin`) and the status allow. The component owns which actions appear (a table in `docs/detail-card-menu.md`), so no page decides it again; it only reports each action.
